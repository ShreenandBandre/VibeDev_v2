// filepath: /src/app/actions/get-file-summary.ts
"use server";

import { prisma } from "@/lib/prisma";
import { Groq } from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function generateSingleFileSummary(
  nodeId: string, 
  playgroundId: string,
  nodeType: "file" | "function" = "file"
) {
  if (!nodeId || !playgroundId) {
    return { success: false, error: "Missing key reference identifiers." };
  }

  try {
    let targetFile = null;
    let targetFunctionName = "";

    // 1. Resolve source code target
    if (nodeType === "function") {
      const repoMap = await prisma.repositoryMap.findUnique({
        where: { playgroundId }
      });
      
      const nodes = (repoMap?.nodes as any[]) || [];
      // Flexible ID lookup matching string variants
      const functionNode = nodes.find(n => String(n.id) === String(nodeId) || String(n._id) === String(nodeId));

      if (!functionNode) {
        return { success: false, error: "Target function missing from layout map." };
      }

      targetFunctionName = functionNode.label || functionNode.name || "unnamed_function";
      
      // Fallback matching fields across parentId and fileId structures
      const fileContainerId = functionNode.parentId || functionNode.fileId;
      if (fileContainerId) {
        targetFile = await prisma.templateFile.findUnique({
          where: { id: String(fileContainerId) }
        });
      }
    } else {
      targetFile = await prisma.templateFile.findUnique({
        where: { id: String(nodeId) },
      });
    }

    if (!targetFile) {
      return { success: false, error: `Unable to extract file layout. Checked Reference target: ${nodeId}` };
    }

    // 2. Optimization: Truncate context safely
    const rawContent = targetFile.content || "// Empty content channel file asset wrapper";
    const sourceContent = rawContent.length > 3500 
      ? rawContent.slice(0, 3500) + "\n...[truncated due to token window limits]" 
      : rawContent;

    // 3. System Prompt Construction
    const systemPrompt = nodeType === "function"
      ? `You are a senior technical architect analyzing the function "${targetFunctionName}". Provide a clear 2-sentence runtime capability summary and code complexity classification (Low, Medium, or High). Return ONLY a JSON object: { "summary": "string", "complexity": "string" }`
      : `You are a senior technical architect analyzing this source code file. Provide a clear 2-sentence layout architectural summary and modular complexity classification (Low, Medium, or High). Return ONLY a JSON object: { "summary": "string", "complexity": "string" }`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `File Name: ${targetFile.name}\n\nCode Content Stream:\n${sourceContent}` }
      ],
      temperature: 0.1,
      response_format: { type: "json_object" }
    });

    const rawAIResponse = completion.choices[0]?.message?.content || "{}";
    let aiResponse;
    try {
      aiResponse = JSON.parse(rawAIResponse);
    } catch {
      aiResponse = { summary: rawAIResponse, complexity: "Medium" };
    }

    // 4. Safely Update and Cache Summary Fields inside RepositoryMap
    const existingMap = await prisma.repositoryMap.findUnique({
      where: { playgroundId }
    });

    if (existingMap) {
      const currentSummaries = typeof existingMap.summaries === 'object' && existingMap.summaries !== null
        ? (existingMap.summaries as any)
        : {};

      // Store under both raw nodeId key values to handle UI lookup fallbacks
      const updatedSummaries = {
        ...currentSummaries,
        [nodeId]: {
          summary: aiResponse.summary || "No architectural description generated.",
          complexity: aiResponse.complexity || "Low"
        }
      };

      await prisma.repositoryMap.update({
        where: { playgroundId },
        data: { summaries: updatedSummaries }
      });
    }

    return { 
      success: true, 
      summary: aiResponse.summary || "Analysis phase complete.", 
      complexity: aiResponse.complexity || "Low" 
    };

  } catch (error: any) {
    console.error("AI Summary generation execution failure:", error);
    return { success: false, error: error.message || "Failed processing LLM response thread." };
  }
}
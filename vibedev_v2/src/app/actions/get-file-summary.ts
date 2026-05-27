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

    // 1. Resolve source code
    if (nodeType === "function") {
      const repoMap = await prisma.repositoryMap.findUnique({
        where: { playgroundId }
      });
      
      const nodes = (repoMap?.nodes as any[]) || [];
      const functionNode = nodes.find(n => (n.id === nodeId || n._id === nodeId));

      if (!functionNode) {
        return { success: false, error: "Target function missing from layout map." };
      }

      targetFunctionName = functionNode.label || functionNode.name;
      const fileContainerId = functionNode.parentId;
      if (fileContainerId) {
        targetFile = await prisma.templateFile.findUnique({
          where: { id: fileContainerId }
        });
      }
    } else {
      targetFile = await prisma.templateFile.findUnique({
        where: { id: nodeId },
      });
    }

    if (!targetFile) {
      return { success: false, error: "Unable to extract raw file source code." };
    }

    // 2. Optimization: Truncate content to 3500 chars to avoid hitting model context limits
    const sourceContent = targetFile.content.length > 3500 
      ? targetFile.content.slice(0, 3500) + "\n...[truncated]" 
      : targetFile.content;

    // 3. Optimized Prompt Assembly
    const systemPrompt = nodeType === "function"
      ? `You are a senior architect. Analyze function "${targetFunctionName}". Provide a 2-sentence summary and classification (Low/Medium/High complexity). Output ONLY valid JSON: { "summary": string, "complexity": string }`
      : `You are a senior architect. Analyze the provided file. Provide a 2-sentence summary and classification (Low/Medium/High complexity). Output ONLY valid JSON: { "summary": string, "complexity": string }`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `File: ${targetFile.name}\n\nCode:\n${sourceContent}` }
      ],
      temperature: 0.1, // Lowered for more deterministic output
      response_format: { type: "json_object" }
    });

    const rawContent = completion.choices[0]?.message?.content || "{}";
    const aiResponse = JSON.parse(rawContent);

    // 4. Cache summary
    const existingMap = await prisma.repositoryMap.findUnique({
      where: { playgroundId }
    });

    if (existingMap) {
      const updatedSummaries = {
        ...(typeof existingMap.summaries === 'object' ? (existingMap.summaries as any) : {}),
        [nodeId]: {
          summary: aiResponse.summary || "No description provided.",
          complexity: aiResponse.complexity || "Medium"
        }
      };

      await prisma.repositoryMap.update({
        where: { playgroundId },
        data: { summaries: updatedSummaries }
      });
    }

    return { 
      success: true, 
      summary: aiResponse.summary, 
      complexity: aiResponse.complexity 
    };

  } catch (error: any) {
    console.error("AI Summary generation error:", error);
    return { success: false, error: error.message || "Failed to process AI request." };
  }
}
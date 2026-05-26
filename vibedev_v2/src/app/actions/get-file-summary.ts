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

    // 1. Resolve where the source code text resides
    if (nodeType === "function") {
      // Find the map entry to learn what function name and file container matches this nodeId
      const repoMap = await prisma.repositoryMap.findUnique({
        where: { playgroundId }
      });
      
      const nodes = (repoMap?.nodes as any[]) || [];
      const functionNode = nodes.find(n => (n.id === nodeId || n._id === nodeId));

      if (!functionNode) {
        return { success: false, error: "Target function profile element missing from layout map context." };
      }

      targetFunctionName = functionNode.label || functionNode.name;
      
      // Look up code text via the file identifier backlink map
      const fileContainerId = functionNode.parentId || functionNode.fileId;
      if (fileContainerId) {
        targetFile = await prisma.templateFile.findUnique({
          where: { id: fileContainerId }
        });
      }
    } else {
      // Pure File analysis string lookup
      targetFile = await prisma.templateFile.findUnique({
        where: { id: nodeId },
      });
    }

    if (!targetFile) {
      return { success: false, error: "Unable to extract raw file source code text stream to analyze." };
    }

    // 2. Prompt assembly rules using the new Groq JSON matching requirement
    const systemPrompt = nodeType === "function"
      ? `You are an expert architect. Read the provided file contents and focus EXCLUSIVELY on analyzing the method/function named "${targetFunctionName}". Provide a concise, 2-sentence summary detailing what this specific logic routine manages. Also classify its operational complexity as 'Low', 'Medium', or 'High'. You must output your response in a raw valid RFC-compliant JSON object matching this structure: { "summary": "...", "complexity": "..." }`
      : `You are an expert architect. Read the provided file contents and provide a concise, 2-sentence summary of what this code file handles. Also classify its complexity as 'Low', 'Medium', or 'High'. You must output your response in a raw valid RFC-compliant JSON object matching this structure: { "summary": "...", "complexity": "..." }`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Context Asset: ${targetFile.name}\nSource Code:\n${targetFile.content}` }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const aiResponse = JSON.parse(completion.choices[0]?.message?.content || "{}");

    // 3. Cache structural summary to RepositoryMap block object mapping key
    const existingMap = await prisma.repositoryMap.findUnique({
      where: { playgroundId }
    });

    if (existingMap) {
      const updatedSummaries = {
        ...(existingMap.summaries as Record<string, any> || {}),
        [nodeId]: {
          summary: aiResponse.summary || "No description compiled.",
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
    console.error("Incremental context generation dropped:", error);
    return { success: false, error: error.message };
  }
}
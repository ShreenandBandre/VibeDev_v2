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
      const functionNode = nodes.find(n => String(n.id) === String(nodeId) || String(n._id) === String(nodeId));

      if (!functionNode) {
        return { success: false, error: "Target function missing from layout map." };
      }

      targetFunctionName = functionNode.label || functionNode.name || "unnamed_function";
      
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
      return { success: false, error: `Unable to extract file layout. Reference target: ${nodeId}` };
    }

    const rawContent = targetFile.content || "// Empty content channel file asset wrapper";
    const sourceContent = rawContent.length > 5000 
      ? rawContent.slice(0, 5000) + "\n...[truncated due to token window limits]" 
      : rawContent;

    // 2. Comprehensive System Prompt Setup
    const systemPrompt = nodeType === "function"
      ? `You are a world-class code intelligence engine and runtime debugger. Your goal is to dissect the function "${targetFunctionName}" located inside the provided file code content.
         Analyze the function completely and return a strict JSON object with this shape:
         {
           "summary": "A high-level overview explaining the true core purpose and intent of this function in 2 clear sentences.",
           "complexity": "Low" | "Medium" | "High",
           "howItWorks": "A detailed, step-by-step technical breakdown of the internal logic, state mutations, calculations, and execution path inside the function.",
           "howToUse": "Explicit technical documentation on how to call this function. Detail its parameter types, returns, and include a clear usage pattern example.",
           "debuggingHazards": "Identify structural issues, potential runtime crashes, silent bugs, unhandled async states, or optimization anti-patterns present in this block. If it looks perfectly secure, outline edge-cases to watch out for."
         }`
      : `You are an advanced technical architect inspecting this source file. Analyze the code and return a strict JSON object with this shape:
         {
           "summary": "A concise architectural summary of what role this file plays in the system module hierarchy.",
           "complexity": "Low" | "Medium" | "High",
           "howItWorks": "A breakdown of the top-level exports, components, or structural patterns that compose this file asset.",
           "howToUse": "Instructions or standard import/consumption patterns for utilizing this file or its primary symbols.",
           "debuggingHazards": "Structural risks, layout vulnerabilities, state coupling, or dependencies that developers should watch out for when modifying this file."
         }`;

    // 3. Requesting analysis with JSON formatting guarantees
    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile", // Upgraded model capacity for profound contextual reasoning
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Context Target File: ${targetFile.name}\n\nCodebase Stream Input:\n${sourceContent}` }
      ],
      temperature: 0.2,
      response_format: { type: "json_object" }
    });

    const rawAIResponse = completion.choices[0]?.message?.content || "{}";
    let aiResponse;
    try {
      aiResponse = JSON.parse(rawAIResponse);
    } catch {
      aiResponse = { 
        summary: rawAIResponse, 
        complexity: "Medium", 
        howItWorks: "Detailed structural data unparseable.", 
        howToUse: "N/A", 
        debuggingHazards: "Review syntax streams manually." 
      };
    }

    // 4. Update the DB Workspace Map summaries cache
    const existingMap = await prisma.repositoryMap.findUnique({ where: { playgroundId } });
    if (existingMap) {
      const currentSummaries = typeof existingMap.summaries === 'object' && existingMap.summaries !== null
        ? (existingMap.summaries as any)
        : {};

      const updatedSummaries = {
        ...currentSummaries,
        [nodeId]: {
          summary: aiResponse.summary,
          complexity: aiResponse.complexity,
          howItWorks: aiResponse.howItWorks,
          howToUse: aiResponse.howToUse,
          debuggingHazards: aiResponse.debuggingHazards
        }
      };

      await prisma.repositoryMap.update({
        where: { playgroundId },
        data: { summaries: updatedSummaries }
      });
    }

    return { 
      success: true, 
      content: rawContent,
      ...aiResponse
    };

  } catch (error: any) {
    console.error("AI deep analytics error:", error);
    return { success: false, error: error.message || "Failed processing intelligence engine matrix." };
  }
}

export async function executeContextualAIQuery({
  codeContent,
  fileName,
  userPrompt,
  mode = "chat"
}: {
  codeContent: string;
  fileName: string;
  userPrompt: string;
  mode: "chat" | "predict";
}) {
  if (!codeContent) return { success: false, error: "No code content context available." };

  try {
    const systemPrompt = mode === "predict"
      ? `You are an advanced architectural change predictor. The user has modified or plans to modify the provided source code file (${fileName}).
         Analyze their proposed changes/intent: "${userPrompt}" against the file code.
         Predict cascading failures, architectural breakages, missing imports, or component lifecycle dependencies across the wider app module tree.
         Be concise, highly technical, and focus exclusively on impact analysis.`
      : `You are an expert AI software developer embedded inside a code editor. You are looking at "${fileName}".
         Answer the developer's question accurately using the provided code content as your primary ground truth context. 
         Keep explanations developer-focused, sharp, and provide code blocks if requested.`;

    const completion = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `File: ${fileName}\n\nCode Base String:\n${codeContent.slice(0, 6000)}\n\nDeveloper Input: ${userPrompt}` }
      ],
      temperature: mode === "predict" ? 0.1 : 0.3,
    });

    return {
      success: true,
      response: completion.choices[0]?.message?.content || "No evaluation could be compiled."
    };
  } catch (err: any) {
    console.error("AI Context interaction failed:", err);
    return { success: false, error: err.message || "Execution failure." };
  }
}
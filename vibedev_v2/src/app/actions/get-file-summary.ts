// filepath: /src/app/actions/get-file-summary.ts
"use server";

import { prisma } from "@/lib/prisma"; // path to your Prisma client initializer instance

export async function generateSingleFileSummary(
  nodeId: string, 
  playgroundId: string, 
  nodeType: "file" | "function"
) {
  try {
    // 1. Fetch AI summary values if they exist
    const repoMap = await prisma.repositoryMap.findUnique({
      where: { playgroundId }
    });
    
    const cachedSummaries = (repoMap?.summaries as Record<string, any>) || {};
    const nodeMeta = cachedSummaries[nodeId] || {};

    let actualRawContent = "";

    // 2. 🚀 THE MAGIC LINK: Pull the real code asset string directly from TemplateFile collection
    if (nodeType === "file") {
      const dbFile = await prisma.templateFile.findUnique({
        where: { id: nodeId },
        select: { content: true }
      });
      if (dbFile) {
        actualRawContent = dbFile.content;
      }
    } else if (nodeType === "function") {
      // If it's a sub-function node, look up its parent tracking file instead
      // (Assuming your node payload passes the correct parent relation ID)
      const graphNodes = (repoMap?.nodes as any[]) || [];
      const functionNode = graphNodes.find(n => n.id === nodeId);
      const parentFileId = functionNode?.fileId || functionNode?.parentId;

      if (parentFileId) {
        const dbFile = await prisma.templateFile.findUnique({
          where: { id: parentFileId },
          select: { content: true }
        });
        if (dbFile) actualRawContent = dbFile.content;
      }
    }

    return {
      success: true,
      summary: nodeMeta.summary || "No AI architectural summary logged yet.",
      complexity: nodeMeta.complexity || "Low",
      rawContent: actualRawContent // 👈 This returns the true file data to your store!
    };
  } catch (error: any) {
    console.error("Database resolution trace dropped:", error);
    return { success: false, summary: "", complexity: "Low", rawContent: "" };
  }
}
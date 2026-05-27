// filepath: /src/app/actions/get-visualizer-data.ts
"use server";

import { prisma } from "@/lib/prisma";

export async function getRepositoryTopology(playgroundId: string) {
  if (!playgroundId) return { success: false, error: "Missing playground reference." };

  try {
    // 1. Query the primary RepositoryMap document
    const repoMap = await prisma.repositoryMap.findUnique({
      where: { playgroundId },
    });

    if (!repoMap) {
      return { 
        success: false, 
        error: "Repository architecture layout map not generated yet." 
      };
    }

    // 2. Fetch all files for this playground to retrieve their raw content
    const allFiles = await prisma.templateFile.findMany({
      where: { playgroundId },
      select: { id: true, content: true }
    });

    // Create a map for O(1) lookup
    const fileContentMap = new Map(allFiles.map(f => [f.id, f.content]));

    // 3. Extract and normalize nodes
    const rawNodes = (repoMap.nodes as any[]) || [];
    const edges = (repoMap.edges as any[]) || [];

    const nodes = rawNodes.map((node: any) => {
      const nodeId = node.id || node._id?.toString();
      
      return {
        id: nodeId,
        label: node.label || node.name || "unnamed_entity",
        type: node.type || "file",
        path: node.path || "",
        parentId: node.parentId || node.fileId || null,
        // INJECTION: Attach the content if it's a file node
        content: node.type === 'file' ? (fileContentMap.get(nodeId) || "") : ""
      };
    });

    console.log(`\n📦 [Topology Synced] Playground ID: ${playgroundId}`);
    console.log(`📁 Folders: ${nodes.filter(n => n.type === "folder").length}`);
    console.log(`📄 Files: ${nodes.filter(n => n.type === "file").length}`);
    console.log(`🔗 Links: ${edges.length}\n`);

    return {
      success: true,
      status: repoMap.status,
      nodes,
      edges,
      summaries: repoMap.summaries || {},
    };
  } catch (error: any) {
    console.error("CRITICAL: Failed fetching workspace layout topology:", error);
    return { success: false, error: error.message };
  }
}
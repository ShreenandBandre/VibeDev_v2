// filepath: /src/app/actions/get-visualizer-data.ts
"use server";

import { prisma } from "@/lib/prisma";

export async function getRepositoryTopology(playgroundId: string) {
  if (!playgroundId) return { success: false, error: "Missing playground reference." };

  try {
    // 1. Query the primary RepositoryMap document directly
    const repoMap = await prisma.repositoryMap.findUnique({
      where: { playgroundId },
    });

    if (!repoMap) {
      return { 
        success: false, 
        error: "Repository architecture layout map not generated yet. Trigger Parse Architecture to map assets." 
      };
    }

    // 2. Extract arrays directly from your JSON fields
    const rawNodes = (repoMap.nodes as any[]) || [];
    const edges = (repoMap.edges as any[]) || [];

    // 3. Normalize structure safely while passing down content parameters
    const nodes = rawNodes.map((node: any) => ({
      id: node.id || node._id?.toString(),
      _id: node._id?.toString() || node.id,
      label: node.label || node.name || "unnamed_entity",
      name: node.name || node.label || "unnamed_entity",
      type: node.type || "file", 
      path: node.path || "",
      parentId: node.parentId || node.fileId || null,
      
      // 🚀 CRITICAL FIX: Pass data attributes so memory lookups succeed
      content: node.content || node.rawContent || "",
      summary: node.summary || null,
      complexity: node.complexity || null,
      data: {
        id: node.id || node._id?.toString(),
        fileId: node.fileId || node.parentId || null,
        content: node.content || node.rawContent || "",
        summary: node.summary || null,
        complexity: node.complexity || null,
        ...(node.data || {})
      }
    }));

    // Debugging counters to verify collection states in your backend server console
    console.log(`\n📦 [Topology Synced] Playground ID: ${playgroundId}`);
    console.log(`📁 Folders:  ${nodes.filter(n => n.type === "folder").length}`);
    console.log(`📄 Files:    ${nodes.filter(n => n.type === "file").length}`);
    console.log(`ƒ Functions: ${nodes.filter(n => n.type === "function").length}`);
    console.log(`🔗 Links:     ${edges.length}\n`);

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
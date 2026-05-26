// filepath: /src/app/actions/visualizer-engine.ts
"use server";

import { prisma } from "@/lib/prisma";

export async function analyzeRepositoryArchitecture(playgroundId: string) {
  if (!playgroundId) return { success: false, error: "Missing sandbox target parameter." };

  try {
    // 1. Put the database map state into ANALYZING mode immediately
    await prisma.repositoryMap.upsert({
      where: { playgroundId },
      create: { playgroundId, nodes: [], edges: [], status: "ANALYZING" },
      update: { status: "ANALYZING" }
    });

    // 2. Fetch all raw files linked to this project workspace
    const dbFiles = await prisma.templateFile.findMany({
      where: { playgroundId },
    });

    if (!dbFiles || dbFiles.length === 0) {
      await prisma.repositoryMap.update({
        where: { playgroundId },
        data: { status: "FAILED" }
      });
      return { success: false, error: "No files found inside workspace to parse." };
    }

    const nodes: any[] = [];
    const edges: any[] = [];

    // 3. 🚀 HIGH-SPEED TYPESCRIPT PARSER: Generate standard File & Folder structure instantly
    dbFiles.forEach((file) => {
      // Add the file or folder node itself
      nodes.push({
        id: file.id,
        label: file.name,
        type: file.isFolder ? "folder" : "file",
        parentId: file.parentId || null,
        path: file.path
      });

      // If this item has a parent directory, establish a "contains" linkage edge relation
      if (file.parentId) {
        edges.push({
          id: `edge-contains-${file.parentId}-${file.id}`,
          source: file.parentId,
          target: file.id,
          type: "contains"
        });
      }

      // 4. 🧠 EXTRACT FUNCTIONS LOCALIZED VIA REGEX: Zero token expenditure!
      // If it's a code file, look inside its raw text stream to discover declared functions
      if (!file.isFolder && file.content) {
        // Matches common naming targets: function Name(), const Name = () =>, export async function Name()
        const functionRegex = /(?:export\s+)?(?:async\s+)?function\s+([a-zA-Z0-9_]+)|const\s+([a-zA-Z0-9_]+)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g;
        let match;
        const discoveredNames = new Set<string>();

        while ((match = functionRegex.exec(file.content)) !== null) {
          const functionName = match[1] || match[2];
          
          // Skip generic words or duplicates
          if (functionName && !discoveredNames.has(functionName) && !["keys", "values", "map", "forEach"].includes(functionName)) {
            discoveredNames.add(functionName);

            const functionNodeId = `func-${file.id}-${functionName}`;

            // Push function subcomponent directly into the node list array
            nodes.push({
              id: functionNodeId,
              label: `${functionName}()`,
              type: "function",
              parentId: file.id, // Linked cleanly back to its parent container code file
              path: file.path
            });

            // Create a "calls/defines" relationship trace connection line
            edges.push({
              id: `edge-call-${file.id}-${functionNodeId}`,
              source: file.id,
              target: functionNodeId,
              type: "calls"
            });
          }
        }
      }
    });

    // 5. Save the perfectly formed topology straight back to your MongoDB instance
    await prisma.repositoryMap.update({
      where: { playgroundId },
      data: {
        nodes: nodes,
        edges: edges,
        status: "COMPLETED",
        lastAnalyzed: new Date()
      }
    });

    return { success: true, nodesCount: nodes.length, edgesCount: edges.length };

  } catch (error: any) {
    console.error("Local Topology Engine Parsing Thread Encountered An Error:", error);
    
    await prisma.repositoryMap.update({
      where: { playgroundId },
      data: { status: "FAILED" }
    }).catch(() => {});

    return { success: false, error: error.message };
  }
}
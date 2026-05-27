"use server";

import { prisma } from "@/lib/prisma"; 
import { auth } from "@/auth"; 
import { Templates } from "@prisma/client";

interface CloneRepoResponse {
  success: boolean;
  playgroundId?: string;
  error?: string;
}

interface SyncResponse {
  success: boolean;
  message?: string;
  error?: string;
}

function parseGitHubUrl(url: string): { owner: string; repo: string } | null {
  const regex = /github\.com\/([^/]+)\/([^/.]+)(?:\.git)?/;
  const match = url.match(regex);
  if (!match) return null;
  return { owner: match[1], repo: match[2] };
}

export async function cloneGitHubRepository(
  repoUrl: string,
  workspaceType: "personal" | "team",
  activeOrgId: string | null
): Promise<CloneRepoResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "401: Unauthorized request signature." };
    }

    const targetUrlInfo = parseGitHubUrl(repoUrl);
    if (!targetUrlInfo) {
      return { success: false, error: "Invalid GitHub Repository target link layout syntax." };
    }

    const { owner, repo } = targetUrlInfo;

    const repoMetaUrl = `https://api.github.com/repos/${owner}/${repo}`;
    const metaResponse = await fetch(repoMetaUrl, {
      headers: { Accept: "application/vnd.github.v3+json" },
      next: { revalidate: 0 }
    });

    if (!metaResponse.ok) {
      return { success: false, error: "Repository resource not found or private infrastructure profile." };
    }

    const repoMetaData = await metaResponse.json();
    const defaultBranch = repoMetaData.default_branch || "main";

    const treeApiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`;
    const treeResponse = await fetch(treeApiUrl, {
      headers: { Accept: "application/vnd.github.v3+json" },
      next: { revalidate: 0 }
    });

    if (!treeResponse.ok) {
      return { success: false, error: "Failed compiling repository directory architecture logs." };
    }

    const treeData = await treeResponse.json();
    const rawTreeElements = treeData.tree || [];

    const playground = await prisma.playground.create({
  data: {
    title: repo,
    description: `GitHub Source: ${repoUrl}`,
    template: Templates.REACT,
    userId: session.user.id,
    // Ensure this matches your Prisma Schema field name (e.g., organizationId)
    organizationId: workspaceType === "team" ? activeOrgId : null, 
  },
});

    const filteredTree = rawTreeElements.filter((file: any) => {
      const skippedExtensions = [".png", ".jpg", ".jpeg", ".ico", ".woff", ".woff2", ".mp4", "package-lock.json", ".git"];
      return !skippedExtensions.some((ext) => file.path.endsWith(ext));
    });

    const filesToInsert = [];

    for (const gitNode of filteredTree) {
      const pathSegments = gitNode.path.split("/");
      const fileName = pathSegments[pathSegments.length - 1];
      let fileTextContent = "";

      if (gitNode.type === "blob") {
        try {
          const blobUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${gitNode.path}?ref=${defaultBranch}`;
          const blobRes = await fetch(blobUrl, {
            headers: { Accept: "application/vnd.github.v3.raw" },
            next: { revalidate: 0 }
          });
          if (blobRes.ok) {
            fileTextContent = await blobRes.text();
          }
        } catch (fetchErr) {
          console.warn(`Skipping data payload download stream pass for file block: ${gitNode.path}`, fetchErr);
        }
      }

      filesToInsert.push({
        playgroundId: playground.id,
        name: fileName,
        path: gitNode.path,
        content: fileTextContent,
        isFolder: gitNode.type === "tree",
      });
    }

    if (filesToInsert.length > 0) {
      await prisma.templateFile.createMany({
        data: filesToInsert,
      });
    }

    await prisma.repositoryMap.create({
      data: {
        playgroundId: playground.id,
        nodes: [],
        edges: [],
        summaries: {},
      },
    });

    // 🚀 LOG REPO CREATION EVENT TO CHANGELOG STREAM
    await prisma.activityLog.create({
      data: {
        title: "Repository Imported",
        description: `Successfully mirrored original timeline architecture sequence for ${owner}/${repo}.`,
        type: "GIT_CLONE",
        userId: session.user.id,
        organizationId: workspaceType === "team" ? activeOrgId : null,
      }
    });

    return { success: true, playgroundId: playground.id };
  } catch (error: any) {
    console.error("Critical Git Synchronization Module Engine Failure:", error);
    return { success: false, error: error.message || "Internal transaction operation runtime break." };
  }
}

/**
 * ACTION 2: Delta Pull Sync Engine with Stream Broadcasting
 */
export async function syncRepositoryUpstream(
  playgroundId: string,
  repoUrl: string
): Promise<SyncResponse> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "401: Unauthorized identity session check." };
    }

    const targetUrlInfo = parseGitHubUrl(repoUrl);
    if (!targetUrlInfo) {
      return { success: false, error: "Invalid repository remote configuration link map." };
    }
    
    const { owner, repo } = targetUrlInfo;

    // 1. Fetch remote branch details
    const metaRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { next: { revalidate: 0 } });
    if (!metaRes.ok) return { success: false, error: "Upstream repository missing or flagged private access." };
    const metaData = await metaRes.json();
    const branch = metaData.default_branch || "main";

    // 2. Fetch full remote architecture array
    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, { next: { revalidate: 0 } });
    if (!treeRes.ok) return { success: false, error: "Failed compiling remote Git file tree layout." };
    const treeData = await treeRes.json();
    const remoteTree: any[] = treeData.tree || [];

    // 3. Extract existing local database files for mapping operations
    const localFiles = await prisma.templateFile.findMany({
      where: { playgroundId: playgroundId }
    });

    const localFileMap = new Map(localFiles.map(f => [f.path, f]));
    const remotePaths = new Set(remoteTree.map(r => r.path));

    const filteredRemoteTree = remoteTree.filter((file: any) => {
      const skippedExtensions = [".png", ".jpg", ".jpeg", ".ico", ".woff", ".woff2", ".mp4", "package-lock.json", ".git"];
      return !skippedExtensions.some((ext) => file.path.endsWith(ext));
    });

    let filesUpdatedCount = 0;
    let filesCreatedCount = 0;

    // 4. Atomic Upsert Loop for created and modified nodes
    for (const remoteNode of filteredRemoteTree) {
      let contentString = "";

      if (remoteNode.type === "blob") {
        try {
          const blobUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${remoteNode.path}?ref=${branch}`;
          const blobRes = await fetch(blobUrl, {
            headers: { Accept: "application/vnd.github.v3.raw" },
            next: { revalidate: 0 }
          });
          if (blobRes.ok) {
            contentString = await blobRes.text();
          }
        } catch (err) {
          console.warn(`Skipping synchronization fetch path pass: ${remoteNode.path}`);
        }
      }

      const pathSegments = remoteNode.path.split("/");
      const fileName = pathSegments[pathSegments.length - 1];
      const localMatch = localFileMap.get(remoteNode.path);

      if (localMatch) {
        if (localMatch.content !== contentString) {
          await prisma.templateFile.update({
            where: { id: localMatch.id },
            data: { content: contentString, name: fileName }
          });
          filesUpdatedCount++;
        }
      } else {
        await prisma.templateFile.create({
          data: {
            playgroundId: playgroundId,
            name: fileName,
            path: remoteNode.path,
            content: contentString,
            isFolder: remoteNode.type === "tree"
          }
        });
        filesCreatedCount++;
      }
    }

    // 5. Delete removed assets 
    const filesToDelete = localFiles.filter(f => !remotePaths.has(f.path));
    const filesDeletedCount = filesToDelete.length;
    if (filesDeletedCount > 0) {
      await prisma.templateFile.deleteMany({
        where: { id: { in: filesToDelete.map(f => f.id) } }
      });
    }

    // Get playground data to preserve proper organization scope context mapping
    const originalPlayground = await prisma.playground.findUnique({
      where: { id: playgroundId }
    });

    // 6. Update timestamp signature values 
    await prisma.playground.update({
      where: { id: playgroundId },
      data: { updatedAt: new Date() }
    });

    // 🚀 7. BROADCAST FRESH DELTA METRICS TO PLATFORM CHANGELOG LIVE STREAM
    await prisma.activityLog.create({
      data: {
        title: `Pulled Upstream: ${repo}`,
        description: `Synced fresh commits from '${branch}'. Logs: ${filesCreatedCount} added, ${filesUpdatedCount} modified, ${filesDeletedCount} dropped.`,
        type: "GIT_SYNC",
        userId: session.user.id,
        organizationId: originalPlayground?.organizationId || null,
      }
    });

    return { success: true, message: "Workspace synced with upstream changes smoothly!" };
  } catch (err: any) {
    console.error("Critical Upstream Pull Syncer Engine Crash:", err);
    return { success: false, error: err.message || "Failed running upstream update routines." };
  }
}
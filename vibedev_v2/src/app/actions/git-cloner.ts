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

    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "github"
      }
    });

    if (!account || !account.access_token) {
      return { success: false, error: "GitHub token missing from database record." };
    }

    const token = account.access_token;
    const commonHeaders = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "NextJS-App-Client"
    };

    const targetUrlInfo = parseGitHubUrl(repoUrl);
    if (!targetUrlInfo) {
      return { success: false, error: "Invalid GitHub Repository target link layout syntax." };
    }

    const { owner, repo } = targetUrlInfo;

    const repoMetaUrl = `https://api.github.com/repos/${owner}/${repo}`;
    const metaResponse = await fetch(repoMetaUrl, {
      headers: commonHeaders,
      cache: "no-store" // 🚀 No cache taaki purana layout data fetch na ho loop mein
    });

    if (!metaResponse.ok) {
      return { success: false, error: "Repository resource not found or private infrastructure profile." };
    }

    const repoMetaData = await metaResponse.json();
    const defaultBranch = repoMetaData.default_branch || "main";

    const treeApiUrl = `https://api.github.com/repos/${owner}/${repo}/git/trees/${defaultBranch}?recursive=1`;
    const treeResponse = await fetch(treeApiUrl, {
      headers: commonHeaders,
      cache: "no-store"
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
      
      // 🚀 Fix: Clear default fallback schema for both blobs and directories
      let fileTextContent = gitNode.type === "tree" ? "{}" : "";

      if (gitNode.type === "blob") {
        try {
          const blobUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${gitNode.path}?ref=${defaultBranch}`;
          const blobRes = await fetch(blobUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github.v3.raw",
              "User-Agent": "NextJS-App-Client"
            },
            cache: "no-store"
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

    // 🚀 CRITICAL FIX FOR CANVAS: Seed standard initial snapshot layout mapping variables
    // Taaki blank repo layout crash na kare canvas nodes rendering parser ko
    await prisma.repositoryMap.create({
      data: {
        playgroundId: playground.id,
        nodes: [
          {
            id: "root",
            type: "customRoot",
            data: { label: repo, path: "Root" },
            position: { x: 250, y: 50 }
          }
        ],
        edges: [],
        summaries: { root: "Imported Workspace Base Structure Layout Cluster." },
      },
    });

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
 * ACTION 2: Delta Pull Sync Engine with Authentication Updates Included
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

    const account = await prisma.account.findFirst({
      where: { userId: session.user.id, provider: "github" }
    });

    if (!account || !account.access_token) {
      return { success: false, error: "Missing sync engine verification clearance keys." };
    }

    const token = account.access_token;
    const commonHeaders = {
      Authorization: `Bearer ${token}`,
      Accept: "application/vnd.github.v3+json",
      "User-Agent": "NextJS-App-Client"
    };

    const targetUrlInfo = parseGitHubUrl(repoUrl);
    if (!targetUrlInfo) {
      return { success: false, error: "Invalid repository remote configuration link map." };
    }
    
    const { owner, repo } = targetUrlInfo;

    const metaRes = await fetch(`https://api.github.com/repos/${owner}/${repo}`, { 
      headers: commonHeaders,
      next: { revalidate: 0 } 
    });
    if (!metaRes.ok) return { success: false, error: "Upstream repository missing or flagged private access structural restrictions." };
    const metaData = await metaRes.json();
    const branch = metaData.default_branch || "main";

    const treeRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/git/trees/${branch}?recursive=1`, { 
      headers: commonHeaders,
      next: { revalidate: 0 } 
    });
    if (!treeRes.ok) return { success: false, error: "Failed compiling remote Git file tree layout." };
    const treeData = await treeRes.json();
    const remoteTree: any[] = treeData.tree || [];

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

    for (const remoteNode of filteredRemoteTree) {
      let contentString = "";

      if (remoteNode.type === "blob") {
        try {
          const blobUrl = `https://api.github.com/repos/${owner}/${repo}/contents/${remoteNode.path}?ref=${branch}`;
          const blobRes = await fetch(blobUrl, {
            headers: {
              Authorization: `Bearer ${token}`,
              Accept: "application/vnd.github.v3.raw",
              "User-Agent": "NextJS-App-Client"
            },
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

    const filesToDelete = localFiles.filter(f => !remotePaths.has(f.path));
    const filesDeletedCount = filesToDelete.length;
    if (filesDeletedCount > 0) {
      await prisma.templateFile.deleteMany({
        where: { id: { in: filesToDelete.map(f => f.id) } }
      });
    }

    const originalPlayground = await prisma.playground.findUnique({
      where: { id: playgroundId }
    });

    await prisma.playground.update({
      where: { id: playgroundId },
      data: { updatedAt: new Date() }
    });

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
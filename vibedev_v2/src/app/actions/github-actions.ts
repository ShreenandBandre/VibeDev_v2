"use server";

import { prisma } from "@/lib/prisma";

interface FilePayload {
  filename: string;
  rawContent: string;
}

interface DirectCommitPayload {
  playgroundId?: string;
  owner?: string;
  repo?: string;
  branch: string;
  message: string;
  token?: string;
  files: FilePayload[];
}

function sanitizeToken(token?: string): string {
  if (!token) return "";
  let clean = token.trim();
  if (clean.startsWith('"') && clean.endsWith('"')) clean = clean.slice(1, -1);
  if (clean.startsWith("'") && clean.endsWith("'")) clean = clean.slice(1, -1);
  return clean;
}

async function resolveRepoCredentials(payload: DirectCommitPayload) {
  const checkToken = sanitizeToken(payload.token);
  if (payload.owner && payload.repo && checkToken !== "") {
    return {
      owner: payload.owner,
      repo: payload.repo,
      token: checkToken,
      branch: payload.branch,
    };
  }

  const pId = payload.playgroundId;
  let targetMap = null;

  if (pId) {
    targetMap = await prisma.repositoryMap.findUnique({
      where: { playgroundId: pId }
    });
  }

  const finalOwner = targetMap?.ownerName || payload.owner || "";
  const finalRepo = targetMap?.repositoryName || payload.repo || "";
  let finalToken = sanitizeToken(targetMap?.githubToken || payload.token);

  if (!finalToken) {
    finalToken = sanitizeToken(process.env.NEXT_PUBLIC_GITHUB_PAT || process.env.GITHUB_WEBHOOK_SECRET);
  }

  if (!finalRepo || !finalOwner) {
    throw new Error(`Repository fields missing in configuration push. Owner: "${finalOwner}", Repo: "${finalRepo}"`);
  }

  return {
    owner: finalOwner,
    repo: finalRepo,
    token: finalToken,
    branch: payload.branch
  };
}

// 🌐 1. FETCH RECENT LIVE COMMITS FROM GITHUB REMOTE
export async function fetchRemoteGitHubCommits(ownerOrPlaygroundId: string, repo?: string, token?: string) {
  if (!ownerOrPlaygroundId) return { success: false, data: [] };
  
  let targetOwner = repo ? ownerOrPlaygroundId : ""; 
  let targetRepo = repo || "";
  let targetToken = sanitizeToken(token);

  try {
    if (!repo || !targetToken) {
      const targetMap = await prisma.repositoryMap.findUnique({
        where: { playgroundId: ownerOrPlaygroundId }
      });

      if (targetMap) {
        targetOwner = targetMap.ownerName || "";
        targetRepo = targetMap.repositoryName || "";
        targetToken = sanitizeToken(targetMap.githubToken);
      }
    }

    if (!targetToken) {
      targetToken = sanitizeToken(process.env.NEXT_PUBLIC_GITHUB_PAT || process.env.GITHUB_WEBHOOK_SECRET);
    }

    console.log("----------------------------------------");
    console.log(`📡 [VCS LOG ENGINE] Sync Details:`);
    console.log(`👤 Owner: "${targetOwner}"`);
    console.log(`📦 Repo:  "${targetRepo}"`);
    console.log(`🔑 Token: ${targetToken ? "✅ LOADED" : "❌ EMPTY"}`);
    console.log("----------------------------------------");

    if (!targetOwner || !targetRepo) {
      return { 
        success: false, 
        error: `Database fields are empty. Fill 'ownerName' and 'repositoryName' for playgroundId: "${ownerOrPlaygroundId}" via Prisma Studio.`,
        data: [] 
      };
    }

    const headers: HeadersInit = { 
      "Accept": "application/vnd.github+json",
      "X-GitHub-Api-Version": "2022-11-28"
    };
    
    if (targetToken) {
      headers["Authorization"] = targetToken.startsWith("ghp_") || targetToken.startsWith("github_pat_")
        ? `Bearer ${targetToken}`
        : `token ${targetToken}`;
    }

    const apiUrl = `https://api.github.com/repos/${targetOwner}/${targetRepo}/commits?per_page=5`;
    const res = await fetch(apiUrl, { headers, cache: "no-store" });

    if (!res.ok) {
      throw new Error(`GitHub API Status Exception: ${res.status}. Route: ${apiUrl}`);
    }
    
    const data = await res.json();
    if (!Array.isArray(data)) throw new Error("Malformed JSON array standard returned from GitHub.");

    const formattedLogs = data.map((c: any) => ({
      sha: c.sha ? c.sha.substring(0, 7) : "unknown",
      message: c.commit?.message || "No commit message",
      author: `@${c.author?.login || c.commit?.author?.name || "anonymous"}`,
      date: c.commit?.author?.date 
        ? new Date(c.commit.author.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : "N/A"
    }));

    return { success: true, data: formattedLogs };
  } catch (err: any) {
    console.error("❌ Failed fetching live github tracking stream:", err);
    return { success: false, error: err.message, data: [] };
  }
}

// 🚀 2. DISPATCH LIVE TRANSACTION COMMIT GRID
export async function pushLiveCommitTreeToGitHub(payload: DirectCommitPayload) {
  const { files, message } = payload;
  if (!files || files.length === 0) return { success: false, error: "Staging cluster arrays are empty." };

  try {
    const config = await resolveRepoCredentials(payload);
    if (!config.token) return { success: false, error: "Missing authentication token credentials." };

    const authHeader: HeadersInit = { 
      "Accept": "application/vnd.github+json",
      "Content-Type": "application/json",
      "X-GitHub-Api-Version": "2022-11-28"
    };
    authHeader["Authorization"] = config.token.startsWith("ghp_") || config.token.startsWith("github_pat_")
      ? `Bearer ${config.token}`
      : `token ${config.token}`;

    console.log(`📡 Initializing Git Tree Upstream for ${config.owner}/${config.repo} [${config.branch}]`);

    const baseRefRes = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/git/ref/heads/${config.branch}`, { headers: authHeader, cache: "no-store" });
    if (!baseRefRes.ok) throw new Error(`Branch pointer lookup error: ${baseRefRes.status}`);
    const baseRefData = await baseRefRes.json();
    const activeCommitSha = baseRefData.object.sha;

    const baseCommitRes = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/git/commits/${activeCommitSha}`, { headers: authHeader, cache: "no-store" });
    const baseCommitData = await baseCommitRes.json();
    const baseTreeSha = baseCommitData.tree.sha;

    const treeNodes = files.map(file => ({
      path: file.filename,
      mode: "100644",
      type: "blob",
      content: file.rawContent
    }));

    const createTreeRes = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/git/trees`, {
      method: "POST",
      headers: authHeader,
      body: JSON.stringify({ base_tree: baseTreeSha, tree: treeNodes }),
      cache: "no-store"
    });
    if (!createTreeRes.ok) throw new Error(`Tree node creation error: ${createTreeRes.status}`);
    const newTreeData = await createTreeRes.json();

    const createCommitRes = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/git/commits`, {
      method: "POST",
      headers: authHeader,
      body: JSON.stringify({ message, tree: newTreeData.sha, parents: [activeCommitSha] }),
      cache: "no-store"
    });
    const compiledCommitData = await createCommitRes.json();

    const updateRefRes = await fetch(`https://api.github.com/repos/${config.owner}/${config.repo}/git/refs/heads/${config.branch}`, {
      method: "PATCH",
      headers: authHeader,
      body: JSON.stringify({ sha: compiledCommitData.sha, force: false }),
      cache: "no-store"
    });
    if (!updateRefRes.ok) throw new Error("Reference pointer head updating operation rejected.");

    return { 
      success: true, 
      sha: compiledCommitData.sha.substring(0, 7),
      date: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
  } catch (error: any) {
    console.error("❌ GitHub Tree Transaction execution crash:", error);
    return { success: false, error: error.message };
  }
}
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export interface GitHubRepoDto {
  id: number;
  name: string;
  fullName: string;
  description: string | null;
  htmlUrl: string;
  isPrivate: boolean;
  updatedAt: string;
  language: string | null;
  defaultBranch: string;
}

export async function getUserGitHubRepositories(): Promise<{ success: boolean; data?: GitHubRepoDto[]; error?: string }> {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return { success: false, error: "401: Unauthorized request signature." };
    }

    // 1. Fetch the user's OAuth account access token straight from the database
    const account = await prisma.account.findFirst({
      where: {
        userId: session.user.id,
        provider: "github"
      }
    });

    if (!account || !account.access_token) {
      return { success: false, error: "GitHub account link missing. Please log in again via GitHub." };
    }

    // 2. Fetch all user repos (both owned and collaborated on) sorted by recent updates
    const githubResponse = await fetch("https://api.github.com/user/repos?sort=updated&per_page=50", {
      headers: {
        Authorization: `Bearer ${account.access_token}`,
        Accept: "application/vnd.github.v3+json",
      },
      next: { revalidate: 0 } // Always bypass caching for fresh live feeds
    });

    if (!githubResponse.ok) {
      return { success: false, error: "Failed to download your repository profile index from GitHub." };
    }

    const rawRepos = await githubResponse.json();
    
    // 3. Normalize data object structures safely for the client side code layers
    const mappedRepos: GitHubRepoDto[] = rawRepos.map((repo: any) => ({
      id: repo.id,
      name: repo.name,
      fullName: repo.full_name,
      description: repo.description,
      htmlUrl: repo.html_url,
      isPrivate: repo.private,
      updatedAt: repo.updated_at,
      language: repo.language,
      defaultBranch: repo.default_branch
    }));

    return { success: true, data: mappedRepos };
  } catch (error: any) {
    console.error("GitHub Repo Fetch Exception Error:", error);
    return { success: false, error: error.message || "Failed reading remote profiles context handles." };
  }
}
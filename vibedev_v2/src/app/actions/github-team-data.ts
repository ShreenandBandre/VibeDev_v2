"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

/**
 * Fetches PRs and Repo activity for a specific team context.
 * We fetch this server-side to keep tokens hidden.
 */
export async function getTeamGitHubActivity(orgId: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // 1. Verify membership
  const membership = await prisma.orgMember.findUnique({
    where: { organizationId_userId: { organizationId: orgId, userId: session.user.id } }
  });
  if (!membership) throw new Error("Forbidden access to this team space");

  // 2. Fetch data (Example: Using GitHub API)
  // You would typically store a 'githubOrgName' in your Organization DB model
  const org = await prisma.organization.findUnique({ where: { id: orgId } });
  if (!org?.githubOrgName) return { repositories: [], pullRequests: [] };

  // Example proxy to GitHub API (Add your fetch logic here)
  const repos = await fetch(`https://api.github.com/orgs/${org.githubOrgName}/repos`, {
    headers: { Authorization: `Bearer ${process.env.GITHUB_PAT}` }
  }).then(res => res.json());

  return { repositories: repos };
}
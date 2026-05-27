"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getWorkspaceProjects(workspaceType: "personal" | "team" | string, orgId: string | null) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  // Normalize the input type to match our internal logic
  const type = workspaceType.toLowerCase() === "personal" ? "personal" : "team";

  // 🚀 DEVELOPER SANDBOX SHORT-CIRCUIT
  if (type === "team" && orgId === "mock-vibedev-org-id") {
    return [];
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });

  if (!user) throw new Error("User context not found");

  // Handle Team Workspace Query
  if (type === "team" && orgId) {
    // If it's our mock ID, return empty (already handled above, but here for safety)
    if (orgId === "mock-vibedev-org-id") return [];

    const membership = await prisma.orgMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: user.id
        }
      }
    });

    if (!membership) throw new Error("Forbidden access to this team space");

    return await prisma.playground.findMany({
      where: { organizationId: orgId },
      include: {
        repositoryMap: { select: { lastAnalyzed: true } }
      },
      orderBy: { updatedAt: "desc" }
    });
  }

  // Handle Personal Workspace Query
  // Note: We filter by userId and explicitly ensure organizationId is null
  return await prisma.playground.findMany({
    where: {
      userId: user.id,
      organizationId: null
    },
    include: {
      repositoryMap: { select: { lastAnalyzed: true } }
    },
    orderBy: { updatedAt: "desc" }
  });
}
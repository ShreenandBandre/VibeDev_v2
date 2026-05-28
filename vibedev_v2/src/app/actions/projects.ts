"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getWorkspaceProjects(workspaceType: "personal" | "team" | string, orgId: string | null) {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });

  if (!user) throw new Error("User context not found");

  // Handle Team Workspace
  if (workspaceType.toLowerCase() === "team" && orgId) {
    // 1. Validate Membership
    const membership = await prisma.orgMember.findUnique({
      where: {
        organizationId_userId: {
          organizationId: orgId,
          userId: user.id
        }
      }
    });

    if (!membership) {
      console.error(`User ${user.id} attempted to access unauthorized Org ${orgId}`);
      return []; // Return empty instead of throwing to prevent crashing the Sidebar
    }

    // 2. Fetch Projects
    return await prisma.playground.findMany({
      where: { organizationId: orgId },
      include: {
        repositoryMap: { select: { lastAnalyzed: true } }
      },
      orderBy: { updatedAt: "desc" }
    });
  }

  // Handle Personal Workspace
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
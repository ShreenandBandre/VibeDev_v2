"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getWorkspaceProjects(workspaceType: "personal" | "team", orgId: string | null) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });

  if (!user) throw new Error("User context not found");

  if (workspaceType === "team" && orgId) {
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
        repositoryMap: {
          select: { lastAnalyzed: true }
        }
      },
      orderBy: { updatedAt: "desc" }
    });
  }

  return await prisma.playground.findMany({
    where: {
      userId: user.id,
      organizationId: null
    },
    include: {
      repositoryMap: {
        select: { lastAnalyzed: true }
      }
    },
    orderBy: { updatedAt: "desc" }
  });
}
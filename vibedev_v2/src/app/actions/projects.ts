"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// 1. GET WORKSPACE PROJECTS ACTION (Fixed Select Target Engine)
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
          select: { 
            lastAnalyzed: true,
            ownerName: true,       // 🔥 Selected for Frontend Dashboard layout sync
            repositoryName: true   // 🔥 Selected for Frontend Dashboard layout sync
          }
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
        select: { 
          lastAnalyzed: true,
          ownerName: true,       // 🔥 Selected for Frontend Dashboard layout sync
          repositoryName: true   // 🔥 Selected for Frontend Dashboard layout sync
        }
      }
    },
    orderBy: { updatedAt: "desc" }
  });
}

// 🚀 2. DELETE WORKSPACE PROJECT ACTION
export async function deleteWorkspaceProject(projectId: string) {
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, error: "Unauthorized access call." };
  }

  if (!projectId) {
    return { success: false, error: "Missing required Project/Playground ID." };
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) return { success: false, error: "User context not found in storage." };

    const targetPlayground = await prisma.playground.findUnique({
      where: { id: projectId }
    });

    if (!targetPlayground) {
      return { success: false, error: "Target playground card already deleted or missing." };
    }

    if (!targetPlayground.organizationId && targetPlayground.userId !== user.id) {
      return { success: false, error: "Forbidden: You do not own this playground sandbox." };
    }

    // 1. Repository Map delete karo agar exist karta ho
    await prisma.repositoryMap.deleteMany({
      where: { playgroundId: projectId }
    });

    // 2. Main target playground ko collection se wipe out karo
    await prisma.playground.delete({
      where: { id: projectId }
    });

    revalidatePath("/dashboard");

    return { 
      success: true, 
      message: "Workspace cluster completely wiped from Prisma storage layer." 
    };

  } catch (error: any) {
    console.error("Critical failure inside Prisma delete action loop:", error);
    return { 
      success: false, 
      error: error?.message || "Failed processing deletion transaction query." 
    };
  }
}
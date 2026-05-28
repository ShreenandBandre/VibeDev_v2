"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

// 1. GET WORKSPACE PROJECTS ACTION (Existing Logic)
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

// 🚀 2. NEW: DELETE WORKSPACE PROJECT ACTION (Prisma Integration)
export async function deleteWorkspaceProject(projectId: string) {
  const session = await auth();
  if (!session?.user?.email) {
    return { success: false, error: "Unauthorized access call." };
  }

  if (!projectId) {
    return { success: false, error: "Missing required Project/Playground ID." };
  }

  try {
    // Current user context match nikaalna secure delete ke liye
    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true }
    });

    if (!user) return { success: false, error: "User context not found in storage." };

    // Pehle double check karo ki playground exist karta hai ya nahi
    const targetPlayground = await prisma.playground.findUnique({
      where: { id: projectId }
    });

    if (!targetPlayground) {
      return { success: false, error: "Target playground card already deleted or missing." };
    }

    // 🔒 Security Check: Kisi dusre user ke assets delete karne se block karne ke liye
    // Agar team playground nahi hai, toh check karo user khud owner hai ya nahi
    if (!targetPlayground.organizationId && targetPlayground.userId !== user.id) {
      return { success: false, error: "Forbidden: You do not own this playground sandbox." };
    }

    // =========================================================================
    // 🛠️ PRISMA CASCADE PURGE (Safai Engine)
    // Agar tumhare Prisma Schema me relation fields mapped hain (like repositoryMap, elements, nodes)
    // toh dependent records pehle udayenge agar "onDelete: Cascade" DB level par nahi laga hai:
    // =========================================================================
    
    // 1. Repository Map delete karo agar exist karta ho
    await prisma.repositoryMap.deleteMany({
      where: { playgroundId: projectId } // ensure field name matches your prisma schema relation fields
    });

    // 2. Main target playground ko MongoDB collection se wipe out karo
    await prisma.playground.delete({
      where: { id: projectId }
    });

    // Next.js client caching templates flush update run trigger krega
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
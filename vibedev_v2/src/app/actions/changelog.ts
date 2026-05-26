"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function getPlatformChangelogStream(
  workspaceType: "personal" | "team",
  activeOrgId: string | null
) {
  try {
    const session = await auth();
    if (!session?.user?.id) throw new Error("401: Unauthorized identity handle.");

    // Queries records filtered precisely by workspace ownership scopes
    const logs = await prisma.activityLog.findMany({
      where: {
        OR: [
          {
            organizationId: workspaceType === "team" ? activeOrgId : null,
          },
          {
            userId: session.user.id,
            organizationId: null
          }
        ]
      },
      orderBy: {
        createdAt: "desc"
      },
      take: 15 // Keeps UI lightweight by limiting the initial payload size
    });

    return logs;
  } catch (error) {
    console.error("Failed gathering log streams records:", error);
    return [];
  }
}
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";
import { revalidatePath } from "next/cache";

export async function createInvite(orgId: string, email: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");

  // Create a URL-safe token
  const token = crypto.randomUUID();
  
  // Set expiration to 48 hours from now
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 48);

  const invite = await prisma.invitation.create({
    data: {
      email,
      token,
      organizationId: orgId,
      expiresAt,
    }
  });

  return { success: true, inviteToken: invite.token };
}

export async function acceptInvite(token: string) {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Please sign in to accept this invitation.");

  // 1. Find the invite
  const invite = await prisma.invitation.findUnique({ where: { token } });
  
  if (!invite) throw new Error("Invitation not found.");
  if (new Date() > invite.expiresAt) {
    await prisma.invitation.delete({ where: { token } });
    throw new Error("This invitation has expired.");
  }

  // 2. Check if user is already a member to prevent unique constraint errors
  const existingMember = await prisma.orgMember.findUnique({
    where: {
      organizationId_userId: {
        organizationId: invite.organizationId,
        userId: session.user.id
      }
    }
  });

  if (existingMember) {
    await prisma.invitation.delete({ where: { token } });
    return { success: true, orgId: invite.organizationId };
  }

  // 3. Atomically add to OrgMember and delete the invite
  // Note: Removed 'role: invite.role' as it likely doesn't exist on your schema
  await prisma.$transaction([
    prisma.orgMember.create({
      data: {
        organizationId: invite.organizationId,
        userId: session.user.id,
        role: "MEMBER" // Default role
      }
    }),
    prisma.invitation.delete({ where: { token } })
  ]);

  revalidatePath("/dashboard");
  return { success: true, orgId: invite.organizationId };
}
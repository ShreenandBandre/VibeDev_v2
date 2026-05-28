"use server";

import { prisma } from "@/lib/prisma"; 
import { auth } from "@/auth"; 

export async function getUserWorkspaces() {
  const session = await auth();
  if (!session?.user?.email) throw new Error("Unauthorized");

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true, name: true, image: true },
  });

  if (!user) throw new Error("User record missing");

  // Fetch memberships
  const memberships = await prisma.orgMember.findMany({
    where: { userId: user.id },
    include: { organization: true },
  });

  // Fetch owned orgs
  const ownedOrgs = await prisma.organization.findMany({
    where: { ownerId: user.id },
  });

  // Debugging: Log if user has no orgs
  if (memberships.length === 0 && ownedOrgs.length === 0) {
    console.log(`User ${user.id} has no associated organizations.`);
  }

  const orgMap = new Map();
  memberships.forEach(m => {
    if (m.organization) {
      orgMap.set(m.organization.id, { ...m.organization, role: m.role || "MEMBER" });
    }
  });

  ownedOrgs.forEach(org => {
    if (!orgMap.has(org.id)) {
      orgMap.set(org.id, { ...org, role: "ADMIN" });
    }
  });

  return {
    user,
    groupedWorkspaces: {
      organizations: Array.from(orgMap.values()),
    },
  };
}
// filepath: /src/app/actions/get-user-workspaces.ts
"use server";

import { prisma } from "@/lib/prisma"; 
import { auth } from "@/auth"; 

export async function getUserWorkspaces() {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized access request");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: {
      id: true,
      name: true,
      email: true,
      image: true,
    },
  });

  if (!user) throw new Error("User record mapping missing");

  // 1. Fetch official enterprise team workspaces
  const memberships = await prisma.orgMember.findMany({
    where: { userId: user.id },
    include: {
      organization: {
        select: {
          id: true,
          name: true,
          slug: true,
          imageUrl: true,
        },
      },
    },
  });

  const explicitOrganizations = memberships.map((m) => ({
    id: m.organization.id,
    name: m.organization.name,
    slug: m.organization.slug,
    imageUrl: m.organization.imageUrl,
    type: "ORGANIZATION",
    role: m.role
  }));

  // 2. Synthesize an implicit Personal Space payload to prevent dashboard breakage
  const personalWorkspace = {
    id: `personal-${user.id}`,
    name: "Personal Sandboxes",
    slug: "personal-workspace",
    imageUrl: user.image || null,
    type: "PERSONAL",
    role: "ADMIN"
  };

  return {
    user,
    // Unified workspace selection stream
    workspaces: [personalWorkspace, ...explicitOrganizations],
  };
}
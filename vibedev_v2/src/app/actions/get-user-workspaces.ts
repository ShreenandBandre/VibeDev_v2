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
    select: { id: true, name: true, email: true, image: true },
  });

  if (!user) throw new Error("User record mapping missing");

  // Fetch organizational teams
  const memberships = await prisma.orgMember.findMany({
    where: { userId: user.id },
    include: {
      organization: {
        select: { id: true, name: true, slug: true, imageUrl: true },
      },
    },
  });

  let explicitOrganizations = memberships.map((m) => ({
    id: m.organization.id,
    name: m.organization.name,
    slug: m.organization.slug,
    imageUrl: m.organization.imageUrl,
    type: "ORGANIZATION", // Consistent string for UI checks
    role: m.role || "VIEWER"
  }));

  // Mock Injection
  if (explicitOrganizations.length === 0) {
    explicitOrganizations = [
      {
        id: "mock-vibedev-org-id",
        name: "VibeDev Enterprise Core",
        slug: "vibedev-enterprise",
        imageUrl: null,
        type: "ORGANIZATION",
        role: "VIEWER"
      }
    ];
  }

  const personalWorkspace = {
    id: `personal-${user.id}`,
    name: "Personal Sandboxes",
    slug: "personal-workspace",
    imageUrl: user.image || null,
    type: "PERSONAL", // Consistent string for UI checks
    role: "ADMIN"
  };

  return {
    user,
    groupedWorkspaces: {
      personal: personalWorkspace,
      organizations: explicitOrganizations,
    },
    workspaces: [personalWorkspace, ...explicitOrganizations],
  };
}
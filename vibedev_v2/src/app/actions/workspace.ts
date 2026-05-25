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

  const organizations = memberships.map((m) => m.organization);

  return {
    user,
    organizations,
  };
}
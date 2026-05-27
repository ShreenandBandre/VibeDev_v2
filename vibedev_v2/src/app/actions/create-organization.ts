// filepath: /src/app/actions/create-organization.ts
"use server";

import { prisma } from "@/lib/prisma";
import { auth } from "@/auth";

export async function createOrganization(formData: { name: string }) {
  const session = await auth();
  if (!session?.user?.email) {
    throw new Error("Unauthorized");
  }

  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
    select: { id: true }
  });

  if (!user) throw new Error("User profile not found");

  const slug = formData.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");

  // FIXED: Added ownerId to the create data object
  const newOrg = await prisma.organization.create({
    data: {
      name: formData.name,
      slug: slug,
      ownerId: user.id, // <-- This is the missing piece!
      members: {
        create: {
          userId: user.id,
          role: "ADMIN"
        }
      }
    }
  });

  return { success: true, organization: newOrg };
}
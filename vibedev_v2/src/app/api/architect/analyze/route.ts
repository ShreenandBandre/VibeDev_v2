export const dynamic = 'force-dynamic';
import { NextResponse } from "next/server";
import { headers } from "next/headers"; // 🚀 1. Import headers
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  // 🚀 2. Call headers() to strictly tell Next.js this can only be executed at runtime
  await headers(); 

  try {
    const { playgroundId, nodes, edges } = await req.json();

    const map = await prisma.repositoryMap.upsert({
      where: { playgroundId },
      update: { nodes, edges, lastAnalyzed: new Date() },
      create: { playgroundId, nodes, edges },
    });

    return NextResponse.json(map);
  } catch (error) {
    console.error("Database upsert failed:", error);
    return NextResponse.json({ error: "Failed to update repository map" }, { status: 500 });
  }
}
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const { playgroundId, nodes, edges } = await req.json();

  const map = await prisma.repositoryMap.upsert({
    where: { playgroundId },
    update: { nodes, edges, lastAnalyzed: new Date() },
    create: { playgroundId, nodes, edges },
  });

  return NextResponse.json(map);
}
// filepath: /src/app/actions/proposals.ts
"use server";

import { prisma } from "@/lib/prisma"; // Adjust this path based on your standard client instantiation file
import { revalidatePath } from "next/cache";

// ⚠️ MOCKING CURRENT AUTHENTICATED USER ID (Swap this block with your standard auth engine context, e.g., NextAuth / Kinde / Clerk)
const getCurrentUserId = async () => {
  const user = await prisma.user.findFirst();
  return user?.id || "";
};

interface CreateProposalInput {
  playgroundId: string;
  title: string;
  description?: string;
  nodes: any[];
  edges: any[];
}

/**
 * 1. Submit an isolated local topology sandbox state as a team proposal review branch
 */
export async function createTeamProposal(input: CreateProposalInput) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Unauthorized access token context.");

    const proposal = await prisma.architectureProposal.create({
      data: {
        title: input.title,
        description: input.description,
        proposalNodes: input.nodes,
        proposalEdges: input.edges,
        playgroundId: input.playgroundId,
        creatorId: userId,
        status: "PENDING"
      }
    });

    // Write audit trail log entry
    await prisma.activityLog.create({
      data: {
        title: "Architecture Proposal Registered",
        description: `Created layout revision template branch: "${input.title}"`,
        type: "PROPOSAL_CREATE",
        userId: userId,
      }
    });

    revalidatePath(`/dashboard/visualizer/${input.playgroundId}`);
    return { success: true, data: proposal };
  } catch (error: any) {
    return { success: false, error: error.message || "Failed creating architecture proposal ledger entry." };
  }
}

/**
 * 2. Pull all active pending team review variants for the target canvas layout
 */
export async function getTeamProposals(playgroundId: string) {
  try {
    const proposals = await prisma.architectureProposal.findMany({
      where: { playgroundId },
      include: {
        creator: {
          select: { name: true, email: true, image: true }
        }
      },
      orderBy: { createdAt: "desc" }
    });
    return { success: true, proposals };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * 3. Approve and Merge a targeted snapshot variant back into the baseline canonical main track
 */
export async function mergeTeamProposal(proposalId: string) {
  try {
    const userId = await getCurrentUserId();
    if (!userId) throw new Error("Unauthorized.");

    // Retrieve proposal variant matrix layout
    const proposal = await prisma.architectureProposal.findUnique({
      where: { id: proposalId },
      include: { playground: true }
    });

    if (!proposal || proposal.status !== "PENDING") {
      throw new Error("Target proposal reference unmapped or closed.");
    }

    // Atomic mutation sequence: Overwrite live main branch layout, then flag proposal state as merged
    await prisma.$transaction([
      prisma.repositoryMap.update({
        where: { playgroundId: proposal.playgroundId },
        data: {
          nodes: proposal.proposalNodes as any,
          edges: proposal.proposalEdges as any,
          lastAnalyzed: new Date()
        }
      }),
      prisma.architectureProposal.update({
        where: { id: proposalId },
        data: { status: "MERGED" }
      })
    ]);

    // Track merge update activity log
    await prisma.activityLog.create({
      data: {
        title: "Proposal Snapshot Merged",
        description: `Successfully integrated sandbox revision proposal blueprint into canonical main graph.`,
        type: "PROPOSAL_MERGE",
        userId: userId,
        organizationId: proposal.playground.organizationId
      }
    });

    revalidatePath(`/dashboard/visualizer/${proposal.playgroundId}`);
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
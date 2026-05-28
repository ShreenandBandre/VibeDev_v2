import { NextResponse } from "next/server";
import { headers } from "next/headers";
import crypto from "crypto";
import { prisma } from "@/lib/prisma";
import { syncRepositoryUpstream } from "@/app/actions/git-cloner"; 
import Pusher from "pusher";

// Initialize Pusher Server Instance
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

function verifyGitHubSignature(payload: string, signature: string, secret: string) {
  const hmac = crypto.createHmac("sha256", secret);
  const digest = "sha256=" + hmac.update(payload).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature));
}

export async function POST(req: Request) {
  try {
    const rawBody = await req.text();
    const headersList = await headers();
    const signature = headersList.get("x-hub-signature-256") || "";
    const event = headersList.get("x-github-event") || "";
    const webhookSecret = process.env.GITHUB_WEBHOOK_SECRET || "";

    if (!verifyGitHubSignature(rawBody, signature, webhookSecret)) {
      return NextResponse.json({ error: "Unauthorized Signature Match" }, { status: 401 });
    }

    const payload = JSON.parse(rawBody);

    // Handle GitHub's initial handshake setup ping safely
    if (payload.zen) {
      return NextResponse.json({ message: "Dynamic webhook connection verified!" });
    }

    if (event === "push") {
      const repoName = payload.repository.name;
      const ownerName = payload.repository.owner.login;
      const branchName = payload.ref.replace("refs/heads/", "");
      const repoUrl = payload.repository.html_url;

      // 🔄 1. Find exact workspace/playground matching BOTH repository name and owner
      const matchedPlaygrounds = await prisma.repositoryMap.findMany({
        where: { 
          repositoryName: repoName,
          ownerName: ownerName
        }
      });

      if (matchedPlaygrounds.length === 0) {
        return NextResponse.json({ message: "No tracking workspace found for this repository payload context." });
      }

      // 🔄 2. Run delta updates and pusher push updates dynamically across matching scopes
      for (const mappingRecord of matchedPlaygrounds) {
        const pId = mappingRecord.playgroundId;

        console.log(`⚙️ Running automated upstream background synchronization for Playground: ${pId}`);
        
        // Dynamic file delta pull sync algorithm executed automatically
        const syncResult = await syncRepositoryUpstream(pId, repoUrl);
        
        if (!syncResult.success) {
          console.error(`⚠️ Synchronization failed running background stream update for project ${pId}:`, syncResult.error);
          continue;
        }

        // 📡 3. Broadcast real-time refresh socket signal straight to Frontend UI!
        await pusher.trigger(`playground-${pId}`, "repo-updated", {
          message: `Repository mutated via commit: ${payload.head_commit?.message || "updates"}`,
          branch: branchName
        });
        
        console.log(`📡 Broadcasted live update token for Playground channel: playground-${pId}`);
      }
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Webhook route crash:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
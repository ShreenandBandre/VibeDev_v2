import { NextResponse } from "next/server";
import Pusher from "pusher";

const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID!,
  key: process.env.NEXT_PUBLIC_PUSHER_KEY!,
  secret: process.env.PUSHER_SECRET!,
  cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER!,
  useTLS: true,
});

export async function POST(req: Request) {
  try {
    // Read body buffer via application URL encoding data systems safely
    const formData = await req.formData();
    const socketId = formData.get("socket_id") as string;
    const channelName = formData.get("channel_name") as string;

    if (!socketId || !channelName) {
      return NextResponse.json({ error: "Missing required stream parameters initialization flags" }, { status: 400 });
    }

    // Securely authorize user channel subscription token maps straight
    const authResponse = pusher.authorizeChannel(socketId, channelName);
    
    return NextResponse.json(authResponse);
  } catch (err: any) {
    console.error("Pusher Core Broadcast Security Auth Crash:", err);
    return NextResponse.json({ error: "Auth channel mapping error security restrictions" }, { status: 403 });
  }
}
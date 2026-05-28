"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { acceptInvite } from "@/app/actions/invitations";
import { Loader2 } from "lucide-react";
import { signIn, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

export default function JoinPage() {
  const { token } = useParams();
  const router = useRouter();
  const { status: authStatus } = useSession();
  
  const [status, setStatus] = useState<"loading" | "success" | "error" | "unauthorized">("loading");
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (authStatus === "loading") return;

    if (authStatus === "unauthenticated") {
      setStatus("unauthorized");
      setMessage("You must be signed in to accept this invitation.");
      return;
    }

    if (!token) return;

    acceptInvite(token as string)
  .then((res) => {
    if (res.success) {
      setStatus("success");
      setMessage("Successfully joined the organization!");
      // Adding a small delay to ensure DB propagation
      setTimeout(() => {
        // Redirect to dashboard with params to force the context to switch
        router.push(`/dashboard?workspace=team&orgId=${res.orgId}`);
      }, 1000);
    }
  })
      .catch((err) => {
        setStatus("error");
        setMessage(err.message || "Failed to join team.");
      });
  }, [token, router, authStatus]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-zinc-950 text-white">
      <div className="text-center space-y-4">
        {status === "loading" && (
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="animate-spin text-blue-500" size={32} />
            <p>Verifying your session...</p>
          </div>
        )}
        
        {status === "unauthorized" && (
          <div className="space-y-4">
            <p className="text-zinc-400">{message}</p>
            <Button onClick={() => signIn()}>Sign In to Join Team</Button>
          </div>
        )}

        {status === "success" && <p className="text-emerald-500">{message}</p>}
        {status === "error" && <p className="text-red-500">{message}</p>}
      </div>
    </div>
  );
}
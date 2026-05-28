"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { createInvite } from "@/app/actions/invitations";
import { useWorkspace } from "@/context/workspace-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function TeamSettingsPage() {
  const { activeOrgId } = useWorkspace();
  const searchParams = useSearchParams();
  
  // Robustness: Capture Org ID from Context or URL as fallback
  const orgId = activeOrgId || searchParams.get("orgId");
  
  const [email, setEmail] = useState("");
  const [inviteLink, setInviteLink] = useState("");

  const handleInvite = async () => {
    if (!orgId) {
      console.error("No Active Org ID detected in context or URL!");
      alert("Please ensure you are within an organization workspace.");
      return;
    }
    
    try {
      console.log("Attempting to call createInvite for Org:", orgId);
      const result = await createInvite(orgId, email);
      
      if (result.success) {
        setInviteLink(`${window.location.origin}/join/${result.inviteToken}`);
      } else {
        console.error("Action returned failure:", result.error);
        alert("Failed to generate link: " + result.error);
      }
    } catch (err) {
      console.error("Caught error during action call:", err);
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-8">
      <h1 className="text-2xl font-bold text-white">Team Management</h1>
      
      <div className="bg-zinc-900 p-6 rounded-xl border border-zinc-800 space-y-4">
        <h2 className="text-sm font-semibold text-zinc-300">Invite New Teammate</h2>
        <div className="flex gap-2">
          <Input 
            placeholder="colleague@company.com" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)}
          />
          <Button onClick={handleInvite}>Generate Invite Link</Button>
        </div>
        {inviteLink && (
          <div className="text-xs p-3 bg-zinc-950 border border-zinc-800 rounded font-mono text-indigo-400 break-all">
            Share this link: {inviteLink}
          </div>
        )}
      </div>
    </div>
  );
}
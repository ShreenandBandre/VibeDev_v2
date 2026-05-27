// filepath: /src/components/visualizer/proposal-review-drawer.tsx
"use client";

import React, { useEffect, useState } from "react";
import { getTeamProposals, mergeTeamProposal } from "@/app/actions/proposals";
import { X, GitPullRequest, CheckCircle2, User, Calendar, Layers } from "lucide-react";

interface ProposalReviewDrawerProps {
  playgroundId: string;
  isOpen: boolean;
  onClose: () => void;
  onProposalMerged: () => void;
}

export function ProposalReviewDrawer({ playgroundId, isOpen, onClose, onProposalMerged }: ProposalReviewDrawerProps) {
  const [proposals, setProposals] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionPending, setActionPending] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && playgroundId) {
      fetchProposals();
    }
  }, [isOpen, playgroundId]);

  async function fetchProposals() {
    setLoading(true);
    const res = await getTeamProposals(playgroundId);
    if (res.success && res.proposals) {
      setProposals(res.proposals);
    }
    setLoading(false);
  }

  async function handleMerge(proposalId: string) {
    setActionPending(proposalId);
    const res = await mergeTeamProposal(proposalId);
    if (res.success) {
      onProposalMerged();
      fetchProposals();
    } else {
      alert(res.error || "Failed to merge architecture configuration update.");
    }
    setActionPending(null);
  }

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-0 h-full w-96 bg-zinc-950 border-l border-zinc-800 z-50 flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
      {/* HEADER */}
      <div className="h-14 border-b border-zinc-800 px-4 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-zinc-200 font-mono text-xs font-bold tracking-wide">
          <GitPullRequest size={14} className="text-amber-400" />
          PROPOSAL REVIEW BOARD
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
          <X size={16} />
        </button>
      </div>

      {/* CONTENT LIST */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {loading ? (
          <div className="text-center font-mono text-[10px] text-zinc-500 pt-10">
            Querying pending architecture configurations...
          </div>
        ) : proposals.length === 0 ? (
          <div className="text-center font-mono text-[10px] text-zinc-500 pt-10 border border-dashed border-zinc-800 rounded p-6">
            No active architecture branch proposals awaiting review.
          </div>
        ) : (
          proposals.map((prop) => (
            <div 
              key={prop.id} 
              className={`p-3 bg-zinc-900 border rounded-lg transition-all ${
                prop.status === "MERGED" ? "border-emerald-500/20 opacity-75" : "border-zinc-800 hover:border-zinc-700"
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-mono text-xs font-bold text-zinc-200 line-clamp-1">{prop.title}</h3>
                <span className={`text-[8px] font-mono px-1.5 py-0.5 rounded uppercase shrink-0 font-bold ${
                  prop.status === "PENDING" ? "bg-amber-500/10 text-amber-400" : "bg-emerald-500/10 text-emerald-400"
                }`}>
                  {prop.status}
                </span>
              </div>
              
              <p className="text-[10px] font-sans text-zinc-400 mt-1.5 leading-normal">{prop.description || "No documentation logs accompanying this layout modification."}</p>

              {/* METADATA CHIPS */}
              <div className="mt-3 pt-2.5 border-t border-zinc-800/60 flex flex-wrap gap-x-3 gap-y-1.5 text-[9px] font-mono text-zinc-500">
                <span className="flex items-center gap-1">
                  <User size={10} /> {prop.creator?.name || prop.creator?.email.split('@')[0]}
                </span>
                <span className="flex items-center gap-1">
                  <Calendar size={10} /> {new Date(prop.createdAt).toLocaleDateString()}
                </span>
                <span className="flex items-center gap-1 text-zinc-400">
                  <Layers size={10} /> {Array.isArray(prop.proposalNodes) ? prop.proposalNodes.length : 0} nodes
                </span>
              </div>

              {/* ACTION MATRIX */}
              {prop.status === "PENDING" && (
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={() => handleMerge(prop.id)}
                    disabled={actionPending !== null}
                    className="flex-1 h-6 bg-amber-600 hover:bg-amber-700 disabled:bg-zinc-800 text-zinc-100 font-mono text-[10px] font-bold rounded transition-colors flex items-center justify-center gap-1"
                  >
                    <CheckCircle2 size={11} />
                    {actionPending === prop.id ? "Integrating Changes..." : "Approve & Merge Topology"}
                  </button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
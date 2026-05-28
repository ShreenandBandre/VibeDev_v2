"use client";

import React, { useState } from "react";
import { GitBranch, RefreshCw } from "lucide-react";
import { GlobalGitDrawer } from "@/components/visualizer/global-git-drawer";

export function HeaderGitTrigger() {
  const [isGitOpen, setIsGitOpen] = useState(false);

  return (
    <>
      {/* 🟢 TOP PREMIUM HEADER TRIGGER BUTTON */}
      <button
        onClick={() => setIsGitOpen(true)}
        className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-lg transition-all text-xs font-mono group"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
        </span>
        <GitBranch size={13} className="text-indigo-400 transition-transform group-hover:rotate-12" />
        <span className="text-zinc-300 group-hover:text-white">Git Production</span>
        <span className="bg-zinc-800 px-1 py-0.5 rounded text-[10px] text-zinc-500 font-bold font-sans">v2.1</span>
      </button>

      {/* GLOBAL SLIDE-OUT DRAWER OVERLAY */}
      <GlobalGitDrawer isOpen={isGitOpen} onClose={() => setIsGitOpen(false)} />
    </>
  );
}
"use client";

import React from "react";
import { MessageSquare, ShieldAlert, Minimize2, Maximize2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TopToolbarProps {
  metricsOverlayMode: string;
  setMetricsOverlayMode: (mode: any) => void;
  isTerminalOpen: boolean;
  setIsTerminalOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isSandboxOpen: boolean;
  setIsSandboxOpen: React.Dispatch<React.SetStateAction<boolean>>;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  selectedNode: any;
  executeAIAnalysis: () => void;
  isPending: boolean;
}

export function TopToolbar({
  metricsOverlayMode,
  setMetricsOverlayMode,
  isTerminalOpen,
  setIsTerminalOpen,
  isSandboxOpen,
  setIsSandboxOpen,
  isFullscreen,
  toggleFullscreen,
  selectedNode,
  executeAIAnalysis,
  isPending,
}: TopToolbarProps) {
  return (
    <div className="h-10 border-b border-zinc-800 flex items-center px-3 justify-between shrink-0 bg-zinc-900 relative z-40">
      
      {/* 1. LEFT TITLE SECTION */}
      <div className="flex items-center gap-1.5 select-none">
        <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />
        <h1 className="text-[11px] font-mono font-bold tracking-widest uppercase text-zinc-300">
          Architecture Explorer
        </h1>
      </div>

      {/* 2. RIGHT CONTROL ACTIONS PANEL */}
      <div className="flex items-center gap-2">
        {/* MAP OVERLAY CONTROLS */}
        <div className="flex items-center gap-0.5 border border-zinc-800 bg-zinc-800/40 p-0.5 rounded-md h-7">
          {[
            { id: "none", label: "Default Map" },
            { id: "lines", label: "LOC" },
            { id: "edges", label: "Coupling" }
          ].map((mode) => (
            <button
              key={mode.id}
              onClick={() => setMetricsOverlayMode(mode.id)}
              className={`text-[9px] font-mono px-2 py-0.5 rounded transition-all h-full ${
                metricsOverlayMode === mode.id 
                  ? "bg-zinc-700 text-indigo-300 font-bold border border-zinc-600" 
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {/* AI UTILITIES */}
        <button 
          onClick={() => { setIsTerminalOpen(p => !p); setIsSandboxOpen(false); }}
          disabled={!selectedNode}
          className={`h-7 px-2.5 rounded-md text-[10px] font-mono font-medium border flex items-center gap-1.5 transition-all ${isTerminalOpen ? "bg-indigo-600/10 text-indigo-300 border-indigo-500/40" : "bg-zinc-800/40 border-zinc-700 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-40"}`}
        >
          <MessageSquare size={11} /> Use AI Query
        </button>

        <button 
          onClick={() => { setIsSandboxOpen(p => !p); setIsTerminalOpen(false); }}
          disabled={!selectedNode}
          className={`h-7 px-2.5 rounded-md text-[10px] font-mono font-medium border flex items-center gap-1.5 transition-all ${isSandboxOpen ? "bg-amber-600/10 text-amber-300 border-amber-500/40" : "bg-zinc-800/40 border-zinc-700 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800 disabled:opacity-40"}`}
        >
          <ShieldAlert size={11} /> What-If Sandbox
        </button>

        {/* VIEWPORT CONTROLS */}
        <button 
          onClick={toggleFullscreen}
          className="h-7 px-2.5 bg-zinc-800/40 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 rounded-md text-[10px] font-mono flex items-center gap-1 transition-all"
          title="Toggle presentation focus screen"
        >
          {isFullscreen ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
          <span>{isFullscreen ? "Exit" : "Full Screen"}</span>
        </button>

        {/* CORE PARSE METHOD */}
        <Button 
          onClick={executeAIAnalysis} 
          disabled={isPending} 
          className="bg-indigo-600 hover:bg-indigo-700 h-7 text-[10px] font-bold px-3 text-white"
        >
          {isPending ? <Loader2 className="animate-spin mr-1.5" size={11}/> : <Sparkles className="mr-1.5" size={11}/>}
          Parse
        </Button>
      </div>
    </div>
  );
}
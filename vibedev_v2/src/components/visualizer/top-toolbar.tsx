"use client";

import React from "react";
import { 
  BarChart2, Terminal, Sparkles, Maximize2, Minimize2, 
  Play, GitBranch, ShieldAlert 
} from "lucide-react";

interface TopToolbarProps {
  metricsOverlayMode: boolean;
  setMetricsOverlayMode: (val: boolean) => void;
  isTerminalOpen: boolean;
  setIsTerminalOpen: (val: boolean) => void;
  isSandboxOpen: boolean;
  setIsSandboxOpen: (val: boolean) => void;
  isFullscreen: boolean;
  toggleFullscreen: () => void;
  selectedNode: any;
  executeAIAnalysis: () => void;
  isPending: boolean;
  onOpenGitConsole: () => void; // 🚀 GitHub Trigger prop mapped here
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
  onOpenGitConsole,
}: TopToolbarProps) {
  return (
    <div className="w-full h-14 bg-zinc-950 border-b border-zinc-900 px-4 flex items-center justify-between shrink-0 select-none z-40">
      
      {/* LEFT SIDE: PAGE BRANDING */}
      <div className="flex items-center gap-3">
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-white tracking-wider uppercase">Architecture Explorer</span>
            <span className="text-[9px] px-1.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded font-mono font-semibold">v1.0.0</span>
          </div>
          <span className="text-[10px] text-zinc-500 font-mono mt-0.5">System status: Stable // Canvas Active</span>
        </div>
      </div>

      {/* RIGHT SIDE: FULLY SPECIFIED ACTION TOGGLES WITH CLEAN SPACING */}
      <div className="flex items-center gap-2">
        
        {/* 🟢 NEW PREMIUM GITHUB ACTION BUTTON */}
        <button
          onClick={onOpenGitConsole}
          className="flex items-center gap-1.5 px-3 h-8 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-300 hover:text-white rounded-lg transition-all text-xs font-mono group"
        >
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          <GitBranch size={12} className="text-indigo-400 transition-transform group-hover:rotate-12" />
          <span>GitHub Sync</span>
        </button>

        <div className="h-4 w-px bg-zinc-800 mx-1" />

        {/* METRICS VIEW OVERLAY BUTTON */}
        <button
          onClick={() => setMetricsOverlayMode(!metricsOverlayMode)}
          className={`flex items-center gap-1.5 px-3 h-8 text-xs font-medium rounded-lg border transition-all ${
            metricsOverlayMode 
              ? "bg-indigo-600/10 border-indigo-500 text-indigo-400" 
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <BarChart2 size={12} />
          <span>LOC / Coupling</span>
        </button>

        {/* AI QUERY BUTTON */}
        <button
          onClick={() => setIsTerminalOpen(!isTerminalOpen)}
          className={`flex items-center gap-1.5 px-3 h-8 text-xs font-medium rounded-lg border transition-all ${
            isTerminalOpen 
              ? "bg-indigo-600/10 border-indigo-500 text-indigo-400" 
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <Terminal size={12} />
          <span>Use AI Query</span>
        </button>

        {/* WHAT-IF SANDBOX BUTTON */}
        <button
          onClick={() => setIsSandboxOpen(!isSandboxOpen)}
          disabled={!selectedNode}
          className={`flex items-center gap-1.5 px-3 h-8 text-xs font-medium rounded-lg border transition-all disabled:opacity-40 disabled:pointer-events-none ${
            isSandboxOpen 
              ? "bg-indigo-600/10 border-indigo-500 text-indigo-400" 
              : "bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200"
          }`}
        >
          <ShieldAlert size={12} />
          <span>What-If Sandbox</span>
        </button>

        {/* FULLSCREEN BUTTON */}
        <button
          onClick={toggleFullscreen}
          className="flex items-center gap-1.5 px-3 h-8 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 text-zinc-400 hover:text-zinc-200 rounded-lg text-xs font-medium transition-all"
        >
          {isFullscreen ? <Minimize2 size={12} /> : <Maximize2 size={12} />}
          <span>{isFullscreen ? "Exit Fullscreen" : "Full Screen"}</span>
        </button>

        {/* PARSE PROCESS TRIGGER */}
        <button
          onClick={executeAIAnalysis}
          disabled={isPending}
          className="flex items-center gap-1.5 px-3 h-8 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white disabled:text-zinc-500 text-xs font-bold font-mono rounded-lg transition-all shadow-lg shadow-indigo-600/10"
        >
          {isPending ? (
            <div className="w-3 h-3 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <Sparkles size={12} />
          )}
          <span>PARSE</span>
        </button>

      </div>
    </div>
  );
}
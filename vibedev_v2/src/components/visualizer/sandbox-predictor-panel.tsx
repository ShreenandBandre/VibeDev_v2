// filepath: /src/components/visualizer/sandbox-predictor-panel.tsx
"use client";

import React from "react";
import { ShieldAlert, X, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SandboxPredictorPanelProps {
  selectedNode: any;
  activeNodeId: string;
  summaries: any;
  isActionPending: boolean;
  predictInput: string;
  setPredictInput: React.Dispatch<React.SetStateAction<string>>;
  handleRunPrediction: () => void;
  setIsSandboxOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function SandboxPredictorPanel({
  selectedNode,
  activeNodeId,
  summaries,
  isActionPending,
  predictInput,
  setPredictInput,
  handleRunPrediction,
  setIsSandboxOpen,
}: SandboxPredictorPanelProps) {
  return (
    <div className="absolute bottom-3 right-3 w-[400px] h-[400px] bg-zinc-800/95 border border-zinc-700 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden backdrop-blur-md animate-in slide-in-from-bottom-2 duration-150">
      <div className="p-2.5 border-b border-zinc-700 bg-zinc-900/40 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-amber-400">
          <ShieldAlert size={12} />
          <span className="truncate max-w-[240px]">Sandbox: {selectedNode?.label || "Module"}</span>
        </div>
        <button onClick={() => setIsSandboxOpen(false)} className="text-zinc-400 hover:text-zinc-200"><X size={13}/></button>
      </div>
      <div className="flex-1 p-3 overflow-y-auto space-y-3 scrollbar-none text-[11px]">
        <div className="p-2.5 bg-amber-950/10 border border-amber-900/20 text-zinc-300 rounded-lg leading-relaxed font-sans">
          Simulate refactoring changes to trace cascading breakages or structural side effects across your wider codebase graph tree layout.
        </div>
        {summaries?.[activeNodeId]?.predictionInsight && (
          <div className="space-y-1.5 border-t border-zinc-700 pt-2.5">
            <span className="text-amber-400 font-mono text-[9px] uppercase tracking-wider font-semibold">Simulation Report:</span>
            <div className="p-2.5 bg-zinc-900/40 border border-zinc-700 text-zinc-200 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">{summaries[activeNodeId].predictionInsight}</div>
          </div>
        )}
        {isActionPending && (
          <div className="bg-zinc-700/30 border border-zinc-700 text-zinc-400 rounded-lg p-2.5 animate-pulse font-mono text-[10px]">Analyzing coupling layers...</div>
        )}
      </div>
      <div className="p-2.5 border-t border-zinc-700 bg-zinc-800 space-y-1.5 shrink-0">
        <textarea 
          value={predictInput} 
          onChange={e => setPredictInput(e.target.value)} 
          placeholder="Describe proposed modifications here..." 
          className="w-full bg-zinc-900 border border-zinc-700 rounded-md p-2 text-[11px] text-white focus:outline-none focus:border-amber-500/50 resize-none h-12 placeholder-zinc-500" 
        />
        <Button 
          onClick={handleRunPrediction} 
          disabled={isActionPending || !predictInput.trim()} 
          className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium text-[11px] h-7 rounded-md flex items-center justify-center gap-1 transition-all"
        >
          {isActionPending ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={11} />}
          Run Change Prediction Matrix
        </Button>
      </div>
    </div>
  );
}
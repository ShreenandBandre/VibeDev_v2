"use client";

import React, { useState } from "react";
import { Sparkles, Check, X, GitCommit, ChevronRight } from "lucide-react";

interface SandboxPredictorPanelProps {
  selectedNode: any;
  activeNodeId: string;
  summaries: any;
  isActionPending: boolean;
  predictInput: string;
  setPredictInput: (val: string) => void;
  handleRunPrediction: () => void;
  setIsSandboxOpen: (val: boolean) => void;
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
  
  // Dummy generated diff state to mimic GitHub when prediction completes
  const [hasPredicted, setHasPredicted] = useState(false);

  const onPredictTrigger = () => {
    handleRunPrediction();
    setHasPredicted(true); // Trigger simulated diff viewer
  };

  // Mock Diff Content data structure
  const diffLines = [
    { type: "normal", text: "export function handleUserAuthentication(user) {" },
    { type: "deletion", text: "-   if (user.isAuthenticated === true) {" },
    { type: "addition", text: "+   if (user?.isAuthenticated && user?.tokenValidity) {" },
    { type: "addition", text: "+       // AI Optimized: Safe optional chaining and security token guard" },
    { type: "normal", text: "       return redirect('/dashboard');" },
    { type: "normal", text: "   }" },
    { type: "deletion", text: "-   return null;" },
    { type: "addition", text: "+   throw new AuthenticationError('Invalid Session Context');" },
    { type: "normal", text: "}" },
  ];

  return (
    <div className="absolute top-16 right-6 w-96 bg-zinc-950/95 backdrop-blur-md border border-zinc-800/80 rounded-xl shadow-2xl z-50 overflow-hidden flex flex-col max-h-[500px]">
      
      {/* PANEL HEADER */}
      <div className="p-3 bg-zinc-900/60 border-b border-zinc-900 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles size={13} className="text-indigo-400" />
          <span className="text-[11px] font-mono font-bold text-zinc-200 uppercase tracking-wide">
            AI Sandbox Refactor
          </span>
        </div>
        <button onClick={() => setIsSandboxOpen(false)} className="text-zinc-500 hover:text-zinc-300">
          <X size={12} />
        </button>
      </div>

      {/* INPUT CONTROLS */}
      <div className="p-3 border-b border-zinc-900 bg-zinc-950/40">
        <p className="text-[10px] font-mono text-zinc-500 mb-2">
          Target Node: <span className="text-indigo-400 font-bold">{selectedNode?.label || "Selected Target"}</span>
        </p>
        <div className="flex gap-2">
          <input
            type="text"
            value={predictInput}
            onChange={(e) => setPredictInput(e.target.value)}
            placeholder="e.g., Optimize authentication security rules..."
            className="flex-1 bg-zinc-900 border border-zinc-800 rounded px-2 py-1 text-[11px] font-mono text-zinc-200 placeholder:text-zinc-600 focus:outline-none focus:border-indigo-500"
          />
          <button
            onClick={onPredictTrigger}
            disabled={isActionPending || !predictInput.trim()}
            className="px-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 text-white font-mono text-[10px] font-bold rounded transition-colors flex items-center gap-1"
          >
            {isActionPending ? "Running..." : "Predict"}
          </button>
        </div>
      </div>

      {/* 🚀 NEW FEATURE 2: INTERACTIVE GIT DIFF INTERFACE */}
      <div 
        className="flex-1 overflow-y-auto p-3 space-y-2 max-h-[300px]"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        <style dangerouslySetInnerHTML={{__html: `div::-webkit-scrollbar { display: none !important; }`}} />

        {!hasPredicted ? (
          <div className="py-8 text-center text-zinc-600 font-mono text-[10px]">
            Enter a prompt above to generate a GitHub-style code prediction.
          </div>
        ) : (
          <div className="border border-zinc-900 rounded-lg overflow-hidden bg-zinc-950 text-[10px] font-mono leading-relaxed">
            
            {/* Diff Header Meta */}
            <div className="bg-zinc-900/50 px-2.5 py-1.5 border-b border-zinc-900 flex items-center justify-between text-[9px] text-zinc-500">
              <span className="flex items-center gap-1">
                <GitCommit size={10} /> diff --git a/src/target-context.ts
              </span>
              <span className="text-emerald-400 font-bold">+3 lines / -2 lines</span>
            </div>

            {/* Render Code Diff Rows */}
            <div className="py-1 bg-zinc-950">
              {diffLines.map((line, idx) => {
                const isAddition = line.type === "addition";
                const isDeletion = line.type === "deletion";
                const rowBg = isAddition ? "bg-emerald-950/20 text-emerald-400 border-l-2 border-emerald-500" : isDeletion ? "bg-red-950/20 text-red-400 border-l-2 border-red-500 line-through" : "text-zinc-400 pl-2";
                
                return (
                  <div key={idx} className={`px-2 whitespace-pre overflow-x-auto ${rowBg}`}>
                    {line.text}
                  </div>
                );
              })}
            </div>

            {/* Action Bar inside diff view to merge into codebase */}
            <div className="p-2 bg-zinc-900/30 border-t border-zinc-900 flex items-center justify-end gap-1.5">
              <button 
                onClick={() => setHasPredicted(false)}
                className="px-2 py-0.5 border border-zinc-850 hover:bg-zinc-900 text-zinc-400 rounded text-[9px] transition-colors"
              >
                Reject
              </button>
              <button 
                onClick={() => alert("Changes seamlessly merged into visualizer tree!")}
                className="px-2 py-0.5 bg-emerald-600/90 hover:bg-emerald-600 text-white rounded text-[9px] font-bold transition-colors flex items-center gap-1"
              >
                <Check size={9} /> Accept & Stage
              </button>
            </div>

          </div>
        )}
      </div>

    </div>
  );
}
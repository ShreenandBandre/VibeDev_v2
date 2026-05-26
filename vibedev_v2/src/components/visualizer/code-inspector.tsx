"use client";

import React from "react";
import { useVisualizerStore } from "@/store/use-visualizer-store";
import { Loader2, X, FileText, BarChart2 } from "lucide-react";

interface InspectorProps {
  node: any;
  summary: any;
  onClose: () => void;
}

export function CodeInspector({ node, summary, onClose }: InspectorProps) {
  // 🚀 Connect the new loading state we added to the Zustand store
  const isInspectorLoading = useVisualizerStore((state) => state.isInspectorLoading);

  if (!node) {
    return (
      <div className="w-80 h-[650px] bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex flex-col items-center justify-center text-center text-zinc-500 text-xs italic">
        Select a workspace asset to inspect its architecture tree profile.
      </div>
    );
  }

  return (
    <div className="w-80 h-[650px] bg-zinc-950 border border-zinc-900 rounded-2xl p-4 flex flex-col justify-between text-zinc-300">
      <div>
        {/* HEADER */}
        <div className="flex items-center justify-between border-b border-zinc-900 pb-3 mb-4">
          <div className="flex items-center gap-2 truncate">
            <FileText size={14} className="text-indigo-400 flex-shrink-0" />
            <h3 className="text-xs font-bold text-white truncate">{node.label}</h3>
          </div>
          <button onClick={onClose} className="text-zinc-500 hover:text-zinc-300 transition-colors">
            <X size={14} />
          </button>
        </div>

        {/* AI ARCHITECT OBSERVATIONS PANEL */}
        <div className="space-y-4">
          <div className="bg-zinc-900/40 border border-zinc-900 p-3 rounded-xl">
            <h4 className="text-[11px] font-semibold text-indigo-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              ✨ AI Architect Observations
            </h4>

            {node.type === "folder" ? (
              <p className="text-[11px] text-zinc-500 italic leading-normal">
                Folder directory groupings manage structure and namespaces. They do not hold explicit source code parameters to analyze directly.
              </p>
            ) : isInspectorLoading ? (
              /* 🌀 Renders your loading spinner when fetching the Groq summary */
              <div className="flex flex-col items-center justify-center py-6 gap-2">
                <Loader2 size={16} className="animate-spin text-indigo-500" />
                <p className="text-[10px] text-zinc-500 animate-pulse font-mono">Decompressing source lines...</p>
              </div>
            ) : summary?.summary ? (
              /* ✅ Renders the text once loaded */
              <p className="text-xs text-zinc-300 leading-relaxed">
                {summary.summary}
              </p>
            ) : (
              <p className="text-[11px] text-zinc-500 italic leading-normal">
                No data gathered yet. Click this code block to trigger an on-demand structural evaluation.
              </p>
            )}
          </div>

          {/* META PARAMETERS (Only display if it's a file and summary is loaded) */}
          {node.type === "file" && !isInspectorLoading && summary?.complexity && (
            <div className="bg-zinc-900/20 border border-zinc-900/60 p-3 rounded-xl flex items-center justify-between text-[11px]">
              <span className="text-zinc-500 flex items-center gap-1">
                <BarChart2 size={12} /> Code Complexity:
              </span>
              <span className={`font-mono font-bold px-2 py-0.5 rounded text-[10px] ${
                summary.complexity === "High" ? "bg-red-500/10 text-red-400 border border-red-900/30" :
                summary.complexity === "Medium" ? "bg-amber-500/10 text-amber-400 border border-amber-900/30" :
                "bg-green-500/10 text-green-400 border border-green-900/30"
              }`}>
                {summary.complexity}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="text-[10px] font-mono text-zinc-600 pt-2 border-t border-zinc-900 text-right uppercase tracking-widest">
        {node.type} inspect mode
      </div>
    </div>
  );
}
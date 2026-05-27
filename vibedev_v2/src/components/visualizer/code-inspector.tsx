// filepath: /components/visualizer/code-inspector.tsx
"use client";

import React from "react";
import { X, FileText, BarChart2, Loader2, Sparkles, Folder, Cpu } from "lucide-react";
import { useVisualizerStore } from "@/store/use-visualizer-store";

export function CodeInspector({ node, summary, onClose }: any) {
  const isInspectorLoading = useVisualizerStore((state) => state.isInspectorLoading);

  if (!node) return null;

  return (
    <div className="h-full bg-zinc-950 border-l border-zinc-900 flex flex-col shadow-2xl animate-in slide-in-from-right duration-300">
      <div className="flex justify-between items-center p-6 border-b border-zinc-900">
        <h2 className="text-sm font-bold text-white flex items-center gap-2">
          {node.type === "folder" ? <Folder size={16} className="text-amber-500" /> : 
           node.type === "file" ? <FileText size={16} className="text-blue-500" /> : 
           <Cpu size={16} className="text-emerald-500" />}
          Inspector
        </h2>
        <button onClick={onClose} className="p-1 hover:bg-zinc-800 rounded transition-colors">
          <X size={16} className="text-zinc-400" />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-8">
        {isInspectorLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 size={24} className="animate-spin text-indigo-500" />
            <p className="text-xs text-zinc-500 font-mono">Analyzing structure...</p>
          </div>
        ) : (
          <>
            <div>
              <h3 className="text-[10px] uppercase text-zinc-500 font-bold mb-2 tracking-widest">Asset</h3>
              <p className="text-xs text-zinc-300 font-mono bg-zinc-900/50 p-2 rounded border border-zinc-800 break-all">
                {node?.label || "Unknown"}
              </p>
            </div>
            
            <div>
              <h3 className="text-[10px] uppercase text-zinc-500 font-bold mb-2 tracking-widest flex items-center gap-1">
                <Sparkles size={10} className="text-indigo-400"/> Architect Observation
              </h3>
              <p className="text-xs text-zinc-400 leading-relaxed italic">
                {node.type === "folder" 
                  ? "Directory node wrapper. Select this item to discover child resources." 
                  : summary?.summary || "No insights generated."}
              </p>
            </div>

            {node.type !== "folder" && (
              <div className="flex items-center justify-between p-3 bg-zinc-900/40 rounded-lg border border-zinc-800">
                <span className="text-[10px] text-zinc-400 flex items-center gap-1"><BarChart2 size={10}/> Complexity</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${summary?.complexity === 'High' ? 'bg-red-500/10 text-red-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                  {summary?.complexity || "Low"}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      <div className="p-4 border-t border-zinc-900 text-[10px] text-zinc-600 font-mono text-center uppercase tracking-widest">
        {node?.type || "node"} trace
      </div>
    </div>
  );
}
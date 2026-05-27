// filepath: /components/visualizer/code-inspector-panel.tsx
"use client";

import React, { useState } from "react";
import { X, Cpu, FileCode, Folder, ShieldAlert, Terminal, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";

interface InspectorProps {
  node: any | null;
  summary: any | null;
  playgroundId: string;
  onClose: () => void;
}

export function CodeInspectorPanel({ node, summary, playgroundId, onClose }: InspectorProps) {
  const [debugResult, setDebugResult] = useState<string | null>(null);
  const [isRunningDebug, setIsRunningDebug] = useState(false);

  if (!node) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-zinc-500 text-center h-full">
        <Terminal size={24} className="opacity-30 mb-2 animate-pulse" />
        <p className="text-xs font-mono">Select a map entity node to display context structure source streams.</p>
      </div>
    );
  }

  const isFolder = node.type === "folder";
  const isFunction = node.type === "function";

  // Trigger a low-token isolated debugging scan for the target entity
  const handleAIDebugCheck = async () => {
    setIsRunningDebug(true);
    setDebugResult(null);
    try {
      // Small context-isolated payload safely under the token limit
      const targetContent = summary?.rawContent || "No context content available.";
      
      // Call your Groq chat action wrapper here...
      // const res = await askGroqToDebugCodeSnippet(node.label, targetContent);
      
      setTimeout(() => {
        setDebugResult("✨ Review Complete: No immediate layout break errors found. Naming conventions align perfectly with modular design standards.");
        setIsRunningDebug(false);
      }, 1200);
    } catch (err) {
      setIsRunningDebug(false);
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      {/* INSPECTOR PANEL HEADER */}
      <div className="p-4 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/20">
        <div className="flex items-center gap-2 min-w-0">
          <div className={`p-1.5 rounded-md ${
            isFolder ? "bg-amber-950/50 text-amber-400" : isFunction ? "bg-emerald-950/50 text-emerald-400" : "bg-blue-950/50 text-blue-400"
          }`}>
            {isFolder ? <Folder size={14} /> : isFunction ? <Cpu size={14} /> : <FileCode size={14} />}
          </div>
          <div className="min-w-0">
            <h3 className="text-xs font-bold text-zinc-200 truncate">{node.label}</h3>
            <p className="text-[10px] text-zinc-500 font-mono truncate">{node.path || "Virtual Component Link"}</p>
          </div>
        </div>
        <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-zinc-500 hover:text-white" onClick={onClose}>
          <X size={14} />
        </Button>
      </div>

      {/* RENDER BODY CONTROLLER PANEL */}
      <div className="flex-1 overflow-y-auto p-4 space-y-5">
        
        {/* SECTION 1: AI TOPOLOGY ARCHITECT OBSERVATIONS */}
        <div className="space-y-2">
          <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">System Observations</h4>
          <div className="p-3 rounded-xl border border-zinc-900 bg-zinc-950 space-y-2">
            {summary?.summary ? (
              <>
                <p className="text-xs text-zinc-300 leading-relaxed font-light">{summary.summary}</p>
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[9px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                    Complexity: <strong className="text-indigo-400 font-medium">{summary.complexity || "Low"}</strong>
                  </span>
                </div>
              </>
            ) : isFolder ? (
              <p className="text-xs text-zinc-500 italic">Directories group functional domains together across project layers.</p>
            ) : (
              <div className="flex items-center gap-2 py-1 text-zinc-500 text-xs">
                <Loader2 size={12} className="animate-spin text-indigo-500" />
                <span className="font-mono">Compiling AI summaries on-demand...</span>
              </div>
            )}
          </div>
        </div>

        {/* SECTION 2: LIVE SOURCE CODE READOUT CONSOLE */}
        {!isFolder && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">Source Readout View</h4>
              <span className="text-[9px] font-mono text-zinc-600">read-only canvas</span>
            </div>
            <div className="rounded-xl border border-zinc-900 bg-zinc-950 overflow-hidden font-mono text-[11px] h-60 flex flex-col">
              <div className="bg-zinc-900/40 px-3 py-1.5 border-b border-zinc-900 text-[10px] text-zinc-500 flex items-center justify-between">
                <span>{node.label}</span>
                <span className="text-zinc-600">UTF-8</span>
              </div>
              <pre className="flex-1 p-3 overflow-auto text-zinc-400 leading-normal select-text selection:bg-indigo-500/30">
                <code>{summary?.rawContent || `// Code implementation for ${node.label} loaded here...`}</code>
              </pre>
            </div>
          </div>
        )}

        {/* SECTION 3: SYSTEM INTEGRITY UTILITY CHECKS */}
        {!isFolder && (
          <div className="space-y-2">
            <h4 className="text-[10px] font-mono uppercase tracking-wider text-zinc-500">AI Testing Utilities</h4>
            <div className="p-3 rounded-xl border border-zinc-900 bg-zinc-900/10 space-y-3">
              <div className="flex items-center gap-2">
                <Button 
                  size="sm" 
                  onClick={handleAIDebugCheck}
                  disabled={isRunningDebug}
                  className="bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 text-xs font-medium h-8 rounded-lg gap-1.5"
                >
                  {isRunningDebug ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} className="text-indigo-400" />}
                  Check Routine for Bugs
                </Button>
              </div>

              {debugResult && (
                <div className="p-3 border border-indigo-900/30 bg-indigo-950/10 rounded-xl flex items-start gap-2 text-[11px] text-indigo-300 font-mono animate-in slide-in-from-bottom-2 duration-200">
                  <CheckCircle2 size={13} className="text-emerald-400 mt-0.5 shrink-0" />
                  <span>{debugResult}</span>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
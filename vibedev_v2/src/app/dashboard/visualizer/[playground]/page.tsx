// filepath: /src/app/dashboard/visualizer/[playground]/page.tsx
"use client";

import React, { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useVisualizerStore } from "@/store/use-visualizer-store";
import { CodeCanvas } from "@/components/visualizer/code-canvas";
import { CodeInspector } from "@/components/visualizer/code-inspector";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Sparkles, Loader2, Network, AlertTriangle } from "lucide-react";

export default function DeepWorkspaceVisualizerPage() {
  const params = useParams();
  const router = useRouter();

  // Extract the true active route string directly from your custom directory definition
  const playgroundId = Array.isArray(params?.playground)
    ? params.playground[0]
    : (params?.playground || "") as string;

  const {
    status,
    nodes,
    edges,
    summaries,
    initialLoading,
    isPending,
    selectedNode,
    error,
    setSelectedNode,
    loadTopologyMapData,
    executeAIAnalysis,
    resetStore,
  } = useVisualizerStore();

  useEffect(() => {
    if (playgroundId) {
      loadTopologyMapData(playgroundId);
    }
    return () => resetStore();
  }, [playgroundId]);

  return (
    <div className="space-y-6 w-full max-w-7xl mx-auto p-4 pb-16 text-zinc-100 min-h-screen">
      {/* ACTION DASHBOARD HEADER CONTROL GRID */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-900 pb-5">
        <div className="space-y-1">
          <Button
            onClick={() => router.push("/dashboard")}
            variant="ghost"
            size="sm"
            className="text-zinc-500 hover:text-white -ml-2 text-xs gap-1.5 h-8"
          >
            <ArrowLeft size={12} /> Back to Dashboard
          </Button>
          <h1 className="text-xl font-extrabold tracking-tight text-white flex items-center gap-2">
            <Network size={18} className="text-indigo-400" /> Repository Map Topology Explorer
          </h1>
          <p className="text-zinc-400 text-xs font-light">
            Tracing underlying function calls, imports, and folder system hierarchies parsed from MongoDB metadata state records.
          </p>
        </div>

        <Button
          onClick={() => executeAIAnalysis(playgroundId)}
          disabled={!playgroundId || isPending || status === "ANALYZING"}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-900 text-white disabled:text-zinc-500 text-xs gap-1.5 font-medium h-9 px-4 rounded-xl shadow-lg transition-all"
        >
          {isPending || status === "ANALYZING" ? (
            <>
              <Loader2 size={12} className="animate-spin text-indigo-400" /> Mapping Architecture...
            </>
          ) : (
            <>
              <Sparkles size={12} /> Parse Architecture via Groq AI
            </>
          )}
        </Button>
      </div>

      {/* CONDITIONAL NOTIFICATION FEEDBACK TOAST BANNER */}
      {error && (
        <div className="p-4 border border-red-900/40 bg-red-950/10 rounded-xl flex items-center gap-2 text-xs font-mono text-red-400">
          <AlertTriangle size={14} />
          <span>System Trace Notice: {error}</span>
        </div>
      )}

      {/* CORE DISPLAY VIEW COMPONENT TOGGLES */}
      {initialLoading ? (
        <div className="flex flex-col items-center justify-center py-40 border border-zinc-900 rounded-2xl bg-zinc-950/10">
          <Loader2 size={24} className="animate-spin text-indigo-500" />
          <span className="text-xs font-mono text-zinc-500 mt-2 tracking-wider">Reading database topology logs...</span>
        </div>
      ) : status === "ANALYZING" ? (
        <div className="flex flex-col items-center justify-center py-40 border border-dashed border-indigo-900/40 rounded-2xl bg-zinc-950/40 text-center px-4 animate-pulse">
          <Loader2 size={32} className="animate-spin text-indigo-500 mb-4" />
          <h3 className="text-sm font-bold text-indigo-400">Groq Engine Extracting Abstract Syntax Structures</h3>
          <p className="text-xs text-zinc-400 font-light mt-1 max-w-xs leading-normal">
            Scanning folder trees, discovering export arrays, mapping data schemas, and generating technical context summaries.
          </p>
        </div>
      ) : status === "FAILED" ? (
        <div className="flex flex-col items-center justify-center py-40 border border-red-900/30 rounded-2xl bg-red-950/5 text-center px-4">
          <AlertTriangle size={32} className="text-red-500 mb-3" />
          <h3 className="text-sm font-bold text-red-400">Analysis Process Disrupted</h3>
          <p className="text-xs text-zinc-500 font-light mt-1 max-w-sm">
            The workspace parser hit a runtime processing exception. Add valid template file code segments and restart analysis.
          </p>
        </div>
      ) : nodes.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-40 border border-dashed border-zinc-900 rounded-2xl bg-zinc-950/20 text-center px-4">
          <div className="w-12 h-12 rounded-xl bg-zinc-900 flex items-center justify-center border border-zinc-800 text-zinc-500 mb-4">
            <Network size={20} />
          </div>
          <h3 className="text-sm font-bold text-zinc-300">Topology Profile Blank</h3>
          <p className="text-xs text-zinc-500 font-light mt-1 max-w-sm leading-normal">
            No topology mapping currently exists for this project sandbox. Select the action trigger above to run analysis.
          </p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 items-start animate-in fade-in duration-300">
          <div className="flex-1 w-full border border-zinc-900 rounded-2xl overflow-hidden bg-zinc-950/40">
            <CodeCanvas
              nodes={nodes}
              edges={edges}
              summaries={summaries}
              onNodeSelect={setSelectedNode}
            />
          </div>
          <CodeInspector
            node={selectedNode}
            summary={selectedNode ? summaries[selectedNode.id || selectedNode._id] : null}
            onClose={() => setSelectedNode(null)}
          />
        </div>
      )}
    </div>
  );
}
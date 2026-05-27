// filepath: /src/app/dashboard/visualizer/[playground]/page.tsx
"use client";

import React, { useEffect } from "react";
import { useParams } from "next/navigation";
import { useVisualizerStore } from "@/store/use-visualizer-store";
import { CodeCanvas } from "@/components/visualizer/code-canvas";
import { CodeInspector } from "@/components/visualizer/code-inspector";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Network } from "lucide-react";

export default function DeepWorkspaceVisualizerPage() {
  const params = useParams();
  const playgroundId = Array.isArray(params?.playground) ? params.playground[0] : (params?.playground || "");

  const {
    nodes, edges, summaries, isPending, selectedNode, selectedFile,
    setSelectedNode, setSelectedFile, loadTopologyMapData, executeAIAnalysis, resetStore,
  } = useVisualizerStore();

  useEffect(() => {
    if (playgroundId) loadTopologyMapData(playgroundId);
    return () => resetStore();
  }, [playgroundId]);

  return (
    <div className="w-full h-screen flex flex-col bg-zinc-950 overflow-hidden relative">
      <div className="h-14 border-b border-zinc-900 flex items-center px-4 justify-between shrink-0">
        <div className="flex items-center gap-3">
          <Network size={16} className="text-indigo-400" />
          <h1 className="text-xs font-bold text-white tracking-wide">Architecture Explorer</h1>
        </div>
        <Button onClick={() => executeAIAnalysis(playgroundId)} disabled={isPending} className="bg-indigo-600 h-8 text-xs">
          {isPending ? <Loader2 className="animate-spin mr-2" size={12}/> : <Sparkles className="mr-2" size={12}/>}
          Parse Architecture
        </Button>
      </div>

      <div className="flex-1 flex relative overflow-hidden">
        {/* LEFT CODE SIDEBAR VIEWPORT */}
        <div className={`absolute left-0 h-full w-96 bg-zinc-950 border-r border-zinc-900 z-30 transition-transform duration-300 ${selectedFile ? "translate-x-0" : "-translate-x-full"}`}>
          <div className="p-6 h-full overflow-y-auto">
            <h2 className="text-white text-xs mb-4 font-mono truncate">File: {selectedFile?.label || "None"}</h2>
            <pre className="text-[10px] text-zinc-500 font-mono whitespace-pre-wrap bg-zinc-900/40 p-3 rounded-lg border border-zinc-900">
              {selectedFile?.content || "// No code content loaded"}
            </pre>
          </div>
        </div>

        {/* WORKSPACE MIDDLE LAYER CORE CANVAS */}
        <div className={`flex-1 h-full p-4 transition-all duration-300 ${selectedFile ? "ml-96" : "ml-0"} ${selectedNode ? "mr-80" : "mr-0"}`}>
          <CodeCanvas 
            nodes={nodes} 
            edges={edges} 
            summaries={summaries} 
            onNodeSelect={(node) => {
              setSelectedNode(node);
              if (node.type === "file") {
                setSelectedFile(node);
              } else if (node.type === "folder") {
                setSelectedFile(null);
              }
            }} 
          />
        </div>

        {/* RIGHT ANALYSIS VIEWPORT INSPECTOR */}
        {selectedNode && (
          <div className="absolute right-0 top-0 h-full w-80 z-30">
            <CodeInspector 
              node={selectedNode} 
              summary={summaries?.[selectedNode?.id || selectedNode?._id]} 
              onClose={() => { setSelectedNode(null); setSelectedFile(null); }} 
            />
          </div>
        )}
      </div>
    </div>
  );
}
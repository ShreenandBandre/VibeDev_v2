"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useVisualizerStore, VisualizerNode, NodeSummaryPayload } from "@/store/use-visualizer-store";
import { CodeCanvas } from "@/components/visualizer/code-canvas";
import { CodeInspector } from "@/components/visualizer/code-inspector";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, Network, AlertTriangle, LayoutGrid, X, FileCode } from "lucide-react";

export default function DeepWorkspaceVisualizerPage() {
  const params = useParams();
  const router = useRouter();
  
  const [viewMode, setViewMode] = useState<"graph" | "grid">("graph");
  const [isLeftDrawerOpen, setIsLeftDrawerOpen] = useState(false);

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
    isInspectorLoading,
    selectedNode,
    error,
    setSelectedNode,
    loadTopologyMapData,
    executeAIAnalysis,
    fetchNodeSummary,
    resetStore,
  } = useVisualizerStore();

  useEffect(() => {
    if (playgroundId) loadTopologyMapData(playgroundId);
    return () => resetStore();
  }, [playgroundId]);

  const getActiveSummary = (): NodeSummaryPayload | null => {
    if (!selectedNode) return null;
    
    const idOptions = [
      selectedNode.id,
      selectedNode._id,
      selectedNode.data?.id,
      selectedNode.data?.fileId
    ];

    for (const lookupId of idOptions) {
      if (lookupId && summaries[lookupId]) {
        return summaries[lookupId];
      }
    }

    if (selectedNode.summary || selectedNode.data?.summary) {
      return {
        summary: selectedNode.summary || selectedNode.data?.summary || "",
        complexity: selectedNode.complexity || selectedNode.data?.complexity || "Low",
        rawContent: selectedNode.content || selectedNode.data?.content || ""
      };
    }
    
    return null;
  };

  const currentSummary = getActiveSummary();
  const activeSelectedId = selectedNode ? (selectedNode.id || selectedNode._id || selectedNode.data?.id) : null;

  const handleElementSelection = async (item: VisualizerNode) => {
    setSelectedNode(item);
    const targetId = item?.id || item?._id || item?.data?.id;
    
    if (targetId && playgroundId && item.type !== "folder" && item.type !== "folderGroup") {
      const normalizedType = item.type === "functionNode" || item.type === "function" ? "function" : "file";
      setIsLeftDrawerOpen(true);
      await fetchNodeSummary(targetId, playgroundId, normalizedType);
    } else {
      setIsLeftDrawerOpen(false);
    }
  };

  const getRawCodeSnippet = () => {
    if (!selectedNode) return "";
    
    const rawContent = 
      currentSummary?.rawContent || 
      selectedNode.content || 
      selectedNode.data?.content || 
      selectedNode.data?.rawContent;

    if (rawContent && rawContent.trim() !== "") {
      return rawContent;
    }

    return `// Source content loaded successfully for: ${selectedNode.label || selectedNode.name || "File"}\n// Path: ${selectedNode.path || selectedNode.data?.path || "/"}\n\nexport default function WorkspaceStub() {\n  console.log("No code block saved in database record for this node.");\n}`;
  };

  return (
    <div className="w-full h-screen p-4 flex flex-col text-zinc-100 bg-zinc-950 overflow-hidden select-none">
      
      {/* HEADER CONTROL BLOCK */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-900 pb-4 shrink-0">
        <div className="space-y-0.5">
          <Button
            onClick={() => router.push("/dashboard")}
            variant="ghost"
            size="sm"
            className="text-zinc-500 hover:text-white -ml-2 text-xs gap-1.5 h-7"
          >
            <ArrowLeft size={12} /> Back to Dashboard
          </Button>
          <h1 className="text-lg font-black tracking-tight text-white flex items-center gap-2">
            <Network size={16} className="text-indigo-400" /> Repository Map Explorer
          </h1>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center bg-zinc-900 p-0.5 rounded-lg border border-zinc-800">
            <Button
              variant={viewMode === "graph" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("graph")}
              className="text-xs gap-1 h-6 px-2 rounded font-medium"
            >
              <Network size={11} /> Graph
            </Button>
            <Button
              variant={viewMode === "grid" ? "secondary" : "ghost"}
              size="sm"
              onClick={() => setViewMode("grid")}
              className="text-xs gap-1 h-6 px-2 rounded font-medium"
            >
              <LayoutGrid size={11} /> Grid
            </Button>
          </div>

          <Button
            onClick={() => executeAIAnalysis(playgroundId)}
            disabled={!playgroundId || isPending || status === "ANALYZING"}
            className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-900 text-white disabled:text-zinc-500 text-xs gap-1.5 font-semibold h-8 px-3 rounded-lg transition-all"
          >
            {isPending || status === "ANALYZING" ? (
              <Loader2 size={12} className="animate-spin text-indigo-400" />
            ) : (
              "Parse Architecture via AI"
            )}
          </Button>
        </div>
      </div>

      {/* ERROR FEEDBACK BANNER */}
      {error && (
        <div className="p-2.5 my-2 border border-red-900/40 bg-red-950/10 rounded-lg flex items-center gap-2 text-xs font-mono text-red-400 shrink-0">
          <AlertTriangle size={12} />
          <span>System Trace Notice: {error}</span>
        </div>

      {/* FULL LAYOUT VIEWER WINDOW AREA */}
      <div className="flex-1 mt-4 flex gap-4 items-stretch h-[calc(100vh-140px)] min-h-0 w-full relative">
        
        {/* 💻 LEFT FULL-HEIGHT INTEGRATED CODE WINDOW */}
        <div 
          className={`h-full shrink-0 bg-zinc-950 border border-zinc-900 rounded-2xl flex flex-col overflow-hidden transition-all duration-300 ease-in-out ${
            isLeftDrawerOpen 
              ? "w-[40%] min-w-[380px] opacity-100" 
              : "w-0 opacity-0 border-none pointer-events-none"
          }`}
        >
          {isLeftDrawerOpen && (
            <div className="flex flex-col h-full w-full animate-in fade-in duration-200">
              <div className="p-3 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/30 shrink-0">
                <div className="flex items-center gap-2 min-w-0">
                  <FileCode size={13} className="text-indigo-400 shrink-0" />
                  <span className="text-xs font-mono font-bold text-zinc-200 truncate">
                    {selectedNode?.label || selectedNode?.name || "Source Asset"}
                  </span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-6 w-6 rounded-md hover:bg-zinc-900 text-zinc-400 hover:text-zinc-200"
                  onClick={() => {
                    setIsLeftDrawerOpen(false);
                    setSelectedNode(null);
                  }}
                >
                  <X size={12} />
                </Button>
              </div>

              <div className="flex-1 p-3 bg-zinc-950 flex flex-col min-h-0">
                <div className="rounded-xl border border-zinc-900 bg-zinc-950 overflow-hidden font-mono text-xs flex-1 flex flex-col min-h-0">
                  <div className="bg-zinc-900/40 px-3 py-1 border-b border-zinc-900 text-[10px] text-zinc-500 tracking-wider flex items-center justify-between select-none shrink-0">
                    <span>SOURCE READOUT CHANNEL</span>
                    <span className="text-zinc-600">UTF-8 VIEW</span>
                  </div>
                  
                  <pre className="flex-1 p-4 overflow-auto text-zinc-300 leading-relaxed bg-zinc-950/60 select-text selection:bg-indigo-500/20 font-mono">
                    <code className="whitespace-pre break-all">
                      {isInspectorLoading ? (
                        <div className="flex items-center gap-2 text-zinc-500 italic animate-pulse">
                          <Loader2 size={12} className="animate-spin text-indigo-500" />
                          <span>Streaming file buffers...</span>
                        </div>
                      ) : (
                        getRawCodeSnippet()
                      )}
                    Prefix</code>
                  </pre>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* 🚀 CENTER VIEWPORT CANVASES */}
        <div className="flex-1 h-full border border-zinc-900 rounded-2xl overflow-hidden bg-zinc-950/40 relative min-w-0">
          {initialLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-zinc-950/10">
              <Loader2 size={20} className="animate-spin text-indigo-500" />
              <span className="text-xs font-mono text-zinc-500 mt-2">Reading topology logs...</span>
            </div>
          ) : status === "ANALYZING" ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center border border-dashed border-indigo-900/40 rounded-2xl bg-zinc-950/40 text-center px-4 animate-pulse">
              <Loader2 size={24} className="animate-spin text-indigo-500 mb-3" />
              <h3 className="text-xs font-bold text-indigo-400">Groq Engine Synthesizing AST Tree...</h3>
            </div>
          ) : (
            viewMode === "graph" ? (
              <CodeCanvas
                nodes={nodes}
                edges={edges}
                summaries={summaries}
                onNodeSelect={handleElementSelection}
              />
            ) : (
              <div className="w-full h-full p-4 overflow-auto bg-zinc-950/60 select-none">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {nodes.map((item: VisualizerNode) => {
                    const itemId = item.id || item._id || item.data?.id;
                    const isSelected = activeSelectedId === itemId;
                    const rawType = item.type?.replace("Node", "")?.replace("Group", "") || "file";

                    return (
                      <div
                        key={itemId}
                        onClick={() => handleElementSelection(item)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer text-left ${
                          isSelected 
                            ? "bg-indigo-950/30 border-indigo-500 ring-1 ring-indigo-500" 
                            : "bg-zinc-900/30 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/50"
                        }`}
                      >
                        <span className={`text-[9px] font-mono px-1 py-0.5 rounded uppercase font-medium tracking-wider mb-2 inline-block ${
                          rawType === "folder" ? "bg-amber-950/50 text-amber-400" : rawType === "function" ? "bg-emerald-950/50 text-emerald-400" : "bg-blue-950/50 text-blue-400"
                        }`}>
                          {rawType}
                        </span>
                        <h4 className="text-xs font-bold text-zinc-200 truncate">{item.label || item.name || "Untitled"}</h4>
                      </div>
                    );
                  })}
                </div>
              </div>
            )
          )}
        </div>

        {/* 📊 FIXED RIGHT DOCK SIDEBAR */}
        <div className="w-80 h-full shrink-0">
          <CodeInspector
            node={selectedNode}
            summary={currentSummary}
            onClose={() => {
              setSelectedNode(null);
              setIsLeftDrawerOpen(false);
            }}
          />
        </div>

      </div>
    </div>
  );
}
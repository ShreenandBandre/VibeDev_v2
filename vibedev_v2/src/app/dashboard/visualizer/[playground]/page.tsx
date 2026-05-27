"use client";

import React, { useEffect, useState, useRef, useMemo } from "react";
import { useParams } from "next/navigation";
import { useVisualizerStore } from "@/store/use-visualizer-store";
import { CodeCanvas } from "@/components/visualizer/code-canvas";
import { CodeInspector } from "@/components/visualizer/code-inspector";
import { Button } from "@/components/ui/button";
import { Sparkles, Loader2, Network, X, FileCode } from "lucide-react";

interface TabItem {
  id: string;
  label: string;
  content?: string;
  type: string;
}

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

  // Workspace Viewport Resize Widths
  const [sidebarWidth, setSidebarWidth] = useState(420); 
  const [inspectorWidth, setInspectorWidth] = useState(340); 
  
  const isResizingLeft = useRef(false);
  const isResizingRight = useRef(false);

  // 1. Multi-Tab Workspace State Tracking
  const [openTabs, setOpenTabs] = useState<TabItem[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);

  useEffect(() => {
    if (playgroundId) loadTopologyMapData(playgroundId);
    return () => resetStore();
  }, [playgroundId]);

  // Synchronize incoming selections from canvas or store into the tab controller
  useEffect(() => {
    if (selectedFile) {
      const fileId = selectedFile.id || selectedFile._id;
      const tabExists = openTabs.some(tab => tab.id === fileId);
      
      if (!tabExists) {
        const newTab: TabItem = {
          id: fileId,
          label: selectedFile.label,
          content: selectedFile.content,
          type: selectedFile.type
        };
        setOpenTabs(prev => [...prev, newTab]);
      }
      setActiveTabId(fileId);
    }
  }, [selectedFile]);

  // Handle explicit tab focus selection
  const handleTabSelect = (tab: TabItem) => {
    setActiveTabId(tab.id);
    const correspondingNode = nodes.find(n => (n.id || n._id) === tab.id);
    if (correspondingNode) {
      setSelectedFile(correspondingNode);
      setSelectedNode(correspondingNode);
    }
  };

  // Close targeted workspace tab
  const handleTabClose = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    const remainingTabs = openTabs.filter(t => t.id !== tabId);
    setOpenTabs(remainingTabs);

    if (activeTabId === tabId) {
      if (remainingTabs.length > 0) {
        const nextTab = remainingTabs[remainingTabs.length - 1];
        handleTabSelect(nextTab);
      } else {
        setActiveTabId(null);
        setSelectedFile(null);
        // Retain standard inspector focus if a folder or component node is running active
        if (selectedNode && selectedNode.type === "file") {
          setSelectedNode(null);
        }
      }
    }
  };

  // Resizing mouse pointer trackers
  const startResizeLeft = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingLeft.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResize);
  };

  const startResizeRight = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizingRight.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", stopResize);
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isResizingLeft.current) {
      const newWidth = Math.max(280, Math.min(700, e.clientX));
      setSidebarWidth(newWidth);
    }
    if (isResizingRight.current) {
      const newWidth = Math.max(280, Math.min(600, window.innerWidth - e.clientX));
      setInspectorWidth(newWidth);
    }
  };

  const stopResize = () => {
    isResizingLeft.current = false;
    isResizingRight.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", stopResize);
  };

  const activeTabContent = useMemo(() => {
    return openTabs.find(t => t.id === activeTabId);
  }, [openTabs, activeTabId]);

  return (
    <div className="w-full h-screen flex flex-col bg-zinc-950 overflow-hidden relative select-none">
      {/* HEADER TOP-BAR */}
      <div className="h-14 border-b border-zinc-900 flex items-center px-4 justify-between shrink-0 bg-zinc-950 z-40">
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
        <Button onClick={() => executeAIAnalysis(playgroundId)} disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 h-8 text-xs">
          {isPending ? <Loader2 className="animate-spin mr-2" size={12}/> : <Sparkles className="mr-2" size={12}/>}
          Parse Architecture
        </Button>
      </div>

      {/* CORE WORKSPACE VIEWPORTS */}
      <div className="flex-1 flex relative overflow-hidden w-full">
        
        {/* LEFT MULTI-TAB CODE VIEWPORT */}
        <div 
          style={{ width: openTabs.length > 0 ? `${sidebarWidth}px` : "0px" }}
          className={`h-full bg-zinc-950/60 backdrop-blur-md border-r border-zinc-900 z-30 relative transition-all duration-300 ease-out flex-shrink-0 overflow-hidden flex flex-col ${
            openTabs.length > 0 ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          {/* TAB SLOT HEADER CONTAINER */}
          <div className="flex items-center bg-zinc-950 border-b border-zinc-900 overflow-x-auto scrollbar-none shrink-0 h-11">
            {openTabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <div
                  key={tab.id}
                  onClick={() => handleTabSelect(tab)}
                  className={`h-full flex items-center gap-2 px-4 border-r border-zinc-900 cursor-pointer text-xs font-mono transition-all duration-150 shrink-0 ${
                    isActive 
                      ? "bg-zinc-900/60 text-indigo-400 font-bold border-b-2 border-b-indigo-500" 
                      : "text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900/20"
                  }`}
                >
                  <FileCode size={12} className={isActive ? "text-indigo-400" : "text-zinc-600"} />
                  <span className="max-w-[120px] truncate">{tab.label}</span>
                  <button 
                    onClick={(e) => handleTabClose(e, tab.id)}
                    className="p-0.5 rounded-md hover:bg-zinc-800 text-zinc-600 hover:text-zinc-300 transition-colors"
                  >
                    <X size={10} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* ACTIVE STREAM STREAM VIEW */}
          <div className="p-5 flex-1 overflow-y-auto scrollbar-none flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto scrollbar-none rounded-xl border border-zinc-900 bg-zinc-950 font-mono text-[11px] text-zinc-300 p-4 leading-relaxed whitespace-pre shadow-inner">
              {activeTabContent?.content ? (
                <code className="block text-zinc-300 selection:bg-indigo-500/30 selection:text-white">
                  {activeTabContent.content}
                </code>
              ) : (
                <span className="text-zinc-600 italic">// Select an open workspace tab or explore canvas components</span>
              )}
            </div>
          </div>
        </div>

        {/* LEFT RESIZE DRAG-STRIP */}
        {openTabs.length > 0 && (
          <div 
            onMouseDown={startResizeLeft}
            className="w-1 bg-transparent hover:bg-indigo-500/40 active:bg-indigo-500 transition-colors cursor-col-resize h-full z-40 shrink-0"
          />
        )}

        {/* WORKSPACE MIDDLE LAYER CORE CANVAS */}
        <div className="flex-1 h-full p-4 overflow-hidden min-w-[300px]">
          <CodeCanvas 
            nodes={nodes} 
            edges={edges} 
            summaries={summaries} 
            onNodeSelect={(node) => {
              setSelectedNode(node);
              if (node.type === "file") {
                setSelectedFile(node);
              }
            }} 
          />
        </div>

        {/* RIGHT RESIZE DRAG-STRIP */}
        {selectedNode && (
          <div 
            onMouseDown={startResizeRight}
            className="w-1 bg-transparent hover:bg-indigo-500/40 active:bg-indigo-500 transition-colors cursor-col-resize h-full z-40 shrink-0"
          />
        )}

        {/* RIGHT ANALYSIS VIEWPORT INSPECTOR */}
        <div 
          style={{ width: selectedNode ? `${inspectorWidth}px` : "0px" }}
          className={`h-full z-30 shrink-0 transition-all duration-300 ease-out overflow-hidden ${
            selectedNode ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        >
          <CodeInspector 
            node={selectedNode} 
            summary={summaries?.[selectedNode?.id || selectedNode?._id]} 
            onClose={() => { 
              setSelectedNode(null); 
              setSelectedFile(null);
            }} 
          />
        </div>

      </div>
    </div>
  );
}
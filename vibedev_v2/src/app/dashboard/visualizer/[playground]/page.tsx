// filepath: /src/app/dashboard/visualizer/[playground]/page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useVisualizerStore } from "@/store/use-visualizer-store";
import { CodeCanvas } from "@/components/visualizer/code-canvas";
import { CodeInspector } from "@/components/visualizer/code-inspector";
import { getUserWorkspaces } from "@/app/actions/get-user-workspaces";

// Import Refactored Components
import { TopToolbar } from "@/components/visualizer/top-toolbar";
import { TabsEditorPanel } from "@/components/visualizer/tabs-editor-panel";
import { SandboxPredictorPanel } from "@/components/visualizer/sandbox-predictor-panel";

interface TabItem {
  id: string;
  label: string;
  content?: string;
  type: string;
}

export default function DeepWorkspaceVisualizerPage() {
  const params = useParams();
  const playgroundId = Array.isArray(params?.playground) ? params.playground[0] : (params?.playground || "");

  const {
    nodes, edges, summaries, isPending, selectedNode, selectedFile, metricsOverlayMode, isActionPending,
    availableWorkspaces, activeWorkspace, setAvailableWorkspaces, setActiveWorkspace,
    setSelectedNode, setSelectedFile, setMetricsOverlayMode, loadTopologyMapData, executeAIAnalysis, predictCodeChanges, resetStore,
  } = useVisualizerStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [sidebarWidth, setSidebarWidth] = useState(440); 
  const [inspectorWidth, setInspectorWidth] = useState(340); 
  const [workspaceDropdownOpen, setWorkspaceDropdownOpen] = useState(false);
  
  const isResizingLeft = useRef(false);
  const isResizingRight = useRef(false);

  const [openTabs, setOpenTabs] = useState<TabItem[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [editableCodeString, setEditableCodeString] = useState("");

  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [predictInput, setPredictInput] = useState("");
  const [timelineStep, setTimelineStep] = useState(0);

  const activeNodeId = selectedNode ? String(selectedNode.id || selectedNode._id) : "";

  // Synchronize initial workspaces
  useEffect(() => {
    async function synchronizeWorkspaces() {
      try {
        const payload = await getUserWorkspaces();
        if (payload && payload.workspaces) {
          setAvailableWorkspaces(payload.workspaces);
          const defaultSpace = payload.workspaces.find(w => w.type === "PERSONAL") || payload.workspaces[0];
          setActiveWorkspace(defaultSpace);
        }
      } catch (err) {
        console.error("Workspace configuration mismatch:", err);
      }
    }
    synchronizeWorkspaces();
  }, []);

  useEffect(() => {
    if (playgroundId) loadTopologyMapData(playgroundId);
    return () => resetStore();
  }, [playgroundId]);

  useEffect(() => {
    if (!activeTabId) {
      setEditableCodeString("");
      return;
    }
    const currentTabNode = nodes.find(n => String(n.id || n._id) === String(activeTabId));
    const fallbackTabItem = openTabs.find(t => String(t.id) === String(activeTabId));
    const liveCodeValue = currentTabNode?.content || fallbackTabItem?.content || "";
    setEditableCodeString(liveCodeValue);

    setOpenTabs(prev => prev.map(tab => 
      String(tab.id) === String(activeTabId) ? { ...tab, content: liveCodeValue } : tab
    ));
  }, [activeTabId, nodes]);

  useEffect(() => {
    if (selectedFile) {
      const fileId = selectedFile.id || selectedFile._id;
      const tabExists = openTabs.some(tab => tab.id === fileId);
      if (!tabExists) {
        setOpenTabs(prev => [...prev, {
          id: fileId,
          label: selectedFile.label || selectedFile.name || "File Asset",
          content: selectedFile.content || "",
          type: selectedFile.type || "file"
        }]);
      }
      setActiveTabId(fileId);
    }
  }, [selectedFile]);

  const toggleFullscreenViewport = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().then(() => setIsFullscreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullscreen(false)).catch(() => {});
    }
  };

  useEffect(() => {
    const syncFSState = () => setIsFullscreen(!!document.fullscreenElement);
    document.addEventListener("fullscreenchange", syncFSState);
    return () => document.removeEventListener("fullscreenchange", syncFSState);
  }, []);

  const handleTabSelect = (tab: TabItem) => {
    setActiveTabId(tab.id);
    const correspondingNode = nodes.find(n => String(n.id || n._id) === String(tab.id));
    
    if (correspondingNode) {
      setSelectedFile(correspondingNode);
      setSelectedNode(correspondingNode);
    } else {
      const simulatedFileNode = { id: tab.id, label: tab.label, type: tab.type || "file", content: tab.content || "" };
      setSelectedFile(simulatedFileNode);
      setSelectedNode(simulatedFileNode);
    }

    if (playgroundId) {
      useVisualizerStore.getState().fetchNodeSummary(tab.id, playgroundId, (tab.type || "file") as any);
    }
  };

  const handleTabClose = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation();
    const remainingTabs = openTabs.filter(t => t.id !== tabId);
    setOpenTabs(remainingTabs);

    if (activeTabId === tabId) {
      if (remainingTabs.length > 0) {
        handleTabSelect(remainingTabs[remainingTabs.length - 1]);
      } else {
        setActiveTabId(null);
        setSelectedFile(null);
        if (selectedNode && selectedNode.type === "file") setSelectedNode(null);
      }
    }
  };

  const handleCodeWorkspaceInput = (e: React.FormEvent<HTMLTextAreaElement>) => {
    const freshValue = e.currentTarget.value;
    setEditableCodeString(freshValue);
    const currentTabNode = nodes.find(n => String(n.id || n._id) === String(activeTabId));
    if (currentTabNode) currentTabNode.content = freshValue; 
    setOpenTabs(prev => prev.map(tab => tab.id === activeTabId ? { ...tab, content: freshValue } : tab));
  };

  const handleRunPrediction = () => {
    if (!predictInput.trim() || isActionPending || !activeNodeId) return;
    predictCodeChanges(activeNodeId, predictInput.trim());
  };

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
    if (isResizingLeft.current) setSidebarWidth(Math.max(280, Math.min(750, e.clientX)));
    if (isResizingRight.current) setInspectorWidth(Math.max(280, Math.min(600, window.innerWidth - e.clientX)));
  };

  const stopResize = () => {
    isResizingLeft.current = false;
    isResizingRight.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", stopResize);
  };

  return (
    <div ref={containerRef} className="w-full h-screen flex flex-col bg-zinc-900 overflow-hidden relative select-none text-zinc-100 font-sans antialiased">
      
      <TopToolbar 
        workspaceDropdownOpen={workspaceDropdownOpen}
        setWorkspaceDropdownOpen={setWorkspaceDropdownOpen}
        activeWorkspace={activeWorkspace}
        availableWorkspaces={availableWorkspaces}
        setActiveWorkspace={setActiveWorkspace}
        onWorkspaceChange={() => playgroundId && loadTopologyMapData(playgroundId)}
        metricsOverlayMode={metricsOverlayMode}
        setMetricsOverlayMode={setMetricsOverlayMode}
        isTerminalOpen={isTerminalOpen}
        setIsTerminalOpen={setIsTerminalOpen}
        isSandboxOpen={isSandboxOpen}
        setIsSandboxOpen={setIsSandboxOpen}
        isFullscreen={isFullscreen}
        toggleFullscreen={toggleFullscreenViewport}
        selectedNode={selectedNode}
        executeAIAnalysis={() => executeAIAnalysis(playgroundId)}
        isPending={isPending}
      />

      <div className="flex-1 flex relative overflow-hidden w-full bg-zinc-900">
        
        <TabsEditorPanel 
          width={sidebarWidth}
          openTabs={openTabs}
          activeTabId={activeTabId}
          editableCodeString={editableCodeString}
          handleTabSelect={handleTabSelect}
          handleTabClose={handleTabClose}
          handleCodeWorkspaceInput={handleCodeWorkspaceInput}
        />

        {openTabs.length > 0 && (
          <div onMouseDown={startResizeLeft} className="w-0.5 bg-transparent hover:bg-indigo-500/40 active:bg-indigo-500 transition-colors cursor-col-resize h-full z-40 shrink-0" />
        )}

        <div className="flex-1 h-full p-3 overflow-hidden min-w-[300px] relative bg-zinc-900/50">
          <CodeCanvas 
            nodes={nodes} 
            edges={edges} 
            summaries={summaries} 
            timelineStep={timelineStep}
            onNodeSelect={(node) => {
              setSelectedNode(node);
              if (node.type === "file") setSelectedFile(node);
            }} 
          />

          {isSandboxOpen && selectedNode && (
            <SandboxPredictorPanel 
              selectedNode={selectedNode}
              activeNodeId={activeNodeId}
              summaries={summaries}
              isActionPending={isActionPending}
              predictInput={predictInput}
              setPredictInput={setPredictInput}
              handleRunPrediction={handleRunPrediction}
              setIsSandboxOpen={setIsSandboxOpen}
            />
          )}
        </div>

        {selectedNode && (
          <div onMouseDown={startResizeRight} className="w-0.5 bg-transparent hover:bg-indigo-500/40 active:bg-indigo-500 transition-colors cursor-col-resize h-full z-40 shrink-0" />
        )}

        <div style={{ width: selectedNode ? `${inspectorWidth}px` : "0px" }} className={`h-full z-30 shrink-0 transition-all duration-300 ease-out overflow-hidden ${selectedNode ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <CodeInspector node={selectedNode} summary={summaries?.[selectedNode?.id || selectedNode?._id]} onClose={() => { setSelectedNode(null); setSelectedFile(null); }} />
        </div>
      </div>
    </div>
  );
}
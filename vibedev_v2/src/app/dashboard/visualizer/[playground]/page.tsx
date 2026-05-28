"use client";

import React, { useEffect, useState, useRef, useTransition } from "react";
import { useParams } from "next/navigation";
import { useVisualizerStore } from "@/store/use-visualizer-store";
import { CodeCanvas } from "@/components/visualizer/code-canvas";
import { CodeInspector } from "@/components/visualizer/code-inspector";
import { GlobalGitDrawer } from "@/components/visualizer/global-git-drawer"; 
import { Button } from "@/components/ui/button";
import { getUserWorkspaces } from "@/app/actions/get-user-workspaces"; 
import Editor from "@monaco-editor/react"; 
import { 
  Sparkles, Loader2, X, FileCode, MessageSquare, ShieldAlert, 
  Maximize2, Minimize2, UserCheck, Building2, Layers, ChevronDown,
  GitBranch 
} from "lucide-react";

interface TabItem {
  id: string;
  label: string;
  content?: string;
  type: string;
}

export default function DeepWorkspaceVisualizerPage() {
  const params = useParams();
  const playgroundId = Array.isArray(params?.playground) ? params.playground[0] : (params?.playground || "");

  const [, startTransition] = useTransition();

  // Zustand State Management selectors
  const nodes = useVisualizerStore((state) => state.nodes);
  const edges = useVisualizerStore((state) => state.edges);
  const summaries = useVisualizerStore((state) => state.summaries);
  const isPending = useVisualizerStore((state) => state.isPending);
  const selectedNode = useVisualizerStore((state) => state.selectedNode);
  const selectedFile = useVisualizerStore((state) => state.selectedFile);
  const metricsOverlayMode = useVisualizerStore((state) => state.metricsOverlayMode);
  const isActionPending = useVisualizerStore((state) => state.isActionPending);
  const availableWorkspaces = useVisualizerStore((state) => state.availableWorkspaces);
  const activeWorkspace = useVisualizerStore((state) => state.activeWorkspace);
  const activeBranch = useVisualizerStore((state) => state.activeBranch); 

  const setAvailableWorkspaces = useVisualizerStore((state) => state.setAvailableWorkspaces);
  const setActiveWorkspace = useVisualizerStore((state) => state.setActiveWorkspace);
  const setSelectedNode = useVisualizerStore((state) => state.setSelectedNode);
  const setSelectedFile = useVisualizerStore((state) => state.setSelectedFile);
  const setMetricsOverlayMode = useVisualizerStore((state) => state.setMetricsOverlayMode);
  const loadTopologyMapData = useVisualizerStore((state) => state.loadTopologyMapData);
  const executeAIAnalysis = useVisualizerStore((state) => state.executeAIAnalysis);
  const predictCodeChanges = useVisualizerStore((state) => state.predictCodeChanges);
  const resetStore = useVisualizerStore((state) => state.resetStore);
  
  // ⚡ FETCH SET NODES DISPATCHER: Store re-render trigger karne ke liye
  const setNodes = useVisualizerStore((state) => (state as any).setNodes);

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
  const [isGitDrawerOpen, setIsGitDrawerOpen] = useState(false); 
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [predictInput, setPredictInput] = useState("");
  const [chatInput, setChatInput] = useState("");

  const [timelineStep] = useState(0);
  const activeNodeId = selectedNode ? String(selectedNode.id || selectedNode._id) : "";

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
    
    if (liveCodeValue !== editableCodeString) {
      setEditableCodeString(liveCodeValue);
    }
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

  // 🔥 CORE MONACO EDITOR LIVE SYNC FIX
  const handleMonacoEditorChange = (value: string | undefined) => {
    const freshValue = value || "";
    setEditableCodeString(freshValue);

    // Dynamic Tab update
    setOpenTabs(prev => prev.map(tab => tab.id === activeTabId ? { ...tab, content: freshValue } : tab));

    startTransition(() => {
      // 🎯 Mutation safe deep state update dispatch karo
      if (setNodes && nodes.length > 0) {
        const updatedNodes = nodes.map((node) => {
          if (String(node.id || node._id) === String(activeTabId)) {
            return {
              ...node,
              content: freshValue,
              isDirty: true,     // GlobalGitDrawer Changes tracker ko active karne ke liye
              hasChanges: true
            };
          }
          return node;
        });
        setNodes(updatedNodes); // State push ho gayi, drawer instant catch karega!
      }
    });
  };

  const handleRunPrediction = () => {
    if (!predictInput.trim() || isActionPending || !activeNodeId) return;
    predictCodeChanges(activeNodeId, predictInput.trim());
  };

  const handleSendChatQuery = () => {
    if (!chatInput.trim() || isActionPending || !activeNodeId) return;
    predictCodeChanges(activeNodeId, chatInput.trim());
    setChatInput("");
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

  const getCurrentLanguageType = () => {
    const activeTab = openTabs.find(t => t.id === activeTabId);
    if (!activeTab) return "typescript";
    if (activeTab.label.endsWith(".json")) return "json";
    if (activeTab.label.endsWith(".md")) return "markdown";
    if (activeTab.label.endsWith(".js")) return "javascript";
    return "typescript";
  };

  return (
    <div ref={containerRef} className="w-full h-screen flex flex-col bg-zinc-900 overflow-hidden relative select-none text-zinc-100 font-sans antialiased">
      
      {/* HEADER TOOLBAR PANEL */}
      <div className="h-10 border-b border-zinc-800 flex items-center px-3 justify-between shrink-0 bg-zinc-900 relative z-40">
        <div className="relative">
          <button 
            onClick={() => setWorkspaceDropdownOpen(p => !p)}
            className="flex items-center gap-2 h-7 px-2.5 bg-zinc-800/40 border border-zinc-700 hover:bg-zinc-800 rounded-md text-[10px] font-mono transition-all text-zinc-300 hover:text-white"
          >
            {activeWorkspace?.type === "ORGANIZATION" ? <Building2 size={11} className="text-indigo-400"/> : <UserCheck size={11} className="text-emerald-400"/>}
            <span className="font-semibold max-w-[120px] truncate">{activeWorkspace?.name || "Personal Sandboxes"}</span>
            <ChevronDown size={10} className="text-zinc-500" />
          </button>

          {workspaceDropdownOpen && (
            <div className="absolute top-8 left-0 w-52 bg-zinc-800 border border-zinc-700 rounded-lg shadow-2xl z-50 py-1 overflow-hidden">
              <div className="px-2.5 py-1 text-[9px] font-mono uppercase text-zinc-500 tracking-wider font-bold border-b border-zinc-700/60 bg-zinc-900/20">Context Workspaces</div>
              {availableWorkspaces?.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    setActiveWorkspace(ws);
                    setWorkspaceDropdownOpen(false);
                    if (playgroundId) loadTopologyMapData(playgroundId);
                  }}
                  className={`w-full text-left px-3 py-2 text-[11px] font-mono flex items-center gap-2 transition-colors ${activeWorkspace?.id === ws.id ? "bg-indigo-600/10 text-indigo-400 font-bold" : "text-zinc-400 hover:bg-zinc-700/60 hover:text-zinc-100"}`}
                >
                  {ws.type === "ORGANIZATION" ? <Layers size={11} className="text-indigo-400" /> : <UserCheck size={11} className="text-emerald-400" />}
                  <span className="truncate">{ws.name}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="absolute left-1/3 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none select-none">
          <div className="w-1 h-1 bg-emerald-400 rounded-full animate-pulse" />
          <h1 className="text-[11px] font-mono font-bold tracking-widest uppercase text-zinc-300">Architecture Explorer</h1>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-0.5 border border-zinc-800 bg-zinc-800/40 p-0.5 rounded-md h-7">
            {[
              { id: "none", label: "Default Map" },
              { id: "lines", label: "LOC" },
              { id: "edges", label: "Coupling" }
            ].map((mode) => (
              <button
                key={mode.id}
                onClick={() => {
                  setMetricsOverlayMode(mode.id as any);
                  if (playgroundId) loadTopologyMapData(playgroundId);
                }}
                className={`text-[9px] font-mono px-2 py-0.5 rounded transition-all h-full ${
                  metricsOverlayMode === mode.id ? "bg-zinc-700 text-indigo-300 font-bold border border-zinc-600" : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <button 
            onClick={() => setIsGitDrawerOpen(true)}
            className={`h-7 px-2.5 rounded-md text-[10px] font-mono font-medium border flex items-center gap-1.5 transition-all bg-zinc-800/40 border-zinc-700 text-indigo-400 hover:text-indigo-300 hover:bg-zinc-800`}
          >
            <GitBranch size={11} /> Git Console ({activeBranch || "main"})
          </button>

          <button 
            onClick={() => { setIsTerminalOpen(p => !p); setIsSandboxOpen(false); }}
            disabled={!selectedNode}
            className={`h-7 px-2.5 rounded-md text-[10px] font-mono font-medium border flex items-center gap-1.5 transition-all ${isTerminalOpen ? "bg-indigo-600/10 text-indigo-300 border-indigo-500/40" : "bg-zinc-800/40 border-zinc-700 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"}`}
          >
            <MessageSquare size={11} /> Use AI Query
          </button>

          <button 
            onClick={() => { setIsSandboxOpen(p => !p); setIsTerminalOpen(false); }}
            disabled={!selectedNode}
            className={`h-7 px-2.5 rounded-md text-[10px] font-mono font-medium border flex items-center gap-1.5 transition-all ${isSandboxOpen ? "bg-amber-600/10 text-amber-300 border-amber-500/40" : "bg-zinc-800/40 border-zinc-700 text-zinc-300 hover:text-zinc-100 hover:bg-zinc-800"}`}
          >
            <ShieldAlert size={11} /> What-If Sandbox
          </button>

          <button 
            onClick={toggleFullscreenViewport}
            className="h-7 px-2.5 bg-zinc-800/40 border border-zinc-700 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 rounded-md text-[10px] font-mono flex items-center gap-1 transition-all"
          >
            {isFullscreen ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
            <span>{isFullscreen ? "Exit" : "Full Screen"}</span>
          </button>

          <Button onClick={() => executeAIAnalysis(playgroundId)} disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 h-7 text-[10px] font-bold px-3 text-white">
            {isPending ? <Loader2 className="animate-spin mr-1.5" size={11}/> : <Sparkles className="mr-1.5" size={11}/>}
            Parse
          </Button>
        </div>
      </div>

      {/* BODY SPLIT SYSTEM */}
      <div className="flex-1 flex relative overflow-hidden w-full bg-zinc-900">
        
        {/* MONACO CODE EDITOR */}
        <div 
          style={{ width: openTabs.length > 0 ? `${sidebarWidth}px` : "0px" }}
          className={`h-full bg-zinc-900 border-r border-zinc-800 z-30 relative transition-all duration-300 ease-out flex-shrink-0 overflow-hidden flex flex-col ${openTabs.length > 0 ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          {/* File Tabs Headers */}
          <div className="flex items-center bg-zinc-900 border-b border-zinc-800 overflow-x-auto scrollbar-none shrink-0 h-9">
            {openTabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <div
                  key={tab.id}
                  onClick={() => handleTabSelect(tab)}
                  className={`h-full flex items-center gap-2 px-3 border-r border-zinc-800 cursor-pointer text-[11px] font-mono transition-all duration-150 shrink-0 ${isActive ? "bg-zinc-950 text-indigo-400 font-bold border-b border-b-indigo-500" : "text-zinc-400 hover:text-zinc-200"}`}
                >
                  <FileCode size={11} />
                  <span className="max-w-[110px] truncate">{tab.label}</span>
                  <button onClick={(e) => handleTabClose(e, tab.id)} className="p-0.5 rounded hover:bg-zinc-700 text-zinc-500 hover:text-zinc-200 transition-colors">
                    <X size={9} />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Monaco Editor Surface */}
          <div className="p-3 flex-1 overflow-hidden flex flex-col min-h-0 bg-zinc-950">
            <div className="flex-1 overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900/10 relative min-h-[150px]">
              {activeTabId ? (
                <div key={activeTabId} className="w-full h-full absolute inset-0 py-2">
                  <Editor
                    height="100%"
                    width="100%"
                    theme="vs-dark"
                    language={getCurrentLanguageType()}
                    value={editableCodeString}
                    onChange={handleMonacoEditorChange}
                    loading={
                      <div className="w-full h-full flex items-center justify-center text-xs font-mono text-zinc-500 animate-pulse">
                        Initializing IDE Engine...
                      </div>
                    }
                    options={{
                      fontSize: 12,
                      fontFamily: "var(--font-mono), Menlo, Monaco, 'Courier New', monospace",
                      lineHeight: 19,
                      minimap: { enabled: false },
                      scrollbar: { vertical: "visible", horizontal: "visible", verticalScrollbarSize: 8, horizontalScrollbarSize: 8 },
                      selectOnLineNumbers: true,
                      roundedSelection: true,
                      readOnly: false,
                      cursorBlinking: "smooth",
                      cursorSmoothCaretAnimation: "on",
                      padding: { top: 8, bottom: 8 },
                      contextmenu: false,
                      wordWrap: "on",
                      hideCursorInOverviewRuler: true,
                      overviewRulerBorder: false,
                    }}
                  />
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-zinc-500 italic font-mono text-[11px]">// Click an open codebase module slot...</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {openTabs.length > 0 && (
          <div onMouseDown={startResizeLeft} className="w-0.5 bg-transparent hover:bg-indigo-500/40 active:bg-indigo-500 transition-colors cursor-col-resize h-full z-40 shrink-0" />
        )}

        {/* Central Canvas Viewport */}
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

          {/* AI QUERY TERMINAL */}
          {isTerminalOpen && selectedNode && (
            <div className="absolute bottom-3 right-3 w-[400px] h-[400px] bg-zinc-800/95 border border-zinc-700 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden backdrop-blur-md">
              <div className="p-2.5 border-b border-zinc-700 bg-zinc-900/40 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-indigo-400">
                  <MessageSquare size={12} />
                  <span className="truncate max-w-[240px]">AI Query: {selectedNode.label || "Module"}</span>
                </div>
                <button onClick={() => setIsTerminalOpen(false)} className="text-zinc-400 hover:text-zinc-200"><X size={13}/></button>
              </div>
              <div className="flex-1 p-3 overflow-y-auto space-y-3 scrollbar-none text-[11px]">
                <div className="p-2.5 bg-indigo-950/10 border border-indigo-900/20 text-zinc-300 rounded-lg leading-relaxed font-sans">
                  Ask architecture-specific queries or deep analysis insights regarding this structural asset module context.
                </div>
                {summaries?.[activeNodeId]?.predictionInsight && (
                  <div className="space-y-1.5 border-t border-zinc-700 pt-2.5">
                    <span className="text-indigo-400 font-mono text-[9px] uppercase tracking-wider font-semibold">AI Insight Logs:</span>
                    <div className="p-2.5 bg-zinc-900/40 border border-zinc-700 text-zinc-200 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">{summaries[activeNodeId].predictionInsight}</div>
                  </div>
                )}
                {isActionPending && (
                  <div className="bg-zinc-700/30 border border-zinc-700 text-zinc-400 rounded-lg p-2.5 animate-pulse font-mono text-[10px]">Processing contextual model nodes...</div>
                )}
              </div>
              <div className="p-2.5 border-t border-zinc-700 bg-zinc-800 space-y-1.5 shrink-0">
                <textarea value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Type architecture or code insights query here..." className="w-full bg-zinc-900 border border-zinc-700 rounded-md p-2 text-[11px] text-white focus:outline-none focus:border-indigo-500/50 resize-none h-12 placeholder-zinc-500" />
                <Button onClick={handleSendChatQuery} disabled={isActionPending || !chatInput.trim()} className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-[11px] h-7 rounded-md flex items-center justify-center gap-1 transition-all">
                  {isActionPending ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={11} />}
                  Send AI Context Query
                </Button>
              </div>
            </div>
          )}

          {/* WHAT-IF SANDBOX */}
          {isSandboxOpen && selectedNode && (
            <div className="absolute bottom-3 right-3 w-[400px] h-[400px] bg-zinc-800/95 border border-zinc-700 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden backdrop-blur-md">
              <div className="p-2.5 border-b border-zinc-700 bg-zinc-900/40 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-amber-400">
                  <ShieldAlert size={12} />
                  <span className="truncate max-w-[240px]">Sandbox: {selectedNode.label || "Module"}</span>
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
                <textarea value={predictInput} onChange={e => setPredictInput(e.target.value)} placeholder="Describe proposed modifications here..." className="w-full bg-zinc-900 border border-zinc-700 rounded-md p-2 text-[11px] text-white focus:outline-none focus:border-amber-500/50 resize-none h-12 placeholder-zinc-500" />
                <Button onClick={handleRunPrediction} disabled={isActionPending || !predictInput.trim()} className="w-full bg-amber-600 hover:bg-amber-700 text-white font-medium text-[11px] h-7 rounded-md flex items-center justify-center gap-1 transition-all">
                  {isActionPending ? <Loader2 size={10} className="animate-spin" /> : <Sparkles size={11} />}
                  Run Change Prediction Matrix
                </Button>
              </div>
            </div>
          )}
        </div>

        {selectedNode && (
          <div onMouseDown={startResizeRight} className="w-0.5 bg-transparent hover:bg-indigo-500/40 active:bg-indigo-500 transition-colors cursor-col-resize h-full z-40 shrink-0" />
        )}

        {/* Right Sidebar Inspector */}
        <div style={{ width: selectedNode ? `${inspectorWidth}px` : "0px" }} className="h-full z-30 shrink-0 transition-all duration-300 ease-out overflow-hidden">
          <CodeInspector node={selectedNode} summary={summaries?.[selectedNode?.id || selectedNode?._id]} onClose={() => { setSelectedNode(null); setSelectedFile(null); }} />
        </div>
      </div>

      {/* GLOBAL MOUNTED GIT DRAWER */}
      <GlobalGitDrawer 
        isOpen={isGitDrawerOpen} 
        onClose={() => setIsGitDrawerOpen(false)} 
      />

    </div>
  );
}
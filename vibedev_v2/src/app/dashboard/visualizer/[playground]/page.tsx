// filepath: /src/app/dashboard/visualizer/[playground]/page.tsx
"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams } from "next/navigation";
import { useVisualizerStore } from "@/store/use-visualizer-store";
import { CodeCanvas } from "@/components/visualizer/code-canvas";
import { CodeInspector } from "@/components/visualizer/code-inspector";
import { Button } from "@/components/ui/button";
import { 
  Sparkles, Loader2, Network, X, FileCode, MessageSquare, ShieldAlert, Send, Maximize2, Minimize2 
} from "lucide-react";

interface TabItem {
  id: string;
  label: string;
  content?: string;
  type: string;
}

function HighlightedCodeText({ code }: { code: string }) {
  if (!code) return null;
  const lines = code.split("\n");

  return (
    <div className="font-mono text-[11px] leading-relaxed text-zinc-300 pointer-events-none">
      {lines.map((line, lineIdx) => {
        if (line.trim().startsWith("//") || line.trim().startsWith("*") || line.trim().startsWith("/*")) {
          return <div key={lineIdx} className="text-zinc-500 italic min-h-[1.5em]">{line}</div>;
        }
        const tokenRegex = /(\/\/.*|(['"`])(.*?)\2|\b(const|let|var|function|return|import|from|export|default|async|await|if|else|try|catch|class|interface|extends|new|response|status)\b|[-+*\/=<>!]+|\b\d+\b)/g;
        const parts = line.split(tokenRegex);
        return (
          <div key={lineIdx} className="min-h-[1.5em] whitespace-pre">
            {parts.map((part, partIdx) => {
              if (!part) return null;
              if (part.startsWith("//")) return <span key={partIdx} className="text-zinc-500 italic">{part}</span>;
              if ((part.startsWith("'") && part.endsWith("'")) || (part.startsWith('"') && part.endsWith('"')) || (part.startsWith('`') && part.endsWith('`'))) {
                return <span key={partIdx} className="text-amber-300 font-medium">{part}</span>;
              }
              if (['const', 'let', 'var', 'function', 'return', 'import', 'from', 'export', 'default', 'async', 'await', 'if', 'else', 'try', 'catch', 'class', 'interface', 'extends', 'new'].includes(part)) {
                return <span key={partIdx} className="text-pink-500 font-semibold">{part}</span>;
              }
              if (['response', 'status'].includes(part)) return <span key={partIdx} className="text-sky-400 font-medium">{part}</span>;
              if (/^\d+$/.test(part)) return <span key={partIdx} className="text-emerald-400">{part}</span>;
              if (/^[-+*\/=<>!]+$/.test(part)) return <span key={partIdx} className="text-indigo-400">{part}</span>;
              return <span key={partIdx}>{part}</span>;
            })}
          </div>
        );
      })}
    </div>
  );
}

export default function DeepWorkspaceVisualizerPage() {
  const params = useParams();
  const playgroundId = Array.isArray(params?.playground) ? params.playground[0] : (params?.playground || "");

  const {
    nodes, edges, summaries, isPending, selectedNode, selectedFile, metricsOverlayMode, chatHistories, isActionPending,
    setSelectedNode, setSelectedFile, setMetricsOverlayMode, loadTopologyMapData, executeAIAnalysis, askNodeQuestion, predictCodeChanges, resetStore,
  } = useVisualizerStore();

  const containerRef = useRef<HTMLDivElement>(null);
  const [sidebarWidth, setSidebarWidth] = useState(440); 
  const [inspectorWidth, setInspectorWidth] = useState(340); 
  
  const isResizingLeft = useRef(false);
  const isResizingRight = useRef(false);

  const [openTabs, setOpenTabs] = useState<TabItem[]>([]);
  const [activeTabId, setActiveTabId] = useState<string | null>(null);
  const [editableCodeString, setEditableCodeString] = useState("");

  // Control interface panel states
  const [isTerminalOpen, setIsTerminalOpen] = useState(false);
  const [isSandboxOpen, setIsSandboxOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [predictInput, setPredictInput] = useState("");
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const activeNodeId = selectedNode ? String(selectedNode.id || selectedNode._id) : "";
  const activeChat = chatHistories[activeNodeId] || [];

  useEffect(() => {
    if (playgroundId) loadTopologyMapData(playgroundId);
    return () => resetStore();
  }, [playgroundId]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat, isTerminalOpen]);

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

  // Handle hardware full-screen viewport bindings natively
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

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isActionPending || !activeNodeId) return;
    askNodeQuestion(activeNodeId, chatInput.trim());
    setChatInput("");
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
    <div ref={containerRef} className="w-full h-screen flex flex-col bg-zinc-950 overflow-hidden relative select-none text-white font-sans antialiased">
      
      {/* ULTRA-SLIM HEIGHT-EFFICIENT HEADER TOOLBAR PANEL */}
      <div className="h-10 border-b border-zinc-900 flex items-center px-3 justify-between shrink-0 bg-zinc-950 relative z-40">
        
        {/* Left Hand: System Metadata Indicators */}
        <div className="flex items-center gap-2">
          <Network size={13} className="text-indigo-400" />
          <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-medium">Workspace Engine</span>
        </div>

        {/* ABSOLUTE CENTER: Compact Small Title Configuration */}
        <div className="absolute left-1/3 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center gap-1.5 pointer-events-none select-none">
          <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
          <h1 className="text-[11px] font-mono font-bold tracking-widest uppercase text-zinc-400">Architecture Explorer</h1>
        </div>

        {/* Right Hand Control Triggers Layout */}
        <div className="flex items-center gap-2">
          
          {/* Metric Scalar Overlay Selection Strip */}
          <div className="flex items-center gap-0.5 border border-zinc-900 bg-zinc-900/10 p-0.5 rounded-md h-7">
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
                  metricsOverlayMode === mode.id ? "bg-zinc-900 text-indigo-400 font-bold border border-zinc-800" : "text-zinc-500 hover:text-zinc-300"
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>

          <button 
            onClick={() => { setIsTerminalOpen(p => !p); setIsSandboxOpen(false); }}
            disabled={!selectedNode}
            className={`h-7 px-2.5 rounded-md text-[10px] font-mono font-medium border flex items-center gap-1.5 transition-all ${isTerminalOpen ? "bg-indigo-600/10 text-indigo-400 border-indigo-500/30" : "bg-zinc-900/20 border-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"}`}
          >
            <MessageSquare size={11} /> Use AI Query
          </button>

          <button 
            onClick={() => { setIsSandboxOpen(p => !p); setIsTerminalOpen(false); }}
            disabled={!selectedNode}
            className={`h-7 px-2.5 rounded-md text-[10px] font-mono font-medium border flex items-center gap-1.5 transition-all ${isSandboxOpen ? "bg-amber-600/10 text-amber-400 border-amber-500/30" : "bg-zinc-900/20 border-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60"}`}
          >
            <ShieldAlert size={11} /> What-If Sandbox
          </button>

          {/* DYNAMIC FULL-SCREEN TOGGLER */}
          <button 
            onClick={toggleFullscreenViewport}
            className="h-7 px-2.5 bg-zinc-900/20 border border-zinc-900 hover:bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 rounded-md text-[10px] font-mono flex items-center gap-1 transition-all"
            title="Toggle presentation focus screen"
          >
            {isFullscreen ? <Minimize2 size={11} /> : <Maximize2 size={11} />}
            <span>{isFullscreen ? "Exit" : "Full Screen"}</span>
          </button>

          <Button onClick={() => executeAIAnalysis(playgroundId)} disabled={isPending} className="bg-indigo-600 hover:bg-indigo-700 h-7 text-[10px] font-bold px-3">
            {isPending ? <Loader2 className="animate-spin mr-1.5" size={11}/> : <Sparkles className="mr-1.5" size={11}/>}
            Parse
          </Button>
        </div>
      </div>

      {/* Core Split Body Layout */}
      <div className="flex-1 flex relative overflow-hidden w-full bg-zinc-950">
        
        {/* Code Editor Window */}
        <div 
          style={{ width: openTabs.length > 0 ? `${sidebarWidth}px` : "0px" }}
          className={`h-full bg-zinc-950 border-r border-zinc-900 z-30 relative transition-all duration-300 ease-out flex-shrink-0 overflow-hidden flex flex-col ${openTabs.length > 0 ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        >
          <div className="flex items-center bg-zinc-950 border-b border-zinc-900 overflow-x-auto scrollbar-none shrink-0 h-9">
            {openTabs.map((tab) => {
              const isActive = tab.id === activeTabId;
              return (
                <div
                  key={tab.id}
                  onClick={() => handleTabSelect(tab)}
                  className={`h-full flex items-center gap-2 px-3 border-r border-zinc-900 cursor-pointer text-[11px] font-mono transition-all duration-150 shrink-0 ${isActive ? "bg-zinc-900/40 text-indigo-400 font-bold border-b border-b-indigo-500" : "text-zinc-500 hover:text-zinc-300"}`}
                >
                  <FileCode size={11} />
                  <span className="max-w-[110px] truncate">{tab.label}</span>
                  <button onClick={(e) => handleTabClose(e, tab.id)} className="p-0.5 rounded hover:bg-zinc-800 text-zinc-600 hover:text-zinc-300 transition-colors">
                    <X size={9} />
                  </button>
                </div>
              );
            })}
          </div>

          <div className="p-3 flex-1 overflow-y-auto scrollbar-none flex flex-col min-h-0">
            <div className="flex-1 overflow-y-auto scrollbar-none rounded-lg border border-zinc-900 bg-zinc-950/40 p-4 relative min-h-[150px]">
              {activeTabId ? (
                <div className="absolute inset-4 overflow-auto font-mono text-[11px]">
                  <div className="absolute top-0 left-0 w-full min-h-full p-0 pointer-events-none z-10">
                    <HighlightedCodeText code={editableCodeString} />
                  </div>
                  <textarea
                    value={editableCodeString}
                    onChange={handleCodeWorkspaceInput}
                    spellCheck={false}
                    className="absolute top-0 left-0 w-full min-h-full bg-transparent text-transparent caret-indigo-400 resize-none outline-none overflow-hidden font-mono text-[11px] leading-relaxed p-0 whitespace-pre selection:bg-indigo-500/30 selection:text-transparent z-20"
                    placeholder="// Modifying architecture layouts here..."
                  />
                </div>
              ) : (
                <span className="text-zinc-600 italic font-mono text-[11px]">// Click an open codebase module slot...</span>
              )}
            </div>
          </div>
        </div>

        {openTabs.length > 0 && (
          <div onMouseDown={startResizeLeft} className="w-0.5 bg-transparent hover:bg-indigo-500/40 active:bg-indigo-500 transition-colors cursor-col-resize h-full z-40 shrink-0" />
        )}

        {/* Central Component Grid Canvas Viewport */}
        <div className="flex-1 h-full p-3 overflow-hidden min-w-[300px] relative">
          <CodeCanvas 
            nodes={nodes} 
            edges={edges} 
            summaries={summaries} 
            onNodeSelect={(node) => {
              setSelectedNode(node);
              if (node.type === "file") setSelectedFile(node);
            }} 
          />

          {/* Standalone Panel 1: Floating Conversational AI Terminal */}
          {isTerminalOpen && selectedNode && (
            <div className="absolute bottom-3 right-3 w-[380px] h-[400px] bg-zinc-950/95 border border-zinc-800 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden backdrop-blur-md animate-in slide-in-from-bottom-2 duration-150">
              <div className="p-2.5 border-b border-zinc-900 bg-zinc-900/40 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-indigo-400">
                  <MessageSquare size={12} />
                  <span className="truncate max-w-[240px]">Terminal: {selectedNode.label || "Module"}</span>
                </div>
                <button onClick={() => setIsTerminalOpen(false)} className="text-zinc-500 hover:text-zinc-300"><X size={13}/></button>
              </div>
              <div className="flex-1 p-3 overflow-y-auto space-y-3 scrollbar-none text-[11px]">
                {activeChat.length === 0 && (
                  <div className="text-center text-zinc-600 italic mt-20 font-mono text-[10px]">// Query state flows or write component implementations...</div>
                )}
                {activeChat.map((msg, i) => (
                  <div key={i} className={`flex flex-col max-w-[85%] rounded-lg p-2 font-sans leading-relaxed ${msg.role === "user" ? "bg-indigo-600/10 border border-indigo-500/20 text-indigo-200 ml-auto" : "bg-zinc-900 text-zinc-300"}`}>
                    <span className="text-[8px] font-mono uppercase text-zinc-500 mb-0.5">{msg.role === "user" ? "You" : "AI"}</span>
                    <div className="whitespace-pre-wrap text-[11px] font-sans">{msg.text}</div>
                  </div>
                ))}
                {isActionPending && (
                  <div className="bg-zinc-900/30 border border-zinc-900 text-zinc-500 rounded-lg p-2 mr-auto animate-pulse font-mono text-[10px]">Processing matrix traces...</div>
                )}
                <div ref={chatEndRef} />
              </div>
              <form onSubmit={handleSendChat} className="p-1.5 border-t border-zinc-900 bg-zinc-950 flex gap-1.5 shrink-0">
                <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask about this module logic..." className="flex-1 bg-zinc-900 border border-zinc-800 rounded-md px-2.5 py-1 text-[11px] text-white outline-none focus:border-indigo-500/50 placeholder-zinc-600" />
                <button type="submit" disabled={isActionPending || !chatInput.trim()} className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white p-1.5 rounded-md transition-all"><Send size={11} /></button>
              </form>
            </div>
          )}

          {/* Standalone Panel 2: Floating Structural Sandbox Predictor */}
          {isSandboxOpen && selectedNode && (
            <div className="absolute bottom-3 right-3 w-[400px] h-[400px] bg-zinc-950/95 border border-zinc-800 rounded-xl shadow-2xl z-50 flex flex-col overflow-hidden backdrop-blur-md animate-in slide-in-from-bottom-2 duration-150">
              <div className="p-2.5 border-b border-zinc-900 bg-zinc-900/40 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2 text-[11px] font-mono font-bold text-amber-400">
                  <ShieldAlert size={12} />
                  <span className="truncate max-w-[240px]">Sandbox: {selectedNode.label || "Module"}</span>
                </div>
                <button onClick={() => setIsSandboxOpen(false)} className="text-zinc-500 hover:text-zinc-300"><X size={13}/></button>
              </div>
              <div className="flex-1 p-3 overflow-y-auto space-y-3 scrollbar-none text-[11px]">
                <div className="p-2.5 bg-amber-950/10 border border-amber-900/20 text-zinc-400 rounded-lg leading-relaxed font-sans">
                  Simulate refactoring changes to trace cascading breakages or structural side effects across your wider codebase graph tree layout.
                </div>
                {summaries?.[activeNodeId]?.predictionInsight && (
                  <div className="space-y-1.5 border-t border-zinc-900 pt-2.5">
                    <span className="text-amber-400 font-mono text-[9px] uppercase tracking-wider font-semibold">Simulation Report:</span>
                    <div className="p-2.5 bg-zinc-900/40 border border-zinc-900 text-zinc-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">{summaries[activeNodeId].predictionInsight}</div>
                  </div>
                )}
                {isActionPending && (
                  <div className="bg-zinc-900/30 border border-zinc-900 text-zinc-500 rounded-lg p-2.5 animate-pulse font-mono text-[10px]">Analyzing coupling layers...</div>
                )}
              </div>
              <div className="p-2.5 border-t border-zinc-900 bg-zinc-950 space-y-1.5 shrink-0">
                <textarea value={predictInput} onChange={e => setPredictInput(e.target.value)} placeholder="Describe proposed modifications here..." className="w-full bg-zinc-900 border border-zinc-800 rounded-md p-2 text-[11px] text-white focus:outline-none focus:border-amber-500/50 resize-none h-12 placeholder-zinc-600" />
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

        {/* Right-Hand Architectural Documentation Inspector Sidebar */}
        <div style={{ width: selectedNode ? `${inspectorWidth}px` : "0px" }} className={`h-full z-30 shrink-0 transition-all duration-300 ease-out overflow-hidden ${selectedNode ? "opacity-100" : "opacity-0 pointer-events-none"}`}>
          <CodeInspector node={selectedNode} summary={summaries?.[selectedNode?.id || selectedNode?._id]} onClose={() => { setSelectedNode(null); setSelectedFile(null); }} />
        </div>
      </div>
    </div>
  );
}
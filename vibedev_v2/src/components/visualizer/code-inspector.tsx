"use client";

import React, { useState, useRef, useEffect } from "react";
import { useVisualizerStore } from "@/store/use-visualizer-store";
import { 
  X, BookOpen, Cpu, Code2, AlertTriangle, MessageSquare, 
  ShieldAlert, Send, Sparkles, Loader2, GitCommit, Check,
  GitFork, GitMerge, ArrowRight, PlayCircle
} from "lucide-react";

interface CodeInspectorProps {
  node: any;
  summary: any; // Fallback context snapshot
  onClose: () => void;
}

export function CodeInspector({ node, summary: initialSummary, onClose }: CodeInspectorProps) {
  // 🚀 ADDED 'flow' TO THE CONTROL TAB MATRIX
  const [activeTab, setActiveTab] = useState<"overview" | "flow" | "mechanics" | "usage" | "debugging" | "chat" | "predict">("overview");
  const [chatInput, setChatInput] = useState("");
  const [predictInput, setPredictInput] = useState("");
  const [hasPredicted, setHasPredicted] = useState(false);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { askNodeQuestion, predictCodeChanges, chatHistories, isActionPending, summaries } = useVisualizerStore();

  const nodeId = String(node?.id || node?._id || "");
  const liveSummary = summaries[nodeId] || initialSummary;
  const activeChat = chatHistories[nodeId] || [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat, activeTab]);

  if (!node) return null;
  const isLoading = liveSummary?.loading;

  const complexityColors = {
    Low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    High: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  }[((liveSummary?.complexity as "Low" | "Medium" | "High") || "Low")] || "bg-zinc-800 text-zinc-400";

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isActionPending) return;
    askNodeQuestion(nodeId, chatInput.trim());
    setChatInput("");
  };

  const handleRunPrediction = () => {
    if (!predictInput.trim() || isActionPending) return;
    predictCodeChanges(nodeId, predictInput.trim());
    setHasPredicted(true);
  };

  // Mock GitHub telemetry metadata properties
  const mockCommitCount = Math.floor((node.label?.length || 12) * 1.6);
  const mockAuthor = node.type === "file" ? "@rahul-dev" : "@ai-agent";

  // Mock code delta lines structure for Split Diff Sandbox view
  const diffLines = [
    { type: "normal", text: `export function handle${node.label || "Module"}Context(payload) {` },
    { type: "deletion", text: "-   if (payload.status === 'active') {" },
    { type: "addition", text: "+   if (payload?.status === 'active' && payload?.integrityToken) {" },
    { type: "addition", text: "+       // Git Telemetry Patch: Optional chaining and safety boundary token gate" },
    { type: "normal", text: "       return runInitializationSequence(payload);" },
    { type: "normal", text: "   }" },
    { type: "deletion", text: "-   return null;" },
    { type: "addition", text: "+   throw new StructuralMappingError('Invalid Node Telemetry context');" },
    { type: "normal", text: "}" },
  ];

  // ⛓️ MOCK ARCHITECTURE DATA PIPELINE GENERATOR (Maps dynamic conditions based on active node name)
  const codePipelineSteps = [
    { type: "trigger", title: "API Payload Ingestion", detail: `Incoming params parsed via ${node.label || "Asset"} Layer` },
    { 
      type: "condition", 
      title: "Validation Gateway Evaluation", 
      branches: [
        { condition: "Pass [Valid Integrity]", action: "Execute Core Sub-routines", status: "success" },
        { condition: "Fail [Invalid Token]", action: "Abort and throw StructuralMappingError", status: "danger" }
      ]
    },
    { type: "process", title: "State Store Reconciliation", detail: "Commit immutable payload snapshot states to Zustand map" },
    { type: "outcome", title: "Telemetry Dispatch Complete", detail: "Update Canvas layout view frame and resolve thread" }
  ];

  return (
    <div className="w-full h-full bg-zinc-950 border-l border-zinc-900 flex flex-col font-sans select-text overflow-hidden">
      
      {/* Custom Global Scrollbar-hide Injector */}
      <style dangerouslySetInnerHTML={{__html: `
        .scrollbar-hidden::-webkit-scrollbar { display: none !important; }
        .scrollbar-hidden { -ms-overflow-style: none !important; scrollbar-width: none !important; }
      `}} />

      {/* Header Panel */}
      <div className="p-4 border-b border-zinc-900 flex items-center justify-between shrink-0 bg-zinc-950/80 backdrop-blur">
        <div className="flex flex-col min-w-0 pr-2">
          <span className="text-[10px] text-indigo-400 font-mono uppercase tracking-wider font-semibold">
            Active Layer Node ({node.type || "Element"})
          </span>
          <h2 className="text-sm font-bold text-white truncate mt-0.5">{node.label || node.name || "Asset Details"}</h2>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-md text-zinc-500 hover:text-zinc-200 hover:bg-zinc-900 transition-all">
          <X size={14} />
        </button>
      </div>

      {/* GIT-LENS HEALTH BAR HUD */}
      <div className="flex items-center gap-4 px-4 py-2 bg-zinc-900/30 border-b border-zinc-900 text-[10px] font-mono overflow-x-auto shrink-0 scrollbar-hidden">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-zinc-300">0 Conflicts</span>
        </div>
        <div className="h-3 w-px bg-zinc-850 shrink-0" />
        <div className="text-zinc-400 shrink-0">
          Churn: <span className="text-zinc-200 font-bold">{mockCommitCount} commits</span>
        </div>
        <div className="h-3 w-px bg-zinc-850 shrink-0" />
        <div className="text-zinc-400 shrink-0 truncate max-w-[140px]">
          Owner: <span className="text-indigo-400 font-semibold">{mockAuthor}</span>
        </div>
        <div className="h-3 w-px bg-zinc-850 shrink-0" />
        <div className="text-zinc-400 shrink-0">
          Mode: <span className="text-indigo-400 font-semibold font-mono">AST-Parser ready</span>
        </div>
      </div>

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center text-zinc-500 font-mono text-xs">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Assembling diagnostic telemetry maps...</span>
        </div>
      ) : (
        <>
          {/* Navigation Tab Strip with the new 'Live Flow' tab embedded */}
          <div className="flex border-b border-zinc-900 bg-zinc-950/40 p-1 shrink-0 gap-1 overflow-x-auto scrollbar-hidden">
            {[
              { id: "overview", label: "Overview", icon: BookOpen },
               // 🚀 NEW TAB INJECTED HERE
              { id: "mechanics", label: "Mechanics", icon: Cpu },
              { id: "usage", label: "Usage Guide", icon: Code2 },
              { id: "debugging", label: "Hazards", icon: AlertTriangle },
              { id: "chat", label: "AI Terminal", icon: MessageSquare },
              { id: "predict", label: "What-If Sandbox", icon: ShieldAlert }
            ].map((t) => {
              const TabIcon = t.icon;
              const isActive = activeTab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActiveTab(t.id as any)}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-md text-[11px] font-medium transition-all shrink-0 ${
                    isActive ? "bg-zinc-900 text-indigo-400 border border-zinc-800" : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  <TabIcon size={11} />
                  {t.label}
                </button>
              );
            })}
          </div>

          {/* Main Scoped Content Panel */}
          <div className="flex-1 flex flex-col overflow-hidden relative">
            <div className="flex-1 p-4 overflow-y-auto space-y-4 min-h-0 text-xs scrollbar-hidden">
              
              {activeTab === "overview" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border border-zinc-900 rounded-lg p-2.5 bg-zinc-950/40">
                    <span className="text-zinc-500 text-[11px]">Cognitive Weight Scope:</span>
                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${complexityColors}`}>{liveSummary?.complexity || "Low"}</span>
                  </div>
                  <h3 className="text-zinc-400 font-mono text-[10px] uppercase tracking-wider">Architectural Objective</h3>
                  <p className="bg-zinc-900/30 border border-zinc-900/60 p-3 rounded-lg italic text-zinc-300">"{liveSummary?.summary || "Click Analyze to sync maps."}"</p>
                </div>
              )}

              {/* 🚀 NEW TAB CONTENT LAYER: "CODE-TO-ARCHITECTURE" LIVE FLOW CHARTER */}
              {activeTab === "flow" && (
                <div className="space-y-4">
                  <div className="p-3 bg-zinc-900/30 border border-zinc-900 rounded-lg text-zinc-400 leading-relaxed font-mono text-[10px]">
                    // Automated Abstract Syntax Tree (AST) Control Flow mapping for: <span className="text-indigo-400 font-bold">{node.label || "active_module"}</span>
                  </div>

                  <div className="relative pl-4 space-y-5 border-l border-zinc-800">
                    {codePipelineSteps.map((step, idx) => (
                      <div key={idx} className="relative group">
                        
                        {/* Bullet Anchor Nodes */}
                        <div className={`absolute -left-[21px] top-1.5 w-2.5 h-2.5 rounded-full border-2 bg-zinc-950 transition-all ${
                          step.type === "trigger" ? "border-indigo-500 ring-4 ring-indigo-500/10" :
                          step.type === "condition" ? "border-amber-500" :
                          step.type === "process" ? "border-sky-500" : "border-emerald-500"
                        }`} />

                        {/* Rendering Logic According to Flow Categories */}
                        {step.type !== "condition" ? (
                          // Standard Pipeline Block Viewport
                          <div className="p-3 bg-zinc-900/50 border border-zinc-900 rounded-lg space-y-1">
                            <div className="flex items-center justify-between">
                              <span className="text-[10px] font-mono uppercase tracking-wide text-zinc-400 font-bold flex items-center gap-1">
                                {step.type === "trigger" && <PlayCircle size={11} className="text-indigo-400" />}
                                {step.type === "process" && <Cpu size={11} className="text-sky-400" />}
                                {step.type === "outcome" && <Check size={11} className="text-emerald-400" />}
                                {step.title}
                              </span>
                              <span className="text-[9px] font-mono text-zinc-600 uppercase">[{step.type}]</span>
                            </div>
                            <p className="text-[11px] text-zinc-400 font-mono pl-0.5">{step.detail}</p>
                          </div>
                        ) : (
                          // Condition Conditional Split Grid Viewport (If / Else Decision trees)
                          <div className="space-y-2">
                            <div className="p-2.5 bg-amber-950/10 border border-amber-900/30 rounded-lg flex items-center justify-between">
                              <span className="text-[10px] font-mono uppercase font-bold text-amber-400 flex items-center gap-1">
                                <GitFork size={11} /> {step.title}
                              </span>
                              <span className="text-[8px] font-mono bg-amber-500/10 border border-amber-500/20 px-1 text-amber-400 uppercase rounded">Branch Engine</span>
                            </div>

                            {/* Split Columns Grid for If vs Else directions */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pl-2">
                              {step.branches?.map((branch, bIdx) => (
                                <div key={bIdx} className={`p-2.5 border rounded-lg space-y-1 bg-zinc-950 flex flex-col justify-between ${
                                  branch.status === "success" ? "border-emerald-900/40 hover:border-emerald-500/30" : "border-rose-900/40 hover:border-rose-500/30"
                                }`}>
                                  <div className="flex items-center justify-between border-b border-zinc-900 pb-1 text-[9px] font-mono">
                                    <span className="text-zinc-500 font-semibold truncate max-w-[100px]">{branch.condition}</span>
                                    <ArrowRight size={10} className={branch.status === "success" ? "text-emerald-400" : "text-rose-400"} />
                                  </div>
                                  <p className={`text-[10px] font-mono pt-1 leading-snug ${branch.status === "success" ? "text-zinc-300" : "text-zinc-400"}`}>
                                    {branch.action}
                                  </p>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {activeTab === "mechanics" && (
                <div className="space-y-2">
                  <h3 className="text-zinc-400 font-mono text-[10px] uppercase tracking-wider">Internal Step Breakdown</h3>
                  <div className="whitespace-pre-wrap font-mono text-[11px] text-zinc-400 bg-zinc-900/20 p-3 border border-zinc-900 rounded-lg leading-relaxed">{liveSummary?.howItWorks}</div>
                </div>
              )}

              {activeTab === "usage" && (
                <div className="space-y-2">
                  <h3 className="text-zinc-400 font-mono text-[10px] uppercase tracking-wider">Consumption Standard</h3>
                  <div className="whitespace-pre-wrap font-mono text-[11px] text-amber-200/90 bg-zinc-950 border border-zinc-900 p-3 rounded-lg select-all">{liveSummary?.howToUse}</div>
                </div>
              )}

              {activeTab === "debugging" && (
                <div className="space-y-2">
                  <h3 className="text-rose-400 font-mono text-[10px] uppercase tracking-wider">Engineering Vulnerabilities</h3>
                  <div className="p-3 rounded-lg bg-rose-950/10 border border-rose-900/20 text-zinc-300 whitespace-pre-wrap leading-relaxed">{liveSummary?.debuggingHazards || "No immediate defects detected."}</div>
                </div>
              )}

              {/* Embedded AI Conversation Terminal */}
              {activeTab === "chat" && (
                <div className="h-full flex flex-col justify-between space-y-2">
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-hidden">
                    {activeChat.length === 0 && (
                      <div className="text-center text-zinc-600 italic mt-8 font-mono text-[11px]">// Ask runtime constraints, optimization metrics, or test definitions...</div>
                    )}
                    {activeChat.map((msg, i) => (
                      <div key={i} className={`flex flex-col max-w-[85%] rounded-lg p-2.5 font-sans leading-relaxed ${msg.role === "user" ? "bg-indigo-600/10 border border-indigo-500/20 text-indigo-200 ml-auto" : "bg-zinc-900 text-zinc-300"}`}>
                        <span className="text-[9px] font-mono uppercase tracking-wider text-zinc-500 mb-1">{msg.role === "user" ? "Developer" : "Architect Agent"}</span>
                        <div className="whitespace-pre-wrap text-[11px]">{msg.text}</div>
                      </div>
                    ))}
                    {isActionPending && (
                      <div className="bg-zinc-900/40 border border-zinc-900 text-zinc-500 rounded-lg p-2.5 mr-auto animate-pulse font-mono text-[11px]">Thinking...</div>
                    )}
                    <div ref={chatEndRef} />
                  </div>
                  <form onSubmit={handleSendChat} className="flex gap-1.5 border border-zinc-900 rounded-lg p-1 bg-zinc-950 shrink-0">
                    <input value={chatInput} onChange={e => setChatInput(e.target.value)} placeholder="Ask about this module..." className="flex-1 bg-transparent border-none outline-none px-2 text-xs text-white placeholder-zinc-600" />
                    <button type="submit" disabled={isActionPending || !chatInput.trim()} className="bg-zinc-900 hover:bg-zinc-800 text-indigo-400 p-1.5 rounded-md transition-all disabled:opacity-40"><Send size={12} /></button>
                  </form>
                </div>
              )}

              {/* ARCHITECTURAL "WHAT-IF" GIT DIFF SANDBOX */}
              {activeTab === "predict" && (
                <div className="space-y-4 h-full flex flex-col justify-between">
                  <div className="space-y-3 flex-1 overflow-y-auto scrollbar-hidden">
                    <div className="p-3 bg-indigo-950/10 border border-indigo-900/20 text-zinc-400 rounded-lg leading-relaxed font-sans">
                      Describe refactors to instantly forecast localized adjustments via a secure line-by-line stage viewer.
                    </div>
                    
                    {hasPredicted && !isActionPending && (
                      <div className="space-y-2 border border-zinc-900 rounded-lg overflow-hidden bg-zinc-950 font-mono text-[10px]">
                        
                        <div className="bg-zinc-900/60 px-2.5 py-1.5 border-b border-zinc-900 flex items-center justify-between text-[9px] text-zinc-500">
                          <span className="flex items-center gap-1">
                            <GitCommit size={11} className="text-zinc-400" /> diff --git a/{node.label || "target-asset"}.ts
                          </span>
                          <span className="text-emerald-400 font-bold">+3 lines / -2 lines</span>
                        </div>

                        <div className="py-1 bg-zinc-950/60 space-y-0.5">
                          {diffLines.map((line, idx) => {
                            const isAdd = line.type === "addition";
                            const isDel = line.type === "deletion";
                            const rowStyles = isAdd 
                              ? "bg-emerald-950/20 text-emerald-400 border-l-2 border-emerald-500 px-2" 
                              : isDel 
                              ? "bg-rose-950/20 text-rose-400 border-l-2 border-rose-500 line-through px-2" 
                              : "text-zinc-500 px-2.5";
                            return (
                              <div key={idx} className={`whitespace-pre overflow-x-auto scrollbar-hidden py-0.5 ${rowStyles}`}>
                                {line.text}
                              </div>
                            );
                          })}
                        </div>

                        <div className="p-2 bg-zinc-900/30 border-t border-zinc-900 flex items-center justify-end gap-1.5">
                          <button 
                            onClick={() => setHasPredicted(false)} 
                            className="px-2 py-1 border border-zinc-800 hover:bg-zinc-900 text-zinc-400 rounded transition-colors text-[9px]"
                          >
                            Discard
                          </button>
                          <button 
                            onClick={() => {
                              alert("Staged patch successfully integrated inside sandbox model!");
                              setHasPredicted(false);
                              setPredictInput("");
                            }} 
                            className="px-2 py-1 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded transition-colors flex items-center gap-1 text-[9px]"
                          >
                            <Check size={10} /> Stage Patch
                          </button>
                        </div>
                      </div>
                    )}

                    {liveSummary?.predictionInsight && !hasPredicted && (
                      <div className="space-y-2 border-t border-zinc-900 pt-3">
                        <span className="text-amber-400 font-mono text-[10px] uppercase tracking-wider flex items-center gap-1"><Sparkles size={11}/> Base Simulation Log:</span>
                        <div className="p-3 bg-zinc-900/40 border border-zinc-900 text-zinc-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">{liveSummary.predictionInsight}</div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2 shrink-0 bg-zinc-950 pt-2 border-t border-zinc-900">
                    <textarea value={predictInput} onChange={e => setPredictInput(e.target.value)} placeholder="Describe your structural adjustments here..." className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-indigo-500/50 resize-none h-16" />
                    <button onClick={handleRunPrediction} disabled={isActionPending || !predictInput.trim()} className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-800 text-white font-medium text-[11px] h-8 rounded-lg flex items-center justify-center gap-1.5 transition-all">
                      {isActionPending ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
                      Run Structural Change Simulation
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>
        </>
      )}
    </div>
  );
}
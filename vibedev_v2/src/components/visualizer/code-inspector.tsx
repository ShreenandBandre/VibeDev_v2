// filepath: /src/components/visualizer/code-inspector.tsx
import React, { useState, useRef, useEffect } from "react";
import { useVisualizerStore } from "@/store/use-visualizer-store";
import { X, BookOpen, Cpu, Code2, AlertTriangle, MessageSquare, ShieldAlert, Send, Sparkles, Loader2 } from "lucide-react";

interface CodeInspectorProps {
  node: any;
  summary: any;
  onClose: () => void;
}

export function CodeInspector({ node, summary, onClose }: CodeInspectorProps) {
  const [activeTab, setActiveTab] = useState<"overview" | "mechanics" | "usage" | "debugging" | "chat" | "predict">("overview");
  const [chatInput, setChatInput] = useState("");
  const [predictInput, setPredictInput] = useState("");
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const { askNodeQuestion, predictCodeChanges, chatHistories, isActionPending } = useVisualizerStore();

  const nodeId = String(node?.id || node?._id || "");
  const activeChat = chatHistories[nodeId] || [];

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeChat, activeTab]);

  if (!node) return null;
  const isLoading = summary?.loading;

  const complexityColors = {
    Low: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Medium: "bg-amber-500/10 text-amber-400 border-amber-500/20",
    High: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  }[((summary?.complexity as "Low" | "Medium" | "High") || "Low")] || "bg-zinc-800 text-zinc-400";

  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim() || isActionPending) return;
    askNodeQuestion(nodeId, chatInput.trim());
    setChatInput("");
  };

  const handleRunPrediction = () => {
    if (!predictInput.trim() || isActionPending) return;
    predictCodeChanges(nodeId, predictInput.trim());
  };

  return (
    <div className="w-full h-full bg-zinc-950 border-l border-zinc-900 flex flex-col font-sans select-text">
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

      {isLoading ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-3 p-6 text-center text-zinc-500 font-mono text-xs">
          <div className="w-5 h-5 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          <span>Assembling diagnostic telemetry maps...</span>
        </div>
      ) : (
        <>
          {/* Navigation Tab Strip */}
          <div className="flex border-b border-zinc-900 bg-zinc-950/40 p-1 shrink-0 gap-1 overflow-x-auto scrollbar-none">
            {[
              { id: "overview", label: "Overview", icon: BookOpen },
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
            <div className="flex-1 p-4 overflow-y-auto space-y-4 scrollbar-none min-h-0 text-xs">
              
              {activeTab === "overview" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between border border-zinc-900 rounded-lg p-2.5 bg-zinc-950/40">
                    <span className="text-zinc-500 text-[11px]">Cognitive Weight Scope:</span>
                    <span className={`text-[10px] uppercase font-mono px-2 py-0.5 rounded border ${complexityColors}`}>{summary?.complexity || "Low"}</span>
                  </div>
                  <h3 className="text-zinc-400 font-mono text-[10px] uppercase tracking-wider">Architectural Objective</h3>
                  <p className="bg-zinc-900/30 border border-zinc-900/60 p-3 rounded-lg italic text-zinc-300">"{summary?.summary || "Click Analyze to sync maps."}"</p>
                </div>
              )}

              {activeTab === "mechanics" && (
                <div className="space-y-2">
                  <h3 className="text-zinc-400 font-mono text-[10px] uppercase tracking-wider">Internal Step Breakdown</h3>
                  <div className="whitespace-pre-wrap font-mono text-[11px] text-zinc-400 bg-zinc-900/20 p-3 border border-zinc-900 rounded-lg leading-relaxed">{summary?.howItWorks}</div>
                </div>
              )}

              {activeTab === "usage" && (
                <div className="space-y-2">
                  <h3 className="text-zinc-400 font-mono text-[10px] uppercase tracking-wider">Consumption Standard</h3>
                  <div className="whitespace-pre-wrap font-mono text-[11px] text-amber-200/90 bg-zinc-950 border border-zinc-900 p-3 rounded-lg select-all">{summary?.howToUse}</div>
                </div>
              )}

              {activeTab === "debugging" && (
                <div className="space-y-2">
                  <h3 className="text-rose-400 font-mono text-[10px] uppercase tracking-wider">Engineering Vulnerabilities</h3>
                  <div className="p-3 rounded-lg bg-rose-950/10 border border-rose-900/20 text-zinc-300 whitespace-pre-wrap leading-relaxed">{summary?.debuggingHazards || "No immediate defects detected."}</div>
                </div>
              )}

              {/* FEATURE 2 UI: Embedded AI Conversation Terminal */}
              {activeTab === "chat" && (
                <div className="h-full flex flex-col justify-between space-y-2">
                  <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-none">
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

              {/* FEATURE 1 UI: Architectural "What-If" Impact Sandbox */}
              {activeTab === "predict" && (
                <div className="space-y-4 h-full flex flex-col justify-between">
                  <div className="space-y-3 flex-1 overflow-y-auto scrollbar-none">
                    <div className="p-3 bg-indigo-950/10 border border-indigo-900/20 text-zinc-400 rounded-lg leading-relaxed font-sans">
                      Input structural refactors (e.g., *"Change returning parameters from array to objects"*), and simulate impact across the codebase.
                    </div>
                    {summary?.predictionInsight && (
                      <div className="space-y-2 border-t border-zinc-900 pt-3">
                        <span className="text-amber-400 font-mono text-[10px] uppercase tracking-wider flex items-center gap-1"><Sparkles size={11}/> Simulation Report:</span>
                        <div className="p-3 bg-zinc-900/40 border border-zinc-900 text-zinc-300 font-mono text-[11px] whitespace-pre-wrap leading-relaxed">{summary.predictionInsight}</div>
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
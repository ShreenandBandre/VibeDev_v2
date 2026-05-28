"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useVisualizerStore } from "@/store/use-visualizer-store";
import { 
  X, GitBranch, RefreshCw, ShieldCheck, AlertOctagon, 
  AlertTriangle, Info, Lightbulb, Loader2, FileCode, CheckSquare
} from "lucide-react";
import { analyzeCodeWithGroq } from "@/app/actions/ai-analyzer";

interface GlobalGitDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalGitDrawer({ isOpen, onClose }: GlobalGitDrawerProps) {
  // Zustand State Management Elements
  const activeBranch = useVisualizerStore((state) => state.activeBranch) || "main";
  const nodes = useVisualizerStore((state) => state.nodes) || [];
  const commitLogs = useVisualizerStore((state) => state.commitLogs) || [];
  const isGitActionLoading = useVisualizerStore((state) => state.isGitActionLoading);
  
  const setNodes = useVisualizerStore((state) => state.setNodes);
  const setActiveBranch = useVisualizerStore((state) => state.setActiveBranch);
  const refreshRemoteLogs = useVisualizerStore((state) => state.refreshRemoteLogs);
  const executeLiveCommitAndPush = useVisualizerStore((state) => state.executeLiveCommitAndPush);
  
  const activeNodeId = useVisualizerStore((state) => (state as any).activeNodeId || (state as any).selectedNodeId);

  const [activeTab, setActiveTab] = useState<"changes" | "branches" | "pipelines">("changes");
  const [aiInsights, setAiInsights] = useState<any[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // 🎯 Local State for Git Commit Message
  const [commitMessage, setCommitMessage] = useState("");
  const [isCommitting, setIsCommitting] = useState(false);

  // Available Workspace Branches Context Simulation Array
  const workspaceBranches = ["main", "feature/auth-pipeline", "dev-v2", "hotfix/cors-buffer"];

  // 🎯 DYNAMIC EDITOR SCANNER
  const currentActiveFile = useMemo(() => {
    if (activeNodeId) {
      return nodes.find(node => node.id === activeNodeId || node._id === activeNodeId);
    }
    return nodes.find(node => node.label === "route.ts" || node.name === "route.ts") || nodes[0];
  }, [nodes, activeNodeId]);

  // 🎯 REAL-TIME CHANGE DETECTOR
  const modifiedFilesOnly = useMemo(() => {
    return nodes.filter(node => {
      if (node.type !== "file" && node.type !== "module" && !node.name?.endsWith(".ts") && !node.label?.endsWith(".ts")) {
        return false;
      }
      return node.isDirty || node.hasChanges;
    });
  }, [nodes]);

  // Sync logs when branches tab mounts
  useEffect(() => {
    if (activeTab === "branches" && refreshRemoteLogs) {
      refreshRemoteLogs().catch((err) => console.error("Logs update bypassed:", err));
    }
  }, [activeTab, activeBranch]);

  // 🚀 ACTUAL DYNAMIC GIT COMMIT & PUSH PIPELINE ACTION (FOR LOCAL & PRODUCTION)
  const handleGitCommit = async () => {
    if (!commitMessage.trim() || modifiedFilesOnly.length === 0) return;

    setIsCommitting(true);

    try {
      if (executeLiveCommitAndPush) {
        // Triggers the real dynamic actions logic inside the store
        const success = await executeLiveCommitAndPush(commitMessage.trim());
        
        if (success) {
          const resetNodes = nodes.map(node => {
            if (node.isDirty || node.hasChanges) {
              return {
                ...node,
                isDirty: false,
                hasChanges: false
              };
            }
            return node;
          });
          
          setNodes(resetNodes);
          setCommitMessage(""); // Reset textbox
          alert(`🎉 Successfully pushed live commit to remote repository branch [${activeBranch}]! Webhook triggered.`);
        } else {
          alert("❌ Live commit orchestration transaction failed. Verify pipeline logs.");
        }
      } else {
        alert("❌ Critical: Live repository commit action handler missing on client node store configuration.");
      }
    } catch (err) {
      console.error("Git connection transaction crash error:", err);
      alert("❌ Dynamic pushing action timed out or met network boundary limits.");
    } finally {
      setIsCommitting(false);
    }
  };

  const runLiveGroqAnalysis = async () => {
    if (!currentActiveFile) return;
    
    setIsAnalyzing(true);
    try {
      const codeBuffer = currentActiveFile.content || "// Active Code State Buffer Empty";
      const fileName = currentActiveFile.label || currentActiveFile.name || "route.ts";
      
      const metrics = await analyzeCodeWithGroq(codeBuffer, fileName);
      setAiInsights(metrics);
    } catch (err) {
      console.error(err);
    } finally {
      setIsAnalyzing(false);
    }
  };

  useEffect(() => {
    if (activeTab === "pipelines" && currentActiveFile) {
      runLiveGroqAnalysis();
    }
  }, [activeTab, currentActiveFile?.id]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 w-[460px] bg-zinc-900 border-l border-zinc-800 shadow-2xl z-50 flex flex-col font-sans text-zinc-200 antialiased select-none">
      
      {/* HEADER */}
      <div className="p-4 border-b border-zinc-800 bg-zinc-950/60 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 bg-indigo-500/10 rounded-md border border-indigo-500/20 text-indigo-400">
            <GitBranch size={16} />
          </div>
          <div>
            <h2 className="text-xs font-mono font-bold tracking-wide uppercase text-zinc-100">Project Workspace Git</h2>
            <p className="text-[10px] font-mono text-zinc-500">Active Node Branch: <span className="text-indigo-400 font-semibold">{activeBranch}</span></p>
          </div>
        </div>
        <button onClick={onClose} className="p-1.5 rounded-md hover:bg-zinc-800 text-zinc-400 hover:text-zinc-100 transition-colors">
          <X size={14} />
        </button>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex border-b border-zinc-800 bg-zinc-900/40 shrink-0 h-9">
        {[
          { id: "changes", label: `Changes (${modifiedFilesOnly.length})` },
          { id: "branches", label: "Branches" },
          { id: "pipelines", label: `AI Integrity (${isAnalyzing ? "..." : aiInsights.length})` }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex-1 text-[10px] font-mono font-bold uppercase tracking-wider border-r border-zinc-800 transition-all ${
              activeTab === tab.id ? "bg-zinc-950 text-indigo-400 border-b-2 border-b-indigo-500" : "text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* BODY REGION */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-0 bg-zinc-900/20">
        
        {/* CHANGES TAB LAYER */}
        {activeTab === "changes" && (
          <div className="space-y-4 flex flex-col h-full justify-between">
            <div className="space-y-2 flex-1 overflow-y-auto">
              <div className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider font-bold">Modified Working Buffers</div>
              
              {modifiedFilesOnly.length === 0 ? (
                <div className="p-8 border border-dashed border-zinc-800 rounded-lg text-center font-mono text-[11px] text-zinc-600">
                  // No uncommitted file modifications detected in editor session.
                </div>
              ) : (
                <div className="space-y-1.5">
                  {modifiedFilesOnly.map((file) => (
                    <div key={file.id || file.name} className="p-2.5 rounded-lg border border-amber-500/30 bg-zinc-950/80 flex items-center justify-between gap-3 font-mono border-l-2 border-l-amber-500">
                      <div className="flex items-center gap-2 min-w-0 flex-1">
                        <FileCode size={12} className="text-amber-400 shrink-0" />
                        <span className="text-[11px] text-zinc-200 truncate font-medium">{file.label || file.name}</span>
                      </div>
                      <span className="text-[8px] px-1.5 py-0.5 rounded font-bold uppercase bg-amber-500/10 border border-amber-500/20 text-amber-400 shrink-0">Modified</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* GIT STAGING & COMMIT INPUT CONTROL PANEL */}
            {modifiedFilesOnly.length > 0 && (
              <div className="p-3 bg-zinc-950 border border-zinc-800 rounded-xl space-y-2 mt-4 shrink-0">
                <div className="text-[9px] font-mono text-zinc-500 uppercase tracking-wider font-bold">Stage & Commit Changes</div>
                <input 
                  type="text" 
                  value={commitMessage}
                  onChange={(e) => setCommitMessage(e.target.value)}
                  placeholder="feat: optimize api data pipelines layout"
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-lg p-2 font-mono text-[11px] text-zinc-200 focus:outline-none focus:border-indigo-500 placeholder-zinc-600"
                />
                <button
                  onClick={handleGitCommit}
                  disabled={isCommitting || !commitMessage.trim()}
                  className="w-full h-8 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 font-mono text-[11px] font-bold uppercase tracking-wider text-white rounded-lg flex items-center justify-center gap-1.5 transition-all shadow-md"
                >
                  {isCommitting ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      Pushing Commits...
                    </>
                  ) : (
                    <>
                      <CheckSquare size={12} />
                      Commit to {activeBranch}
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* DYNAMIC BRANCHES & TRACKING COMMITS TIMELINE LAYER */}
        {activeTab === "branches" && (
          <div className="space-y-4 font-mono">
            {/* Branch Selector List */}
            <div className="space-y-2">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold">Available Workspace Branches</div>
              <div className="grid grid-cols-2 gap-2">
                {workspaceBranches.map((branchName) => (
                  <button
                    key={branchName}
                    onClick={() => setActiveBranch && setActiveBranch(branchName)}
                    className={`p-2 rounded-lg border text-left text-[11px] truncate flex items-center gap-1.5 transition-all ${
                      activeBranch === branchName 
                        ? "bg-indigo-500/10 border-indigo-500/40 text-indigo-400 font-bold" 
                        : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:border-zinc-700 hover:text-zinc-200"
                    }`}
                  >
                    <GitBranch size={11} className={activeBranch === branchName ? "text-indigo-400" : "text-zinc-600"} />
                    {branchName}
                  </button>
                ))}
              </div>
            </div>

            {/* Remote Commit Logs Timeline */}
            <div className="space-y-2 pt-2">
              <div className="text-[10px] text-zinc-500 uppercase tracking-wider font-bold flex items-center justify-between">
                <span>Branch History Logs</span>
                {isGitActionLoading && <Loader2 size={10} className="animate-spin text-indigo-400" />}
              </div>

              {isGitActionLoading && commitLogs.length === 0 ? (
                <div className="p-8 border border-dashed border-zinc-800 rounded-lg text-center text-[11px] text-zinc-600">
                  Fetching live git tree nodes execution matrix...
                </div>
              ) : commitLogs.length === 0 ? (
                <div className="p-6 border border-dashed border-zinc-800 rounded-lg text-center text-[11px] text-zinc-600">
                  // No remote logs verified on branch [{activeBranch}].
                </div>
              ) : (
                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {commitLogs.map((log) => (
                    <div key={log.sha} className="p-2 bg-zinc-950/60 border border-zinc-800 rounded-lg text-[10px] space-y-1">
                      <div className="flex items-center justify-between text-zinc-500 text-[9px]">
                        <span className="text-indigo-400 font-bold font-sans">@{log.author || "developer"}</span>
                        <span>{log.sha ? log.sha.substring(0, 7) : "74b1f2a"}</span>
                      </div>
                      <p className="text-zinc-200 text-[11px] line-clamp-2 font-sans">{log.message}</p>
                      <div className="text-[8px] text-zinc-600 text-right">{log.date || "Just now"}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* AI INTEGRITY */}
        {activeTab === "pipelines" && (
          <div className="space-y-3.5">
            <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800 flex items-center justify-between">
              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-1.5 text-[11px] font-mono text-zinc-300 font-bold uppercase">
                  <ShieldCheck size={13} className="text-emerald-400" />
                  <span>Groq AI Cloud Core</span>
                </div>
                <p className="text-[10px] text-zinc-400 font-mono truncate">
                  Target: <span className="text-zinc-200 font-bold">{currentActiveFile?.label || "route.ts"}</span>
                </p>
              </div>
              <button 
                onClick={runLiveGroqAnalysis} 
                disabled={isAnalyzing || !currentActiveFile}
                className="p-1.5 bg-zinc-900 border border-zinc-800 text-[10px] font-mono font-bold rounded-md text-indigo-400 flex items-center gap-1"
              >
                {isAnalyzing ? <Loader2 size={11} className="animate-spin" /> : <RefreshCw size={11} />}
                Run Scan
              </button>
            </div>

            {isAnalyzing ? (
              <div className="p-12 border border-dashed border-zinc-800 rounded-xl text-center space-y-2">
                <Loader2 size={22} className="animate-spin text-indigo-500 mx-auto" />
                <p className="font-mono text-[11px] text-zinc-500">Evaluating your editor code tokens with Groq cluster...</p>
              </div>
            ) : aiInsights.length === 0 ? (
              <div className="p-8 border border-dashed border-zinc-800 rounded-lg text-center font-mono text-[11px] text-zinc-600">
                // Click "Run Scan" to push current layout code to Llama architecture check.
              </div>
            ) : (
              <div className="space-y-2.5">
                {aiInsights.map((insight, idx) => (
                  <div 
                    key={insight.id || idx} 
                    className={`p-3 rounded-xl border font-mono bg-zinc-950/40 ${
                      insight.type === "error" ? "border-red-500/20 bg-red-500/[0.01]" :
                      insight.type === "warning" ? "border-amber-500/20 bg-amber-500/[0.01]" : "border-sky-500/20 bg-sky-500/[0.01]"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 text-[10px]">
                      <span className={insight.type === "error" ? "text-red-400 font-bold" : "text-amber-400 font-bold"}>
                        {insight.metric || "Optimization Alert"}
                      </span>
                      <span className="text-[8px] font-bold text-zinc-500 bg-zinc-900 border border-zinc-800 px-1 py-0.5 rounded">
                        Impact: {insight.impactScore}%
                      </span>
                    </div>
                    <p className="text-[10px] text-zinc-300 font-sans mt-2 leading-relaxed">{insight.description}</p>
                    <div className="mt-2.5 pt-2 border-t border-zinc-800/40 flex gap-1.5 text-[9px] text-zinc-400 bg-zinc-950/30 -mx-3 -mb-3 p-2 rounded-b-xl">
                      <Lightbulb size={11} className="text-indigo-400 shrink-0 mt-0.5" />
                      <p className="font-sans"><strong className="font-mono text-zinc-300">Fix Path:</strong> {insight.recommendation}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useWorkspace } from "@/context/workspace-context";
import { getPlatformChangelogStream } from "@/app/actions/changelog";
import { Loader2, GitPullRequest, GitBranch, Terminal, ShieldAlert } from "lucide-react";

export function ChangelogStream() {
  const { currentWorkspaceType, activeOrgId } = useWorkspace();
  const [logs, setLogs] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();

  const loadStreamData = () => {
    startTransition(async () => {
      const data = await getPlatformChangelogStream(currentWorkspaceType, activeOrgId);
      setLogs(data);
    });
  };

  // Polls/re-fetches updates whenever workspace selection contexts toggle or reload triggers fire
  useEffect(() => {
    loadStreamData();
    
    // Optional: Polling setup to keep the stream updated every 20 seconds
    const interval = setInterval(loadStreamData, 20000);
    return () => clearInterval(interval);
  }, [currentWorkspaceType, activeOrgId]);

  return (
    <div className="border border-zinc-900 bg-zinc-950/40 rounded-2xl p-5 space-y-6 sticky top-6">
      <div className="flex items-center justify-between border-b border-zinc-900 pb-3">
        <div className="flex items-center gap-2">
          <Terminal size={14} className="text-indigo-400" />
          <h3 className="text-xs font-mono font-bold uppercase tracking-widest text-zinc-300">
            Activity Timeline
          </h3>
        </div>
        {isPending && <Loader2 size={12} className="animate-spin text-zinc-500" />}
      </div>

      <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1 scrollbar-thin">
        {logs.length === 0 ? (
          <p className="text-xs font-mono text-zinc-600 text-center py-8">
            No system logs mapped to active runtime thread.
          </p>
        ) : (
          logs.map((log) => {
            // Assign custom icons and accent highlight borders based on event type
            const isSync = log.type === "GIT_SYNC";
            const isClone = log.type === "GIT_CLONE";

            return (
              <div 
                key={log.id} 
                className={`p-3 rounded-xl bg-zinc-900/30 border text-xs transition-all flex items-start gap-3 ${
                  isSync 
                    ? "border-emerald-950/40 hover:border-emerald-900/60" 
                    : isClone 
                    ? "border-indigo-950/40 hover:border-indigo-900/60" 
                    : "border-zinc-900 hover:border-zinc-800"
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 mt-0.5 ${
                  isSync ? "bg-emerald-950/50 text-emerald-400" : isClone ? "bg-indigo-950/50 text-indigo-400" : "bg-zinc-900 text-zinc-400"
                }`}>
                  {isSync ? <GitPullRequest size={12} /> : isClone ? <GitBranch size={12} /> : <ShieldAlert size={12} />}
                </div>

                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-bold text-zinc-200 truncate">{log.title}</span>
                    <span className="text-[9px] text-zinc-600 font-mono shrink-0">
                      {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className="text-zinc-400 text-[11px] font-light leading-relaxed break-words">
                    {log.description}
                  </p>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
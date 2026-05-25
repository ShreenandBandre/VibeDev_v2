"use client";

import React from "react";
import { GitCommit, Terminal, Sparkles, ShieldAlert, Rocket } from "lucide-react";

// Mock changelog data array matching GitHub's engineering update style
const changelogData = [
  {
    id: "v1.2.4",
    version: "v1.2.4-patch",
    title: "Upgraded sandboxed execution container kernels",
    date: "May 24, 2026",
    category: "Security",
    icon: ShieldAlert,
    iconColor: "text-red-400 bg-red-950/40 border-red-900/50",
    description: "Patched microkernel virtualization escape vectors. Optimized isolated runtime memory consumption metrics by 14.2% across active parallel loops.",
  },
  {
    id: "v1.2.3",
    version: "v1.2.3-release",
    title: "Integrated AI structural diagnostics pipeline",
    date: "May 18, 2026",
    category: "Feature",
    icon: Sparkles,
    iconColor: "text-amber-400 bg-amber-950/40 border-amber-900/50",
    description: "Added real-time context-aware telemetry feedback directly inside the terminal console layout block. Detects multi-file reference loops natively.",
  },
  {
    id: "v1.2.2",
    version: "v1.2.2-stable",
    title: "Optimized Git delta layer synchronization speeds",
    date: "May 05, 2026",
    category: "Performance",
    icon: Rocket,
    iconColor: "text-emerald-400 bg-emerald-950/40 border-emerald-900/50",
    description: "Connected deep caching endpoints on proxy tunnels. Cloning heavily nested structural repositories or mono-repos is now up to 3x faster.",
  },
];

export function ChangelogStream() {
  return (
    <div className="border border-zinc-900 bg-zinc-950 rounded-2xl p-6 space-y-6">
      {/* Component Header Block */}
      <div className="flex items-center justify-between pb-4 border-b border-zinc-900">
        <div className="space-y-1">
          <h3 className="text-sm font-bold tracking-wider text-zinc-200 uppercase flex items-center gap-2">
            <GitCommit size={16} className="text-blue-500 animate-pulse" />
            Platform Changelog Stream
          </h3>
          <p className="text-xs text-zinc-500 font-light">
            Real-time updates shipped directly to the cloud engine infrastructure.
          </p>
        </div>
        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
          PROD-ENG // LIVE
        </span>
      </div>

      {/* Timeline Stream Container */}
      <div className="relative pl-6 space-y-8 before:absolute before:top-2 before:left-[11px] before:bottom-2 before:w-[1px] before:bg-zinc-800">
        {changelogData.map((item) => (
          <div key={item.id} className="relative group">
            
            {/* Timeline Node Ring Element */}
            <div className={`absolute -left-[23px] top-1 h-5 w-5 rounded-full border flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${item.iconColor}`}>
              <item.icon size={10} />
            </div>

            {/* Content Card Layout */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
                {/* Version Code Tag */}
                <span className="font-mono font-bold text-zinc-300 bg-zinc-900 px-1.5 py-0.5 rounded border border-zinc-800/80">
                  {item.version}
                </span>
                {/* Timestamp Date */}
                <span className="text-zinc-500 font-light">{item.date}</span>
                {/* Scope Category Badge */}
                <span className="text-[10px] font-mono tracking-wide px-1.5 py-0.2 rounded-full bg-zinc-900 text-zinc-400 border border-zinc-800/60 ml-auto uppercase">
                  {item.category}
                </span>
              </div>

              {/* Title & Technical Summary Line */}
              <h4 className="text-sm font-semibold text-zinc-200 group-hover:text-blue-400 transition-colors">
                {item.title}
              </h4>
              <p className="text-xs text-zinc-400 font-light leading-relaxed">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
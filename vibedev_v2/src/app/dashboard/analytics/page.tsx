import React from 'react';

export default function AnalyticsComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] bg-[#050505] text-zinc-100 p-6 rounded-2xl border border-zinc-900/80 overflow-hidden relative selection:bg-emerald-500/30">
      
      {/* Heavy Stealth Background Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-emerald-500/[0.03] blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-zinc-800/[0.05] blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-2xl w-full text-center space-y-8 z-10">
        
        {/* Minimalist Active Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-wider bg-emerald-950/30 text-emerald-400 border border-emerald-900/50 mx-auto">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
          </span>
          ENGINE_v2.0_PENDING
        </div>

        {/* Deep Dark Header */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
            Analytics Engine
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 max-w-sm mx-auto leading-relaxed">
            Assembling dark-mode optimized tracking, raw metrics ingestion, and real-time computation tables.
          </p>
        </div>

        {/* Pitch Obsidian Chart Skeleton */}
        <div className="w-full max-w-md mx-auto bg-[#0c0c0e] border border-zinc-900 rounded-xl p-4 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] space-y-4 opacity-40 hover:opacity-50 transition-opacity duration-300">
          
          {/* Top Bar */}
          <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
            <div className="h-3 w-24 bg-zinc-800 rounded animate-pulse" />
            <div className="h-4 w-12 bg-zinc-800/40 rounded" />
          </div>
          
          {/* Card Grid */}
          <div className="grid grid-cols-3 gap-2.5">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-2.5 bg-[#070708] border border-zinc-900/60 rounded-lg space-y-2">
                <div className="h-2 w-8 bg-zinc-800 rounded animate-pulse" />
                <div className="h-4 w-12 bg-zinc-700/40 rounded animate-pulse" />
              </div>
            ))}
          </div>

          {/* Dark Waveform Graph */}
          <div className="h-24 w-full bg-[#050506] rounded-lg border border-zinc-900/40 relative flex items-end p-1.5 gap-1.5 overflow-hidden">
            <div className="h-1/4 w-full bg-emerald-500/10 rounded-t-sm animate-pulse" />
            <div className="h-2/5 w-full bg-emerald-500/15 rounded-t-sm animate-pulse [animation-delay:0.15s]" />
            <div className="h-3/5 w-full bg-emerald-500/20 rounded-t-sm animate-pulse [animation-delay:0.3s]" />
            <div className="h-4/5 w-full bg-emerald-500/25 rounded-t-sm animate-pulse [animation-delay:0.1s]" />
            <div className="h-2/3 w-full bg-emerald-500/15 rounded-t-sm animate-pulse [animation-delay:0.4s]" />
          </div>
        </div>

        {/* Clean, Non-distracting Button */}
        <div className="pt-2">
          <a
            href="/dashboard"
            className="inline-flex items-center justify-center px-4 py-2 text-xs font-mono tracking-wide text-zinc-400 hover:text-white bg-[#0c0c0e] hover:bg-[#121214] border border-zinc-900 rounded-lg transition-all duration-200 active:scale-[0.98]"
          >
            ← RETURN_TO_DASHBOARD
          </a>
        </div>

      </div>
    </div>
  );
}
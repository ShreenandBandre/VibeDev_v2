import React from 'react';

export default function DiscussionsComingSoon() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[85vh] bg-[#050505] text-zinc-100 p-6 rounded-2xl border border-zinc-900/80 overflow-hidden relative selection:bg-purple-500/30">
      
      {/* Heavy Stealth Background Glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-500/[0.03] blur-[140px] rounded-full pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-72 h-72 bg-zinc-800/[0.05] blur-[120px] rounded-full pointer-events-none" />

      <div className="relative max-w-2xl w-full text-center space-y-8 z-10">
        
        {/* Minimalist Active Badge */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono tracking-wider bg-purple-950/30 text-purple-400 border border-purple-900/50 mx-auto">
          <span className="relative flex h-1.5 w-1.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-purple-500"></span>
          </span>
          COMMS_MESH_PENDING
        </div>

        {/* Deep Dark Header */}
        <div className="space-y-3">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl bg-gradient-to-b from-white via-zinc-300 to-zinc-600 bg-clip-text text-transparent">
            Discussions Hub
          </h1>
          <p className="text-sm sm:text-base text-zinc-500 max-w-sm mx-auto leading-relaxed">
            Building an encrypted workspace network for threads, channels, and real-time team collaboration.
          </p>
        </div>

        {/* Obsidian Chat/Thread Skeleton */}
        <div className="w-full max-w-md mx-auto bg-[#0c0c0e] border border-zinc-900 rounded-xl p-4 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7)] space-y-4 opacity-40 hover:opacity-50 transition-opacity duration-300">
          
          {/* Thread Header Skeleton */}
          <div className="flex justify-between items-center pb-2 border-b border-zinc-900">
            <div className="flex gap-2">
              <div className="h-3 w-3 bg-zinc-800 rounded-full" />
              <div className="h-3 w-16 bg-zinc-800 rounded animate-pulse" />
            </div>
            <div className="h-3 w-8 bg-zinc-800/40 rounded" />
          </div>
          
          {/* Incoming Message Skeleton */}
          <div className="flex items-start gap-2.5">
            <div className="w-6 h-6 rounded-full bg-zinc-800/60 shrink-0 animate-pulse" />
            <div className="space-y-1.5 w-full text-left">
              <div className="h-2 w-16 bg-zinc-800 rounded" />
              <div className="p-2.5 bg-[#070708] border border-zinc-900/80 rounded-r-lg rounded-bl-lg space-y-1.5 max-w-[85%]">
                <div className="h-2 w-full bg-zinc-700/40 rounded animate-pulse" />
                <div className="h-2 w-2/3 bg-zinc-700/40 rounded animate-pulse" />
              </div>
            </div>
          </div>

          {/* Outgoing Message Skeleton */}
          <div className="flex items-start gap-2.5 flex-row-reverse">
            <div className="w-6 h-6 rounded-full bg-purple-950/40 border border-purple-900/30 shrink-0 animate-pulse" />
            <div className="space-y-1.5 w-full text-right flex flex-col items-end">
              <div className="h-2 w-12 bg-zinc-800 rounded" />
              <div className="p-2.5 bg-purple-950/10 border border-purple-900/20 rounded-l-lg rounded-br-lg space-y-1.5 max-w-[85%] text-left">
                <div className="h-2 w-32 bg-purple-500/20 rounded animate-pulse" />
                <div className="h-2 w-20 bg-purple-500/20 rounded animate-pulse [animation-delay:0.2s]" />
              </div>
            </div>
          </div>

          {/* Input Box Wireframe */}
          <div className="pt-2 border-t border-zinc-900 flex items-center gap-2">
            <div className="h-7 w-full bg-[#050506] rounded-md border border-zinc-900/60 animate-pulse" />
            <div className="h-7 w-7 bg-zinc-900 rounded-md shrink-0" />
          </div>
        </div>

        {/* Action Button */}
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
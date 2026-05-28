"use client";

import React, { useState } from "react";
import { signIn } from "next-auth/react";
import Image from "next/image";
import { Terminal, ShieldCheck, Activity } from "lucide-react";

export default function SignInPage() {
  const [isConnecting, setIsConnecting] = useState(false);

  const handleGitHubLogin = async () => {
    setIsConnecting(true);
    try {
      await signIn("github", { callbackUrl: "/dashboard" });
    } catch (err) {
      console.error("GitHub authentication pipeline fault:", err);
      setIsConnecting(false);
    }
  };

  return (
    <div className="h-screen w-screen max-h-screen bg-[#030305] text-zinc-100 font-sans selection:bg-purple-500/30 overflow-hidden flex flex-col md:flex-row items-stretch relative">
      
      {/* 🌌 Premium Global Structural Grid Overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#1f293708_1px,transparent_1px),linear-gradient(to_bottom,#1f293708_1px,transparent_1px)] bg-[size:3rem_3rem] pointer-events-none z-0" 
        aria-hidden="true"
      />

      {/* Cyber Ambient Radiance Overlays */}
      <div className="absolute top-0 left-0 w-[500px] h-[400px] bg-purple-600/[0.02] blur-[160px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-teal-500/[0.02] blur-[140px] rounded-full pointer-events-none" />

      {/* ====================================================================== */}
      {/* LEFT SECTION: Premium Topology Canvas Preview & Product Matrix Summary */}
      {/* ====================================================================== */}
      <div className="hidden md:flex w-[55%] border-r border-zinc-900/80 flex-col justify-between p-10 bg-gradient-to-b from-zinc-950/20 via-transparent to-zinc-950/40 relative overflow-hidden z-10">
        
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-purple-500 shadow-[0_0_10px_rgba(168,85,247,0.5)]" />
          <span className="font-mono text-xs tracking-widest font-bold text-zinc-400">
            VIBEDEV_v2 // SYSTEM_INIT
          </span>
        </div>

        <div className="w-full max-w-xl mx-auto space-y-8 my-auto">
          <div className="relative rounded-2xl bg-[#07070a] border border-zinc-900 shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] p-6 overflow-hidden group">
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-purple-500/30 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-teal-500/15 to-transparent" />
            
            <div className="absolute top-3 left-4 flex items-center gap-1.5 pointer-events-none select-none">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-800" />
              <span className="text-[9px] font-mono text-zinc-600 pl-1.5 uppercase tracking-wider">Topology Monitor</span>
            </div>

            <div className="w-full h-[260px] flex items-center justify-center mt-3 relative">
              <Image
                src="/img01.svg"
                alt="Git Architecture Visualization"
                width={600}
                height={300}
                priority
                className="object-contain w-full h-full opacity-80 mix-blend-screen transform scale-[0.96] group-hover:scale-[0.99] transition-all duration-700 ease-out"
              />
            </div>
          </div>

          <div className="space-y-3 px-2">
            <h2 className="text-2xl lg:text-3xl font-black tracking-tight text-zinc-200">
              Ready to Visualize Your <br />
              <span className="bg-gradient-to-r from-purple-400 via-indigo-300 to-teal-400 bg-clip-text text-transparent">
                Code Architecture?
              </span>
            </h2>
            <p className="text-xs lg:text-sm text-zinc-500 font-mono leading-relaxed max-w-md">
              Compile your remote Git branches straight into live, interactive graph topologies. Map modules, structural code hierarchies, and dependency routes flawlessly.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-[10px] font-mono text-zinc-600 border-t border-zinc-900/60 pt-4">
          <Activity size={12} className="text-purple-500/70 animate-pulse" />
          <span>SERVER_STATUS_ONLINE // SCOPE_READY</span>
        </div>
      </div>

      {/* ====================================================================== */}
      {/* RIGHT SECTION: Pure Premium Minimal GitHub Authentication Gateway      */}
      {/* ====================================================================== */}
      <div className="flex-1 flex flex-col justify-between p-8 lg:p-12 z-10 bg-[#040406]">
        
        <div className="md:hidden flex items-center gap-2">
          <div className="w-2 h-2 rounded-sm bg-purple-500" />
          <span className="font-mono text-xs tracking-widest font-bold text-zinc-400">VIBEDEV_v2</span>
        </div>

        <div className="w-full max-w-[360px] mx-auto my-auto space-y-8">
          
          <div className="space-y-2">
            <div className="h-8 w-8 flex items-center justify-center rounded-lg border border-zinc-900 bg-zinc-950 text-purple-500 shadow-inner">
              <Terminal size={15} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-zinc-100">Initialize Session</h1>
            <p className="text-xs font-mono text-zinc-500">Access your engineering environment console</p>
          </div>

          <div className="space-y-3">
            <button
              onClick={handleGitHubLogin}
              disabled={isConnecting}
              className="w-full flex items-center justify-between px-4 h-12 bg-zinc-900 hover:bg-zinc-800/80 border border-zinc-800 text-zinc-200 text-xs font-mono rounded-xl transition-all active:scale-[0.99] disabled:opacity-50 group/btn shadow-[0_4px_20px_rgba(0,0,0,0.3)]"
            >
              <div className="flex items-center gap-3.5">
                {/* 🚀 FIXED: Pure Inline SVG path for GitHub to avoid Lucide package export errors */}
                <svg 
                  className="w-[18px] h-[18px] text-zinc-400 group-hover/btn:text-purple-400 transition-colors fill-current" 
                  viewBox="0 0 24 24" 
                  aria-hidden="true"
                >
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.008.069-.008 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
                <span className="font-bold tracking-wide">
                  {isConnecting ? "CONNECTING_TUNNEL..." : "AUTHENTICATE_WITH_GITHUB"}
                </span>
              </div>
              <span className="text-[9px] font-sans text-zinc-600 font-bold bg-zinc-950/60 border border-zinc-800 px-1.5 py-0.5 rounded">v2.0</span>
            </button>
          </div>

          <div className="flex items-start gap-2.5 px-1 text-zinc-600">
            <ShieldCheck size={14} className="text-teal-500/60 shrink-0 mt-0.5" />
            <p className="text-[10px] font-mono leading-normal">
              Authentication requests pass securely through authorization protocols. We request no read/write source payload access.
            </p>
          </div>

        </div>

        <div className="w-full text-center md:text-left text-[9px] font-mono text-zinc-700">
          &copy; {new Date().getFullYear()} TOPOLOGY_ENGINE // PROTECTED_DATA_HANDSHAKE
        </div>

      </div>

    </div>
  );
}
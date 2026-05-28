"use client";

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="h-screen w-screen max-h-screen bg-[#050507] text-zinc-100 font-sans selection:bg-purple-500/30 overflow-hidden relative flex flex-col">
      
      {/* 🌌 High-fidelity Structural Dev Grid Background Overlay */}
      <div 
        className="absolute inset-0 bg-[linear-gradient(to_right,#1f29370d_1px,transparent_1px),linear-gradient(to_bottom,#1f29370d_1px,transparent_1px)] bg-[size:2.5rem_2.5rem] pointer-events-none z-0" 
        aria-hidden="true"
      />

      {/* Cyber Glow Accents */}
      <div className="absolute top-0 left-1/4 w-[600px] h-[400px] bg-purple-600/[0.04] blur-[150px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[300px] bg-teal-500/[0.02] blur-[130px] rounded-full pointer-events-none" />

      {/* --- HEADER NAVIGATION --- */}
      <header className="relative w-full px-6 h-16 flex items-center justify-between border-b border-zinc-900/80 z-50 bg-[#050507]/60 backdrop-blur-md shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-sm bg-purple-500 animate-pulse" />
          <span className="font-mono text-xs tracking-widest font-bold text-zinc-200">
            VIBEDEV_v2 // ENGINE
          </span>
        </div>
        <nav>
          <Link
            href="/api/auth/signin"
            className="text-[10px] font-mono tracking-wider text-zinc-400 hover:text-white border border-zinc-800 hover:border-zinc-700 px-3.5 py-1.5 rounded bg-[#09090b] transition-all duration-150"
          >
            EXECUTE_SIGN_IN
          </Link>
        </nav>
      </header>

      {/* --- CORE MASTER SPLIT WORKSPACE INTERIOR --- */}
      <main className="flex-1 w-full flex flex-col md:flex-row items-stretch z-20 min-h-0 overflow-hidden border-b border-zinc-900/60">
        
        {/* LEFT WORKSPACE PANEL: Content + Core Call to Actions */}
        <div className="w-full md:w-[45%] border-r border-zinc-900/60 flex flex-col justify-center px-8 lg:px-12 py-6 space-y-6 bg-zinc-950/20">
          
          {/* Active Live Sync Indicator Tag */}
          <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-md text-[10px] font-mono tracking-wider bg-teal-950/20 text-teal-400 border border-teal-900/40 shadow-sm mr-auto">
            <span className="relative flex h-1.5 w-1.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-teal-500"></span>
            </span>
            LIVE_MATRIX_ACTIVE
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl lg:text-5xl font-black tracking-tight leading-[1.1] text-zinc-100">
              Visualize Your <br />
              <span className="bg-gradient-to-r from-purple-400 via-indigo-200 to-teal-400 bg-clip-text text-transparent">
                Code Architecture.
              </span>
            </h1>

            <p className="text-xs lg:text-sm text-zinc-400 leading-relaxed font-mono max-w-md">
              Turn deep Git repositories into live, beautifully animated topological graphs. Bridge the gap between engineering structures and real-time visualization pipelines.
            </p>
          </div>

          <div className="pt-2">
            <Link
              href="/api/auth/signin"
              className="relative inline-flex items-center justify-center px-6 py-3 text-xs font-bold font-mono tracking-wider text-white bg-purple-600 rounded-lg overflow-hidden group shadow-[0_0_25px_rgba(147,51,234,0.25)] hover:shadow-[0_0_35px_rgba(147,51,234,0.4)] transition-all duration-300 transform active:scale-[0.98]"
            >
              <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-purple-500 to-indigo-600 group-hover:opacity-90 transition-opacity" />
              <span className="relative">PROCEED_TO_WORKSPACE</span>
            </Link>
          </div>

          {/* INTERNALIZED MINIMAL SHOWCASE ROW */}
          <div className="grid grid-cols-2 gap-4 pt-6 border-t border-zinc-900/60">
            {/* Feature 1 */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-teal-400" />
                <span className="text-[10px] font-mono font-bold text-teal-400 uppercase tracking-widest">01 // SYNC</span>
              </div>
              <h3 className="text-xs font-bold text-zinc-200">Continuous Sync</h3>
              <p className="text-[11px] text-zinc-500 leading-normal font-mono">Instant branch tracking integration.</p>
            </div>

            {/* Feature 2 */}
            <div className="space-y-1">
              <div className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-purple-400" />
                <span className="text-[10px] font-mono font-bold text-purple-400 uppercase tracking-widest">02 // INTEL</span>
              </div>
              <h3 className="text-xs font-bold text-zinc-200">AI Logic Mapping</h3>
              <p className="text-[11px] text-zinc-500 leading-normal font-mono">Isolate coupled data modules.</p>
            </div>
          </div>

        </div>

        {/* RIGHT WORKSPACE PANEL: Premium Full-bleed Topology Canvas Frame */}
        <div className="w-full md:w-[55%] bg-[#08080a] flex items-center justify-center p-6 lg:p-10 relative overflow-hidden group">
          <div className="absolute inset-x-0 -top-px h-px bg-gradient-to-r from-transparent via-purple-500/20 to-transparent" />
          
          {/* Internalized Device Window Sandbox */}
          <div className="w-full h-full relative rounded-xl bg-[#050507]/60 border border-zinc-900 shadow-[0_20px_50px_rgba(0,0,0,0.7)] flex items-center justify-center p-6 overflow-hidden">
            <div className="absolute top-3 left-4 flex items-center gap-1.5 pointer-events-none select-none">
              <span className="w-2 h-2 rounded-full bg-zinc-800" />
              <span className="w-2 h-2 rounded-full bg-zinc-800" />
              <span className="w-2 h-2 rounded-full bg-zinc-800" />
              <span className="text-[9px] font-mono text-zinc-600 pl-2">TOPOLOGY_CANVAS_VIEW</span>
            </div>
            
            <div className="relative w-full h-full max-h-[380px] flex items-center justify-center mt-2">
              <Image
                src="/img01.svg"
                alt="Git Repository Visualizer Grid Graphic"
                width={700}
                height={350}
                priority
                className="object-contain w-full h-full opacity-85 group-hover:opacity-100 transition-all duration-700 scale-[0.98] group-hover:scale-[1.01]"
              />
            </div>
          </div>
        </div>

      </main>

      {/* --- MINIMAL SCREEN FOOTER --- */}
      <footer className="w-full h-10 border-t border-zinc-900 bg-[#030304] flex items-center justify-center text-[10px] font-mono text-zinc-600 shrink-0 select-none">
        &copy; {new Date().getFullYear()} TOPOLOGY_ENGINE // OPERATIONAL_STATUS_OK
      </footer>
    </div>
  );
}
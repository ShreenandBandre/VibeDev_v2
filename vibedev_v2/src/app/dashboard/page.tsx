"use client";

import React, { useEffect, useState, useTransition } from "react";
import { useWorkspace } from "@/context/workspace-context";
import { getWorkspaceProjects } from "@/app/actions/projects";
import { syncRepositoryUpstream } from "@/app/actions/git-cloner"; // 🚀 Sync Server Action
import { Button } from "@/components/ui/button";
import { ChangelogStream } from "@/components/dashboard/changelog-stream";
import { useClonerStore } from "@/store/use-cloner-store"; 
import { 
  Plus, 
  RefreshCcw, 
  Loader2, 
  GitFork, 
  MoreVertical, 
  Terminal,
  Layers3,
  GitPullRequest
} from "lucide-react";
import { useRouter } from "next/navigation";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

export default function DashboardPage() {
  const { currentWorkspaceType, activeOrgId } = useWorkspace();
  const router = useRouter();
  const [projects, setProjects] = useState<any[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Tracks which specific card is processing upstream delta runs
  const [isSyncing, setIsSyncing] = useState<string | null>(null);

  const clonerStore = useClonerStore();

  const fetchProjects = () => {
    setError(null);
    startTransition(async () => {
      try {
        const data = await getWorkspaceProjects(currentWorkspaceType, activeOrgId);
        setProjects(data);
      } catch (err: any) {
        setError(err.message || "Failed to load active workspaces.");
      }
    });
  };

  useEffect(() => {
    fetchProjects();
  }, [currentWorkspaceType, activeOrgId]);

  // Handler for calculating and applying delta synchronization updates
  const handlePullSync = async (projectId: string, descriptionText: string) => {
    const gitUrlMatch = descriptionText?.match(/https:\/\/github\.com\/[^\s]+/);
    if (!gitUrlMatch) {
      alert("No upstream repository sync route detected for this workspace model layout.");
      return;
    }

    setIsSyncing(projectId);
    const result = await syncRepositoryUpstream(projectId, gitUrlMatch[0]);
    setIsSyncing(null);

    if (result.success) {
      fetchProjects(); // Instantly refresh tracking arrays on UI canvas grids
    } else {
      alert(result.error || "Failed running synchronization modules.");
    }
  };

  return (
    <div className="space-y-10 max-w-7xl mx-auto px-2 pb-16">
      {/* 1. HERO TITLE HEADER SECTION */}
      <div>
        <div className="flex items-center gap-2 text-xs font-mono tracking-widest text-blue-500 font-bold uppercase">
          <span>{`_`} ACTIVE NODE INSTANCE LOOP</span>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={fetchProjects} 
            disabled={isPending}
            className="h-6 w-6 text-zinc-500 hover:text-white"
          >
            <RefreshCcw size={12} className={isPending ? "animate-spin text-blue-500" : ""} />
          </Button>
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight text-white mt-1">
          Workspace Hub
        </h1>
        <p className="text-zinc-400 text-sm mt-1.5 font-light">
          Manage your persistent code sandboxes and cloud clusters.
        </p>
      </div>

      {/* 2. CORE ACTION ENTRY CARDS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* CREATE FRESH PLAYGROUND CARD (🚀 NOW CONNECTED VIA ROUTER REDIRECT) */}
        <div 
          onClick={() => router.push("/dashboard/new-playground")}
          className="group relative border border-zinc-800/80 bg-zinc-900/20 rounded-2xl p-6 flex justify-between items-center overflow-hidden hover:border-zinc-700/60 transition-all duration-300 cursor-pointer"
        >
          <div className="space-y-2 max-w-[65%]">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-blue-950/40 text-blue-400 border border-blue-900/50">
              {`>_`} CORE ENGINE
            </span>
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-1.5 group-hover:text-blue-400 transition-colors">
              Create Fresh Playground <Plus size={16} className="text-zinc-500 group-hover:text-blue-400" />
            </h2>
            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              Spin up a stateless, multi-file execution container environment configured instantly with hot-reloading diagnostics.
            </p>
          </div>
          
          <div className="relative w-24 h-24 shrink-0 opacity-80 group-hover:opacity-100 transition-opacity">
            <div className="absolute top-1 right-5 w-14 h-18 bg-zinc-800 rounded-lg border border-zinc-700 transform rotate-[-6deg]" />
            <div className="absolute top-3 right-1 w-14 h-18 bg-zinc-900 border border-zinc-700 rounded-lg shadow-xl p-2 flex flex-col gap-1.5 justify-center">
              <div className="w-full h-1 bg-blue-500 rounded" />
              <div className="w-5/6 h-1 bg-zinc-700 rounded" />
              <div className="w-4/6 h-1 bg-zinc-700 rounded" />
            </div>
            <div className="absolute bottom-1 right-0 w-5 h-5 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-xs shadow-lg shadow-blue-600/30">
              +
            </div>
          </div>
        </div>

        {/* CLONE GIT REPOSITORY CARD */}
        <div 
          onClick={() => clonerStore.setOpen(true)}
          className="group relative border border-zinc-800/80 bg-zinc-900/20 rounded-2xl p-6 flex justify-between items-center overflow-hidden hover:border-zinc-700/60 transition-all duration-300 cursor-pointer"
        >
          <div className="space-y-2 max-w-[65%]">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-950/40 text-indigo-400 border border-indigo-900/50">
              <GitFork size={10} /> VCS GATEWAY
            </span>
            <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-1.5 group-hover:text-indigo-400 transition-colors">
              Clone Git Repository <span className="group-hover:translate-x-1 transition-transform inline-block">→</span>
            </h2>
            <p className="text-xs text-zinc-400 font-light leading-relaxed">
              Connect and import your structural workspace codebases straight from GitHub endpoints directly into your cloud editor.
            </p>
          </div>

          <div className="w-24 h-20 shrink-0 border border-zinc-800 rounded-lg bg-zinc-900/80 p-1 flex flex-col gap-1 relative opacity-80 group-hover:opacity-100 transition-opacity shadow-inner">
            <div className="w-full h-2 bg-zinc-800 rounded flex items-center px-1 gap-0.5">
              <div className="w-1 h-1 rounded-full bg-red-500" />
              <div className="w-1 h-1 rounded-full bg-yellow-500" />
              <div className="w-1 h-1 rounded-full bg-green-500" />
            </div>
            <div className="flex gap-1 flex-1">
              <div className="w-1/3 bg-zinc-950 rounded border border-zinc-800/50" />
              <div className="flex-1 bg-zinc-950 rounded border border-zinc-800/50 p-1 flex flex-col gap-0.5">
                <div className="w-3 h-1 bg-indigo-500 rounded" />
                <div className="w-full h-0.5 bg-zinc-800 rounded" />
                <div className="w-4/5 h-0.5 bg-zinc-800 rounded" />
              </div>
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-4 h-2 bg-zinc-800 border-x border-zinc-700" />
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-8 h-1 bg-zinc-700 rounded-sm" />
          </div>
        </div>
      </div>

      {/* 3. ASYMMETRIC TWO-COLUMN DASHBOARD LAYOUT GRID SPLIT */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start">
        {/* LEFT & CENTER PANEL CANVAS: ACTIVE PROJECTS LIST */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex items-center gap-2 text-xs font-bold tracking-wider text-zinc-500 uppercase">
            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span>Your Active Projects Deck ({projects.length})</span>
          </div>

          {isPending ? (
            <div className="flex flex-col items-center justify-center py-24 gap-3 border border-zinc-900 bg-zinc-900/5 rounded-2xl">
              <Loader2 size={24} className="animate-spin text-blue-500" />
              <span className="text-xs font-mono text-zinc-500">Compiling deck...</span>
            </div>
          ) : error ? (
            <div className="p-4 border border-red-900/40 bg-red-950/10 rounded-xl text-xs font-mono text-red-400">
              {error}
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-20 border border-dashed border-zinc-800 rounded-2xl bg-zinc-900/5">
              <p className="text-sm text-zinc-500">No projects mapped to this workspace module view.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((project) => {
                const isGitWorkspace = project.description?.includes("https://github.com");

                return (
                  <div 
                    key={project.id} 
                    className="border border-zinc-800 bg-zinc-900/20 rounded-xl p-5 space-y-4 hover:border-zinc-700/80 transition-all group flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono bg-blue-950/40 text-blue-400 border border-blue-900/50 px-2 py-0.5 rounded font-bold uppercase">
                          {project.template}
                        </span>
                        
                        {/* UPSTREAM REFRESH TRIGGER FOR REPO CHANGES */}
                        {isGitWorkspace && (
                          <Button
                            variant="ghost"
                            size="icon"
                            disabled={isSyncing === project.id}
                            onClick={() => handlePullSync(project.id, project.description)}
                            className="h-7 w-7 text-zinc-500 hover:text-emerald-400 bg-zinc-900/40 border border-zinc-800/80 rounded"
                          >
                            <RefreshCcw size={12} className={isSyncing === project.id ? "animate-spin text-emerald-400" : ""} />
                          </Button>
                        )}

                        {!isGitWorkspace && (
                          <button className="text-zinc-600 hover:text-zinc-300 transition p-1">
                            <MoreVertical size={14} />
                          </button>
                        )}
                      </div>

                      <div className="mt-3">
                        <h3 className="text-base font-bold text-zinc-200 group-hover:text-blue-400 transition-colors truncate">
                          {project.title}
                        </h3>
                        <p className="text-xs text-zinc-400 font-light mt-1 line-clamp-2 min-h-[32px]">
                          {project.description || "Custom architectural execution context profile."}
                        </p>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-zinc-800/80 space-y-3">
                      <div className="flex items-center justify-between text-[11px] font-mono text-zinc-500">
                        <div className="flex items-center gap-1">
                          <span>ID:</span>
                          <span className="text-zinc-400 uppercase">{project.id.slice(-6)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span>🕒</span>
                          <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => router.push(`/dashboard/visualizer/${project.id}`)}
                          className="w-full bg-zinc-900/60 text-zinc-400 hover:bg-zinc-800 hover:text-white border border-zinc-800 text-xs h-8 gap-1.5"
                        >
                          <Layers3 size={12} className="text-blue-500" />
                          Visualizer
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => router.push(`/dashboard/ide/${project.id}`)}
                          className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700/60 text-xs h-8 gap-1.5"
                        >
                          <Terminal size={12} />
                          Open IDE
                        </Button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* RIGHT PANEL CANVAS: HIGH-END GITHUB CHANGELOG STREAM */}
        <div className="xl:col-span-1">
          <ChangelogStream />
        </div>
      </div>

      {/* CLONING INTERCEPT MODAL */}
      <Dialog open={clonerStore.isOpen} onOpenChange={clonerStore.setOpen}>
        <DialogContent className="sm:max-w-[480px] bg-zinc-950 border border-zinc-900 text-zinc-100 shadow-2xl rounded-2xl p-6">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold text-zinc-100 tracking-tight flex items-center gap-2">
              <GitPullRequest size={18} className="text-indigo-500" /> Import Git Workspace Repository
            </DialogTitle>
            <DialogDescription className="text-xs text-zinc-400 font-light mt-1.5 leading-relaxed">
              Provide a public repository address string. Our compiler will mirror files directly into your isolated cluster sandbox model.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-[10px] font-mono font-bold tracking-widest text-zinc-500 uppercase">
                GitHub Repository URL
              </label>
              <Input
                type="url"
                disabled={clonerStore.isCloning}
                placeholder="https://github.com/username/repository"
                value={clonerStore.repoUrl}
                onChange={(e) => clonerStore.setRepoUrl(e.target.value)}
                className="bg-zinc-900/60 border-zinc-800/80 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-indigo-500 focus-visible:ring-offset-0 h-10 text-sm"
              />
            </div>

            {clonerStore.error && (
              <div className="p-3 border border-red-950/40 bg-red-950/10 text-red-400 rounded-lg text-xs font-mono leading-normal">
                ⚠️ {clonerStore.error}
              </div>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              variant="ghost"
              disabled={clonerStore.isCloning}
              onClick={() => clonerStore.setOpen(false)}
              className="hover:bg-zinc-900 hover:text-white border border-transparent hover:border-zinc-800 text-xs text-zinc-400 h-9 px-4 rounded-lg"
            >
              Cancel
            </Button>
            <Button
              disabled={clonerStore.isCloning}
              onClick={() => clonerStore.executeClone(currentWorkspaceType, activeOrgId, fetchProjects)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/30 text-xs font-medium h-9 px-4 rounded-lg shadow-lg shadow-indigo-600/10 flex items-center gap-2"
            >
              {clonerStore.isCloning ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Stream Syncing...
                </>
              ) : (
                "Initialize Clone"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
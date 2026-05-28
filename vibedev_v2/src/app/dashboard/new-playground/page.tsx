"use client"; // Fixed typo here

import React, { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useWorkspace } from "@/context/workspace-context";
import { getUserGitHubRepositories, GitHubRepoDto } from "@/app/actions/github-repos";
import { cloneGitHubRepository } from "@/app/actions/git-cloner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  ArrowLeft, 
  GitBranch, 
  Search, 
  Lock, 
  Globe, 
  Loader2, 
  CornerDownRight 
} from "lucide-react";

export default function NewPlaygroundSelectionPage() {
  const router = useRouter();
  const { currentWorkspaceType, activeOrgId } = useWorkspace();
  
  const [repos, setRepos] = useState<GitHubRepoDto[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Use React transitions to handle server action execution seamlessly
  const [isPending, startTransition] = useTransition();
  const [activeConnectingId, setActiveConnectingId] = useState<number | null>(null);

  useEffect(() => {
    async function loadGitHubRepos() {
      setLoading(true);
      setError(null);
      try {
        const res = await getUserGitHubRepositories();
        if (res.success && res.data) {
          setRepos(res.data);
        } else {
          setError(res.error || "Failed loading user repo structures.");
        }
      } catch (err: any) {
        setError("⚠️ Failed to download your repository profile index from GitHub.");
      } finally {
        setLoading(false);
      }
    }
    loadGitHubRepos();
  }, []);

  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (repo.fullName && repo.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const handleConnectRepository = (repoUrl: string, repoId: number) => {
    setError(null);
    setActiveConnectingId(repoId);
    
    // Wrapping the route change and action inside a transition 
    // keeps the UI interactive and handles standard Next.js navigation pacing
    startTransition(async () => {
      try {
        const cloneRes = await cloneGitHubRepository(repoUrl, currentWorkspaceType, activeOrgId);
        
        if (cloneRes.success) {
          router.push("/dashboard");
          router.refresh();
        } else {
          setError(cloneRes.error || "Clone execution module failure.");
          setActiveConnectingId(null);
        }
      } catch (err: any) {
        setError(err.message || "An unexpected error occurred.");
        setActiveConnectingId(null);
      }
    });
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 pb-20 pt-4">
      {/* HEADER CONTROLS NAVIGATION */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-zinc-900 pb-6">
        <div className="space-y-1">
          <Button
            onClick={() => router.push("/dashboard")}
            variant="ghost"
            size="sm"
            className="text-zinc-500 hover:text-white -ml-2 text-xs gap-1.5 h-8"
          >
            <ArrowLeft size={12} /> Back to Deck
          </Button>
          <h1 className="text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
            Connect Code Sandbox Cluster
          </h1>
          <p className="text-zinc-400 text-xs font-light">
            Select a verified source code engine branch layout to configure into a live runtime playground.
          </p>
        </div>

        {/* INTERACTIVE FUZZY FILTER BAR */}
        <div className="relative w-full sm:w-72 shrink-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <Input
            type="text"
            placeholder="Filter indexed profiles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-zinc-900/40 border-zinc-800/80 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-blue-500 focus-visible:ring-offset-0 text-xs h-9"
          />
        </div>
      </div>

      {/* ERROR HANDLER NOTIFIER BLOCK */}
      {error && (
        <div className="p-4 border border-red-900/40 bg-red-950/10 rounded-xl text-xs font-mono text-red-400">
          {error}
        </div>
      )}

      {/* CORE PROFILE CARDS DRAW GRID CANVAS LAYER */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3 border border-dashed border-zinc-900 rounded-2xl bg-zinc-950/10">
          <Loader2 size={28} className="animate-spin text-blue-500" />
          <span className="text-xs font-mono text-zinc-500 tracking-wider">Gathering authorized GitHub timelines...</span>
        </div>
      ) : filteredRepos.length === 0 ? (
        <div className="text-center py-24 border border-zinc-900 rounded-2xl bg-zinc-900/5">
          <p className="text-xs font-mono text-zinc-500">No matching GitHub repositories located on this handle filter matrix.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRepos.map((repo) => {
            const isProcessing = isPending && activeConnectingId === repo.id;

            return (
              <div
                key={repo.id}
                className="group relative border border-zinc-900 bg-zinc-950/40 rounded-xl p-5 flex flex-col justify-between hover:border-zinc-800 transition-all hover:shadow-xl hover:shadow-black/20"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold tracking-wider px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800/60 text-zinc-400">
                      {repo.isPrivate ? (
                        <>
                          <Lock size={10} className="text-amber-500" /> Private
                        </>
                      ) : (
                        <>
                          <Globe size={10} className="text-emerald-500" /> Public
                        </>
                      )}
                    </span>
                    {repo.language && (
                      <span className="text-[10px] font-mono text-zinc-500">
                        ⚡ {repo.language}
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-sm font-bold text-zinc-200 group-hover:text-blue-400 transition-colors truncate">
                      {repo.name}
                    </h3>
                    <p className="text-[11px] text-zinc-400 font-light mt-1 line-clamp-2 min-h-[32px] leading-normal">
                      {repo.description || "No platform contextual layout summary provided."}
                    </p>
                  </div>
                </div>

                <div className="pt-4 mt-2 border-t border-zinc-900/60 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[10px] font-mono text-zinc-500">
                    <GitBranch size={10} />
                    <span className="truncate max-w-[80px]">{repo.defaultBranch}</span>
                  </div>
                  
                  <Button
                    size="sm"
                    disabled={isPending}
                    onClick={() => handleConnectRepository(repo.htmlUrl, repo.id)}
                    className={`text-[11px] font-medium h-7 px-3 rounded-md border transition-all ${
                      isProcessing 
                        ? "bg-zinc-900 text-blue-400 border-zinc-800" 
                        : "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border-zinc-800/80"
                    }`}
                  >
                    {isProcessing ? (
                      <span className="flex items-center gap-1.5">
                        <Loader2 size={10} className="animate-spin text-blue-500" /> Cloning...
                      </span>
                    ) : (
                      <span className="flex items-center gap-1">
                        Connect <CornerDownRight size={10} className="opacity-50" />
                      </span>
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
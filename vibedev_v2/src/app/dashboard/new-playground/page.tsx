"use client";

import React, { useEffect, useState } from "react";
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
  CornerDownRight,
  AlertCircle
} from "lucide-react";

interface PendingRepo {
  url: string;
  id: number;
  name: string;
}

export default function NewPlaygroundSelectionPage() {
  const router = useRouter();
  const { currentWorkspaceType, activeOrgId } = useWorkspace();
  
  const [repos, setRepos] = useState<GitHubRepoDto[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeConnectingId, setActiveConnectingId] = useState<number | null>(null);
  
  // Modal State for Workspace Confirmation
  const [pendingRepo, setPendingRepo] = useState<PendingRepo | null>(null);

  useEffect(() => {
    async function loadGitHubRepos() {
      setLoading(true);
      setError(null);
      const res = await getUserGitHubRepositories();
      if (res.success && res.data) {
        setRepos(res.data);
      } else {
        setError(res.error || "Failed loading user repo structures.");
      }
      setLoading(false);
    }
    loadGitHubRepos();
  }, []);

  const filteredRepos = repos.filter((repo) =>
    repo.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (repo.fullName && repo.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const initiateConnect = (repo: GitHubRepoDto) => {
    setPendingRepo({ url: repo.htmlUrl, id: repo.id, name: repo.name });
  };

  const handleConfirmConnect = async () => {
    if (!pendingRepo) return;
    
    try {
      setActiveConnectingId(pendingRepo.id);
      setError(null);
      
      const cloneRes = await cloneGitHubRepository(pendingRepo.url, currentWorkspaceType, activeOrgId);
      
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
    } finally {
      setPendingRepo(null);
    }
  };

  return (
    <div className="space-y-8 max-w-6xl mx-auto px-4 pb-20 pt-4">
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
            Deploying to <span className="text-blue-400 font-mono font-medium">{currentWorkspaceType.toUpperCase()}</span> workspace.
          </p>
        </div>

        <div className="relative w-full sm:w-72 shrink-0">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-600" />
          <Input
            type="text"
            placeholder="Filter indexed profiles..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-zinc-900/40 border-zinc-800/80 text-zinc-200 placeholder:text-zinc-600 focus-visible:ring-1 focus-visible:ring-blue-500 text-xs h-9"
          />
        </div>
      </div>

      {error && (
        <div className="p-4 border border-red-900/40 bg-red-950/10 rounded-xl text-xs font-mono text-red-400 flex items-center gap-2">
          <AlertCircle size={14} /> {error}
        </div>
      )}

      {loading ? (
        <div className="flex flex-col items-center justify-center py-32 gap-3 border border-dashed border-zinc-900 rounded-2xl bg-zinc-950/10">
          <Loader2 size={28} className="animate-spin text-blue-500" />
          <span className="text-xs font-mono text-zinc-500 tracking-wider">Gathering authorized GitHub timelines...</span>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredRepos.map((repo) => (
            <div key={repo.id} className="group relative border border-zinc-900 bg-zinc-950/40 rounded-xl p-5 flex flex-col justify-between hover:border-zinc-800 transition-all">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="inline-flex items-center gap-1 text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400">
                    {repo.isPrivate ? <><Lock size={10} className="text-amber-500" /> Private</> : <><Globe size={10} className="text-emerald-500" /> Public</>}
                  </span>
                </div>
                <h3 className="text-sm font-bold text-zinc-200 truncate">{repo.name}</h3>
                <p className="text-[11px] text-zinc-400 font-light line-clamp-2">{repo.description || "No description provided."}</p>
              </div>

              <div className="pt-4 mt-2 border-t border-zinc-900/60 flex items-center justify-between">
                <div className="text-[10px] font-mono text-zinc-500 flex items-center gap-1">
                  <GitBranch size={10} /> {repo.defaultBranch}
                </div>
                <Button
                  size="sm"
                  onClick={() => initiateConnect(repo)}
                  className="text-[11px] h-7 px-3 bg-zinc-900 hover:bg-zinc-800 border-zinc-800"
                >
                  Connect <CornerDownRight size={10} className="ml-1 opacity-50" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal */}
      {pendingRepo && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-xl max-w-sm w-full space-y-4 shadow-2xl">
            <h3 className="text-white font-bold text-sm">Deploy to {currentWorkspaceType === "personal" ? "Personal Space" : "Team Organization"}?</h3>
            <p className="text-xs text-zinc-400">
              You are cloning <strong className="text-zinc-200">{pendingRepo.name}</strong> into the <span className="text-blue-400 font-mono">{currentWorkspaceType}</span> scope.
            </p>
            <div className="flex gap-2 justify-end">
              <Button variant="ghost" size="sm" className="text-xs" onClick={() => setPendingRepo(null)}>Cancel</Button>
              <Button size="sm" className="text-xs bg-blue-600 hover:bg-blue-700" onClick={handleConfirmConnect}>
                {activeConnectingId === pendingRepo.id ? <Loader2 size={12} className="animate-spin mr-2" /> : null}
                Confirm Deployment
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
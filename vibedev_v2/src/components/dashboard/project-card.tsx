"use client";

import React from "react";
import { FolderGit2, Eye, Terminal, RefreshCw, Layers } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

interface ProjectCardProps {
  project: {
    id: string;
    title: string;
    description: string | null;
    template: string;
    updatedAt: Date;
    repositoryMap: { lastAnalyzed: Date } | null;
  };
  onSyncRefresh: (projectId: string) => void;
}

export function ProjectCard({ project, onSyncRefresh }: ProjectCardProps) {
  const router = useRouter();
  const isAnalyzed = !!project.repositoryMap;

  return (
    <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 shadow-xl hover:border-zinc-700 transition-all group duration-200">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-lg bg-zinc-800 text-indigo-400 border border-zinc-700">
              <FolderGit2 size={20} />
            </div>
            <div>
              <CardTitle className="text-base font-semibold tracking-tight text-zinc-100 group-hover:text-indigo-400 transition-colors">
                {project.title}
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500 font-mono mt-0.5">
                Template: {project.template}
              </CardDescription>
            </div>
          </div>
          <Badge className={isAnalyzed ? "bg-emerald-950 text-emerald-400 border-emerald-800" : "bg-amber-950 text-amber-400 border-amber-800"} variant="outline">
            {isAnalyzed ? "Connected" : "Needs Sync"}
          </Badge>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-sm text-zinc-400 line-clamp-2 min-h-[40px]">
          {project.description || "No project description provided. Launch the workspace environment to get started."}
        </p>
        <div className="mt-4 flex flex-col gap-1 text-[11px] font-mono text-zinc-500 border-t border-zinc-800 pt-3">
          <div>Last structural edit: {new Date(project.updatedAt).toLocaleDateString()}</div>
          <div>AI Scan: {isAnalyzed ? new Date(project.repositoryMap!.lastAnalyzed).toLocaleDateString() : "Never mapped"}</div>
        </div>
      </CardContent>

      <CardFooter className="grid grid-cols-2 gap-2 pt-0 border-t border-zinc-800/50 p-4 bg-zinc-900/50 rounded-b-xl">
        <Button 
          size="sm" 
          variant="secondary" 
          className="bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700 gap-1.5 h-9"
          onClick={() => router.push(`/dashboard/visualizer/${project.id}`)}
        >
          <Layers size={14} className="text-indigo-400" />
          Open Visualizer
        </Button>
        <Button 
          size="sm" 
          className="bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 h-9 shadow-md shadow-indigo-600/10"
          onClick={() => router.push(`/dashboard/ide/${project.id}`)}
        >
          <Terminal size={14} />
          Open IDE
        </Button>
      </CardFooter>
    </Card>
  );
}
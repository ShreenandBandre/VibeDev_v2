"use client";

import React, { useState } from "react";
import { FolderGit2, Terminal, Layers, MoreVertical, Trash2, Loader2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

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
  onDeleteProject: (projectId: string) => Promise<void>; // 🚀 DB Delete Handler
}

export function ProjectCard({ project, onSyncRefresh, onDeleteProject }: ProjectCardProps) {
  const router = useRouter();
  const isAnalyzed = !!project.repositoryMap;
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation(); // Card navigation trigger block karne ke liye
    if (confirm(`Kya aap sach me "${project.title}" ko database se delete karna chahte hain?`)) {
      try {
        setIsDeleting(true);
        await onDeleteProject(project.id);
      } catch (error) {
        console.error("Project deletion layer crash:", error);
        alert("Database se project udaane me kuch dikkat aayi!");
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <Card className="bg-zinc-900 border-zinc-800 text-zinc-100 shadow-xl hover:border-zinc-700 transition-all group duration-200 relative">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <div className="p-2 rounded-lg bg-zinc-800 text-indigo-400 border border-zinc-700 shrink-0">
              <FolderGit2 size={20} />
            </div>
            <div className="min-w-0 flex-1">
              <CardTitle className="text-base font-semibold tracking-tight text-zinc-100 group-hover:text-indigo-400 transition-colors truncate">
                {project.title}
              </CardTitle>
              <CardDescription className="text-xs text-zinc-500 font-mono mt-0.5 truncate">
                Template: {project.template}
              </CardDescription>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <Badge className={isAnalyzed ? "bg-emerald-950 text-emerald-400 border-emerald-800 text-[10px]" : "bg-amber-950 text-amber-400 border-amber-800 text-[10px]"} variant="outline">
              {isAnalyzed ? "Connected" : "Needs Sync"}
            </Badge>

            {/* 🚀 3-DOTS OPTIONS DROPDOWN MENU */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  className="h-8 w-8 p-0 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 rounded-md focus-visible:ring-0 focus-visible:ring-offset-0"
                  disabled={isDeleting}
                >
                  {isDeleting ? (
                    <Loader2 size={14} className="animate-spin text-red-400" />
                  ) : (
                    <MoreVertical size={14} />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="bg-zinc-950 border-zinc-800 text-zinc-300 w-40 rounded-xl shadow-2xl">
                <DropdownMenuItem 
                  onClick={handleDelete}
                  className="text-red-400 hover:text-red-300 focus:text-red-300 focus:bg-red-950/40 cursor-pointer flex items-center gap-2 text-xs font-medium py-2 rounded-lg"
                >
                  <Trash2 size={14} />
                  <span>Delete Project</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
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
          disabled={isDeleting}
        >
          <Layers size={14} className="text-indigo-400" />
          Open Visualizer
        </Button>
        <Button 
          size="sm" 
          className="bg-indigo-600 hover:bg-indigo-500 text-white gap-1.5 h-9 shadow-md shadow-indigo-600/10"
          onClick={() => router.push(`/dashboard/ide/${project.id}`)}
          disabled={isDeleting}
        >
          <Terminal size={14} />
          Open IDE
        </Button>
      </CardFooter>
    </Card>
  );
}
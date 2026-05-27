"use client";

import React, { useEffect, useState } from "react";
import {
  Home,
  LayoutDashboard,
  Folder,
  Plus,
  ChevronLeft,
  ChevronRight,
  Sun,
  LogOut,
  Loader2,
  ChevronsUpDown,
  User,
  Users,
  BarChart3,
  MessageSquare,
} from "lucide-react";

import { useWorkspace } from "@/context/workspace-context";
import { getUserWorkspaces } from "@/app/actions/get-user-workspaces";
import { getWorkspaceProjects } from "@/app/actions/projects";
import { CreateOrgModal } from "@/components/ui/create-org-modal";
import { signOut } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const navItems = [
  { title: "HOME", url: "/dashboard/home", icon: Home },
  { title: "DASHBOARD", url: "/dashboard", icon: LayoutDashboard },
  { title: "GITHUB ANALYTICS", url: "/dashboard/analytics", icon: BarChart3 },
  { title: "DISCUSSIONS", url: "/dashboard/discussions", icon: MessageSquare },
];

export function AppSidebar() {
  const { currentWorkspaceType, activeOrgId, setActiveWorkspace } = useWorkspace();
  const { state, toggleSidebar } = useSidebar();
  const pathname = usePathname();
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [projectsLoading, setProjectsLoading] = useState(true);
  const [userData, setUserData] = useState<any>(null);
  const [orgs, setOrgs] = useState<any[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [projects, setProjects] = useState<any[]>([]);

  const isCollapsed = state === "collapsed";

  const refreshWorkspaces = async () => {
    try {
      const data = await getUserWorkspaces();
      // FIX: Accessing the correct nested path
      setOrgs(data.groupedWorkspaces?.organizations || []);
    } catch (error) {
      console.error("Failed to refresh workspaces:", error);
    }
  };

  useEffect(() => {
    async function loadWorkspaceMeta() {
      try {
        setLoading(true);
        const data = await getUserWorkspaces();
        setUserData(data.user);
        // FIX: Accessing the correct nested path
        setOrgs(data.groupedWorkspaces?.organizations || []);
      } catch (error) {
        console.error("Failed to load workspace data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadWorkspaceMeta();
  }, []);

  useEffect(() => {
    async function loadProjects() {
      try {
        setProjectsLoading(true);
        // Ensure we pass a string that matches the projects.ts logic
        const data = await getWorkspaceProjects(currentWorkspaceType, activeOrgId);
        setProjects(Array.isArray(data) ? data.slice(0, 5) : []);
      } catch (error) {
        setProjects([]);
      } finally {
        setProjectsLoading(false);
      }
    }
    loadProjects();
  }, [currentWorkspaceType, activeOrgId]);

  const currentWorkspaceName =
    currentWorkspaceType === "personal"
      ? "Personal Sandboxes"
      : orgs.find((org) => org.id === activeOrgId)?.name || "Team Workspace";

  return (
    <Sidebar variant="sidebar" collapsible="icon" className="border-r border-zinc-900 bg-[#0d1117] text-zinc-400 w-[260px] shrink-0">
      <SidebarHeader className="p-3 border-b border-zinc-900/50">
        <div className="flex items-center gap-2">
          <SidebarMenu className="flex-1">
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton size="lg" className="w-full justify-between hover:bg-zinc-900/60 rounded-lg">
                    <div className="flex items-center gap-2 overflow-hidden">
                      <div className="h-7 w-7 shrink-0 rounded-md border border-zinc-800 bg-zinc-950 flex items-center justify-center text-xs font-bold text-amber-500">
                        {currentWorkspaceType === "personal" ? "P" : "T"}
                      </div>
                      {!isCollapsed && (
                        <div className="flex flex-col text-left truncate">
                          <span className="text-xs font-semibold text-zinc-100 truncate">{currentWorkspaceName}</span>
                          <span className="text-[10px] uppercase tracking-wider text-zinc-500">{currentWorkspaceType}</span>
                        </div>
                      )}
                    </div>
                    {!isCollapsed && <ChevronsUpDown size={14} className="text-zinc-500" />}
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" sideOffset={6} className="w-60 bg-zinc-900 border border-zinc-800 text-zinc-300 rounded-xl">
                  <DropdownMenuLabel className="text-[10px] uppercase tracking-widest text-zinc-500">Personal</DropdownMenuLabel>
                  <DropdownMenuItem onClick={() => setActiveWorkspace("personal", null)} className={currentWorkspaceType === "personal" ? "bg-zinc-800 text-amber-500" : ""}>
                    <User size={14} className="mr-2 text-emerald-400" /> Personal Sandboxes
                  </DropdownMenuItem>
                  <DropdownMenuSeparator className="bg-zinc-800" />
                  <DropdownMenuLabel className="flex items-center justify-between text-[10px] uppercase tracking-widest text-zinc-500">
                    <span>Organizations</span>
                    <button onClick={(e) => { e.preventDefault(); e.stopPropagation(); setIsCreateModalOpen(true); }} className="hover:text-amber-500"><Plus size={13} /></button>
                  </DropdownMenuLabel>
                  {loading ? (
                    <div className="px-3 py-2 text-xs text-zinc-500">Loading...</div>
                  ) : orgs.length === 0 ? (
                    <div className="px-3 py-2 text-xs text-zinc-500 italic">No organizations found</div>
                  ) : (
                    orgs.map((org) => (
                      <DropdownMenuItem key={org.id} onClick={() => { setActiveWorkspace("team", org.id); if (pathname !== "/dashboard") router.push("/dashboard"); }} className={activeOrgId === org.id ? "bg-indigo-500/10 text-indigo-400" : ""}>
                        <Users size={14} className="mr-2 text-indigo-400" /> {org.name}
                      </DropdownMenuItem>
                    ))
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
          <button onClick={toggleSidebar} className="h-5 w-5 rounded-md border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-zinc-200">
            {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
          </button>
        </div>
      </SidebarHeader>

      <SidebarContent className="px-3 py-4 space-y-6">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {navItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild className={pathname === item.url ? "bg-zinc-100 text-zinc-900" : ""}>
                    <a href={item.url}><item.icon size={16} /> <span>{item.title}</span></a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          {!isCollapsed && (
            <div className="flex items-center justify-between px-3 mb-2">
              <SidebarGroupLabel className="p-0 text-[10px] tracking-widest text-zinc-600">RECENT PROJECTS</SidebarGroupLabel>
              <Plus size={13} className="text-zinc-600" />
            </div>
          )}
          <SidebarGroupContent>
            <SidebarMenu className="gap-1">
              {projectsLoading ? <div className="px-3 text-xs text-zinc-500">Syncing...</div> : projects.map((p) => (
                <SidebarMenuItem key={p.id}>
                  <SidebarMenuButton onClick={() => router.push(`/dashboard/ide/${p.id}`)}>
                    <Folder size={14} className="text-blue-500" /> <span>{p.title}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3 border-t border-zinc-900/50">
         {/* User profile section remains same as your original provided code */}
      </SidebarFooter>
      <CreateOrgModal isOpen={isCreateModalOpen} onClose={() => setIsCreateModalOpen(false)} onSuccess={refreshWorkspaces} />
    </Sidebar>
  );
}
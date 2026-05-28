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
  MessageSquare
} from "lucide-react";
import { useWorkspace } from "@/context/workspace-context";
import { getUserWorkspaces } from "@/app/actions/get-user-workspaces";
import { getWorkspaceProjects } from "@/app/actions/projects";
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
  SidebarGroupLabel,
  SidebarGroupContent,
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
  const [projects, setProjects] = useState<any[]>([]);

  // 1. Fetch User Profile Data & Managed Organizations
  useEffect(() => {
    async function loadWorkspaceMeta() {
      try {
        const data = await getUserWorkspaces();
        setUserData(data?.user || null);
        setOrgs(data?.organizations || []);
      } catch (err) {
        console.error("Failed to load navigation workspace layers:", err);
      } finally {
        setLoading(false);
      }
    }
    loadWorkspaceMeta();
  }, []);

  // 2. Sync Recent Projects Dynamic Feed based on Active Scope Context Selection
  useEffect(() => {
    async function loadRecentProjects() {
      setProjectsLoading(true);
      try {
        const data = await getWorkspaceProjects(currentWorkspaceType, activeOrgId);
        setProjects(data ? data.slice(0, 5) : []);
      } catch (err) {
        console.error("Failed to sync project items feed inside sidebar:", err);
      } finally {
        setProjectsLoading(false);
      }
    }
    loadRecentProjects();
  }, [currentWorkspaceType, activeOrgId]);

  const isCollapsed = state === "collapsed";

  const currentActiveName = currentWorkspaceType === "personal" 
    ? "Personal Space" 
    : orgs.find(o => o.id === activeOrgId)?.name || "Team Space";

  // 🚀 Clear, forced logout sequence handler
  const handleLogoutSequence = async (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    await signOut({ 
      redirect: true, 
      callbackUrl: "/" 
    });
  };

  return (
    <Sidebar 
      variant="sidebar" 
      collapsible="icon" 
      className="border-r border-zinc-900 bg-[#0d1117] text-zinc-400 select-none w-[260px] shrink-0 z-30"
    >
      {/* 1. BRAND HEADER BLOCK WITH INTEGRATED INTERACTIVE WORKSPACE SELECTOR */}
      <SidebarHeader className="p-3 border-b border-zinc-900/40 flex flex-row items-center gap-2 min-h-[64px] bg-[#0d1117]">
        <SidebarMenu className="flex-1 min-w-0">
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton 
                  size="lg" 
                  className="w-full justify-between hover:bg-zinc-900/40 hover:text-white transition-all data-[state=open]:bg-zinc-900/40 rounded-lg p-1"
                >
                  <div className="flex items-center gap-2.5 text-left overflow-hidden w-full">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded border border-zinc-800 bg-zinc-950 text-amber-500 font-mono text-xs font-bold">
                      {currentWorkspaceType === "personal" ? "P" : "T"}
                    </div>
                    
                    {!isCollapsed && (
                      <div className="flex flex-col leading-none truncate max-w-[130px]">
                        <span className="font-bold text-xs tracking-tight text-zinc-100 truncate">
                          {currentActiveName}
                        </span>
                        <span className="text-[10px] text-zinc-500 font-medium tracking-wide mt-0.5 uppercase">
                          {currentWorkspaceType} scope
                        </span>
                      </div>
                    )}
                  </div>
                  {!isCollapsed && <ChevronsUpDown className="ml-auto h-3.5 w-3.5 text-zinc-500 shrink-0" />}
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              
              <DropdownMenuContent className="w-60 bg-zinc-900 border border-zinc-800 text-zinc-300 shadow-2xl rounded-xl p-1 z-[100]" align="start" side="bottom" sideOffset={6}>
                <DropdownMenuLabel className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase px-2.5 py-2">
                  Select Scope
                </DropdownMenuLabel>
                
                <DropdownMenuItem 
                  onClick={() => setActiveWorkspace("personal", null)}
                  className={`flex items-center gap-2.5 cursor-pointer focus:bg-zinc-800 focus:text-white py-2 px-2.5 rounded-lg text-xs ${
                    currentWorkspaceType === "personal" ? "bg-zinc-800/60 text-amber-500 font-semibold" : ""
                  }`}
                >
                  <User size={14} className={currentWorkspaceType === "personal" ? "text-amber-500" : "text-zinc-400"} />
                  <span>Personal Sandbox</span>
                </DropdownMenuItem>

                <DropdownMenuSeparator className="bg-zinc-800/60 my-1" />
                
                <DropdownMenuLabel className="text-[10px] text-zinc-500 font-bold tracking-widest uppercase px-2.5 py-2 flex items-center justify-between">
                  <span>Organizations</span>
                  <button className="hover:text-amber-500 p-0.5 rounded transition">
                    <Plus size={12} />
                  </button>
                </DropdownMenuLabel>

                {loading ? (
                  <div className="text-[11px] px-3 py-2 text-zinc-500 italic flex items-center gap-2">
                    <Loader2 size={10} className="animate-spin" /> Syncing scopes...
                  </div>
                ) : orgs.length === 0 ? (
                  <div className="text-[11px] px-3 py-2 text-zinc-500 italic">No teams configured</div>
                ) : (
                  orgs.map((org) => (
                    <DropdownMenuItem
                      key={org.id}
                      onClick={() => setActiveWorkspace("team", org.id)}
                      className={`flex items-center gap-2.5 cursor-pointer focus:bg-zinc-800 focus:text-white py-2 px-2.5 rounded-lg text-xs ${
                        activeOrgId === org.id ? "bg-zinc-800/60 text-amber-500 font-semibold" : ""
                      }`}
                    >
                      <Users size={14} className={activeOrgId === org.id ? "text-amber-500" : "text-zinc-400"} />
                      <span className="truncate">{org.name}</span>
                    </DropdownMenuItem>
                  ))
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>

        <button 
          onClick={toggleSidebar}
          className="h-5 w-5 rounded-md border border-zinc-800 bg-zinc-900 flex items-center justify-center text-zinc-500 hover:text-zinc-200 transition-all shrink-0"
        >
          {isCollapsed ? <ChevronRight size={12} /> : <ChevronLeft size={12} />}
        </button>
      </SidebarHeader>

      {/* 2. CORE INTERIOR NAVIGATION STREAM */}
      <SidebarContent className="px-3 py-4 space-y-6 scrollbar-none bg-[#0d1117]">
        <SidebarGroup className="p-0">
          <SidebarGroupContent>
            <SidebarMenu className="gap-1.5">
              {navItems.map((item) => {
                const isActive = pathname === item.url;
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton 
                      asChild 
                      tooltip={item.title} 
                      className={`w-full px-3 py-2.5 rounded-lg transition-all duration-150 relative font-medium text-xs tracking-wider ${
                        isActive 
                          ? "text-zinc-900 bg-zinc-100 hover:bg-zinc-100 font-semibold shadow-sm" 
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/50"
                      }`}
                    >
                      <a href={item.url} className="flex items-center gap-3">
                        <item.icon size={16} className="shrink-0" />
                        <span>{item.title}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* DYNAMIC RECENT PROJECTS GROUP */}
        <SidebarGroup className="p-0">
          <div className="flex items-center justify-between px-3 mb-2">
            {!isCollapsed && (
              <SidebarGroupLabel className="text-[10px] font-bold tracking-widest text-zinc-600 p-0 h-auto bg-transparent">
                RECENT PROJECTS
              </SidebarGroupLabel>
            )}
            {!isCollapsed && (
              <button className="text-zinc-600 hover:text-zinc-400 p-0.5 transition rounded hover:bg-zinc-900">
                <Plus size={13} />
              </button>
            )}
          </div>
          
          <SidebarGroupContent>
            <SidebarMenu className="gap-0.5">
              {projectsLoading ? (
                <div className="flex items-center gap-2 px-3 py-2 text-zinc-600 text-xs font-mono">
                  <Loader2 size={12} className="animate-spin text-zinc-500" />
                  {!isCollapsed && <span>Syncing...</span>}
                </div>
              ) : projects.length === 0 ? (
                !isCollapsed && (
                  <div className="px-3 py-2 text-zinc-600 text-[11px] italic">
                    No active runtimes found
                  </div>
                )
              ) : (
                projects.map((project) => (
                  <SidebarMenuItem key={project.id}>
                    <SidebarMenuButton 
                      onClick={() => router.push(`/dashboard/ide/${project.id}`)}
                      tooltip={project.title}
                      className="w-full px-3 py-2 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40 rounded-lg transition-all text-xs font-light"
                    >
                      <div className="flex items-center gap-3 truncate w-full">
                        <Folder size={14} className="text-blue-500 shrink-0" />
                        {!isCollapsed && (
                          <span className="truncate text-[12px] font-mono tracking-tight text-zinc-400">
                            {project.title}
                          </span>
                        )}
                      </div>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))
              )}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      {/* 3. FOOTER SEGMENT WITH FIXED DROPDOWN RUNTIME */}
      {/* 🚀 Changed styling layer bounds to keep pointer elements interactive */}
      <SidebarFooter className="p-3 border-t border-zinc-900/40 space-y-3 bg-[#0d1117] pointer-events-auto overflow-visible">
        <div className="px-1">
          <div className="flex items-center justify-between bg-zinc-900/40 border border-zinc-900 rounded-lg p-1 text-xs font-mono h-9">
            <div className="flex items-center gap-2 px-2 text-zinc-400">
              <Sun size={14} className="text-zinc-500" />
              {!isCollapsed && <span className="text-[11px] tracking-tight">Light Mode</span>}
            </div>
            {!isCollapsed && (
              <div className="text-[10px] bg-zinc-800 border border-zinc-700/60 text-zinc-300 rounded px-2 py-0.5 font-sans font-medium">
                Light
              </div>
            )}
          </div>
        </div>

        <SidebarMenu className="overflow-visible">
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton 
                  size="lg" 
                  className="w-full hover:bg-zinc-900/60 data-[state=open]:bg-zinc-900/60 p-1.5 rounded-xl transition-all"
                >
                  <div className="flex items-center gap-2.5 w-full overflow-hidden">
                    <Avatar className="h-7 w-7 border border-zinc-800 shrink-0 rounded-full">
                      <AvatarImage src={userData?.image || ""} alt="User Avatar" />
                      <AvatarFallback className="bg-zinc-900 text-zinc-500 text-[10px] font-bold">
                        {userData?.name?.substring(0, 2).toUpperCase() || "UX"}
                      </AvatarFallback>
                    </Avatar>
                    
                    {!isCollapsed && (
                      <div className="flex flex-col text-left leading-tight flex-1 truncate">
                        <span className="text-xs font-semibold text-zinc-200 truncate">
                          {loading ? "Loading account..." : (userData?.name || "Workspace User")}
                        </span>
                        <span className="text-[10px] text-zinc-500 truncate mt-0.5 font-mono">
                          {userData?.email || "active_session"}
                        </span>
                      </div>
                    )}
                  </div>
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              
              {/* 🚀 Changed to side="right" when collapsed, side="top" when open, added hardcoded z-[100] override */}
              <DropdownMenuContent 
                className="w-52 bg-zinc-900 border border-zinc-800 text-zinc-300 shadow-2xl rounded-xl p-1 z-[100]" 
                align="end" 
                side={isCollapsed ? "right" : "top"} 
                sideOffset={12}
              >
                <DropdownMenuLabel className="text-[10px] text-zinc-500 font-mono tracking-widest uppercase px-2.5 py-1.5">Settings</DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-zinc-800/60 mx-1" />
                <DropdownMenuItem 
                  onSelect={handleLogoutSequence}
                  className="flex items-center gap-2 cursor-pointer text-red-400 focus:bg-red-950/40 focus:text-red-400 rounded-lg py-2 px-2.5 m-1 transition-all"
                >
                  <LogOut size={14} />
                  <span className="text-xs font-semibold">Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  );
}
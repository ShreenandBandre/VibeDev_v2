import React from "react";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/dashboard/app-sidebar";
import { WorkspaceProvider } from "@/context/workspace-context";
// 🚀 ADD THIS IMPORT:
import { TooltipProvider } from "@/components/ui/tooltip";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <WorkspaceProvider>
      <SidebarProvider defaultOpen={true}>
        {/* 🚀 WRAP EVERYTHING INSIDE THE TOOLTIP PROVIDER */}
        <TooltipProvider delayDuration={0}>
          <div className="flex h-screen w-screen bg-zinc-950 text-zinc-50 overflow-hidden font-sans">
            {/* Main App Sidebar Component */}
            <AppSidebar />
            
            {/* Main Content Workspace Layout canvas wrapper */}
            <div className="flex flex-col flex-1 h-full min-w-0 bg-zinc-950">
              {/* Context/Trigger Bar */}
              <header className="flex h-14 items-center gap-4 border-b border-zinc-900 bg-zinc-950 px-4 shrink-0">
                <SidebarTrigger className="text-zinc-400 hover:text-white transition" />
                <div className="h-4 w-px bg-zinc-800" />
                <div className="text-xs text-zinc-500 font-mono tracking-tight">
                  System status: Stable // Architecture Sync Core v1.0.0
                </div>
              </header>
              
              {/* Render subpages cleanly with scroll containment */}
              <main className="flex-1 overflow-y-auto custom-scrollbar p-6">
                {children}
              </main>
            </div>
          </div>
        </TooltipProvider>
      </SidebarProvider>
    </WorkspaceProvider>
  );
}
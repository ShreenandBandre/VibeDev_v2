"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

type WorkspaceType = "personal" | "team";

interface WorkspaceContextProps {
  currentWorkspaceType: WorkspaceType;
  activeOrgId: string | null; // null represents personal space
  setActiveWorkspace: (type: WorkspaceType, orgId: string | null) => void;
}

const WorkspaceContext = createContext<WorkspaceContextProps | undefined>(undefined);

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const [currentWorkspaceType, setCurrentWorkspaceType] = useState<WorkspaceType>("personal");
  const [activeOrgId, setActiveOrgId] = useState<string | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const setActiveWorkspace = (type: WorkspaceType, orgId: string | null) => {
    setCurrentWorkspaceType(type);
    setActiveOrgId(orgId);
    
    // Programmatically push to dashboard root with clear search params or clean slugging
    if (type === "team" && orgId) {
      router.push(`/dashboard?workspace=team&orgId=${orgId}`);
    } else {
      router.push(`/dashboard?workspace=personal`);
    }
  };

  // Sync state if initial page loads with query params
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const mode = searchParams.get("workspace");
    const org = searchParams.get("orgId");

    if (mode === "team" && org) {
      setCurrentWorkspaceType("team");
      setActiveOrgId(org);
    } else {
      setCurrentWorkspaceType("personal");
      setActiveOrgId(null);
    }
  }, [pathname]);

  return (
    <WorkspaceContext.Provider value={{ currentWorkspaceType, activeOrgId, setActiveWorkspace }}>
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);
  if (!context) throw new Error("useWorkspace must be used within a WorkspaceProvider");
  return context;
}
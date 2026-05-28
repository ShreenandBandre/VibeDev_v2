"use client";

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useMemo } from "react";

type WorkspaceType = "personal" | "team";

interface WorkspaceContextProps {
  currentWorkspaceType: WorkspaceType;
  activeOrgId: string | null;
  setActiveWorkspace: (
    type: WorkspaceType,
    orgId: string | null
  ) => void;
}

const WorkspaceContext = createContext<
  WorkspaceContextProps | undefined
>(undefined);

export function WorkspaceProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentWorkspaceType, setCurrentWorkspaceType] =
    useState<WorkspaceType>("personal");

  const [activeOrgId, setActiveOrgId] =
    useState<string | null>(null);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  
  const setActiveWorkspace = useCallback(
    (type: WorkspaceType, orgId: string | null) => {
      setCurrentWorkspaceType(type);
      setActiveOrgId(orgId);

      // Navigate accordingly
      if (type === "team" && orgId) {
        router.push(
          `/dashboard?workspace=team&orgId=${orgId}`
        );
      } else {
        router.push("/dashboard");
      }
    },
    [router]
  );

  // Sync workspace state from URL
  useEffect(() => {
    const mode = searchParams.get("workspace");
    const org = searchParams.get("orgId");

    if (mode === "team" && org) {
      setCurrentWorkspaceType("team");
      setActiveOrgId(org);
    } else {
      setCurrentWorkspaceType("personal");
      setActiveOrgId(null);
    }
  }, [pathname, searchParams]);

  const contextValue = useMemo(() => ({
    currentWorkspaceType,
    activeOrgId,
    setActiveWorkspace,
  }), [currentWorkspaceType, activeOrgId, setActiveWorkspace]);

  return (
    <WorkspaceContext.Provider
      value={
        contextValue
      }
    >
      {children}
    </WorkspaceContext.Provider>
  );
}

export function useWorkspace() {
  const context = useContext(WorkspaceContext);

  if (!context) {
    throw new Error(
      "useWorkspace must be used within a WorkspaceProvider"
    );
  }

  return context;
}
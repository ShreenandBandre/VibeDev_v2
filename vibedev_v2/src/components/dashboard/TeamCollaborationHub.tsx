"use client";

import { useWorkspace } from "@/context/workspace-context";
import { useEffect, useState } from "react";
import { getTeamGitHubActivity } from "@/app/actions/github-team-data";

export function TeamCollaborationHub() {
  const { currentWorkspaceType, activeOrgId } = useWorkspace();
  const [data, setData] = useState<any>(null);

  useEffect(() => {
    if (currentWorkspaceType === "team" && activeOrgId) {
      getTeamGitHubActivity(activeOrgId).then(setData);
    }
  }, [currentWorkspaceType, activeOrgId]);

  if (currentWorkspaceType !== "team") return null;

  return (
    <div className="p-6 border border-zinc-900 rounded-xl bg-zinc-950">
      <h2 className="text-sm font-bold text-white mb-4">Team Repository Activity</h2>
      {/* Map through data.repositories and render them */}
    </div>
  );
}
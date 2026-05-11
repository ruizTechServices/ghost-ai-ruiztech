"use client";

import { PanelRightClose, PanelRightOpen, Share2 } from "lucide-react";
import { useState } from "react";

import { Canvas } from "@/components/editor/canvas/Canvas";
import { ProjectDialogs } from "@/components/editor/ProjectDialogs";
import { ProjectSidebar } from "@/components/editor/ProjectSidebar";
import { ShareDialog } from "@/components/editor/ShareDialog";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useProjectActions } from "@/hooks/useProjectActions";
import type { EditorProject } from "@/lib/editor/get-editor-projects";
import { cn } from "@/lib/utils";

interface WorkspaceShellProps {
  ownedProjects: EditorProject[];
  project: EditorProject;
  roomId: string;
  sharedProjects: EditorProject[];
}

const WorkspaceShell = ({
  ownedProjects,
  project,
  roomId,
  sharedProjects,
}: WorkspaceShellProps) => {
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(true);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const projectActions = useProjectActions({
    activeProjectId: roomId,
    initialOwnedProjects: ownedProjects,
    initialSharedProjects: sharedProjects,
  });
  const AiSidebarIcon = isAiSidebarOpen ? PanelRightClose : PanelRightOpen;

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-base text-copy-primary">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-surface-border bg-bg-surface px-4">
        <div className="min-w-0">
          <h1 className="truncate text-sm font-semibold tracking-normal text-copy-primary">
            {project.name}
          </h1>
          <p className="truncate font-mono text-xs text-copy-muted">
            {roomId}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            className="rounded-xl"
            onClick={() => setIsShareDialogOpen(true)}
            variant="outline"
          >
            <Share2 className="h-4 w-4" />
            Share
          </Button>
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  aria-label={
                    isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"
                  }
                  aria-pressed={isAiSidebarOpen}
                  onClick={() => setIsAiSidebarOpen((current) => !current)}
                  size="icon-lg"
                  variant="ghost"
                />
              }
            >
              <AiSidebarIcon className="h-5 w-5" />
            </TooltipTrigger>
            <TooltipContent>
              {isAiSidebarOpen ? "Close AI sidebar" : "Open AI sidebar"}
            </TooltipContent>
          </Tooltip>
        </div>
      </header>

      <div className="flex min-h-0 flex-1">
        <aside className="hidden w-80 shrink-0 border-r border-surface-border bg-sidebar/95 md:flex">
          <ProjectSidebar
            actions={projectActions}
            currentRoomId={roomId}
            className="w-full"
          />
        </aside>

        <main className="flex min-w-0 flex-1 bg-base">
          <div className="min-h-0 flex-1 bg-bg-base">
            <Canvas roomId={roomId} />
          </div>

          <aside
            className={cn(
              "hidden w-80 shrink-0 border-l border-surface-border bg-bg-surface transition-[width] duration-200 lg:block",
              !isAiSidebarOpen && "w-0 overflow-hidden border-l-0",
            )}
          >
            <div className="flex h-full flex-col p-4">
              <div>
                <h2 className="text-base font-semibold tracking-normal text-copy-primary">
                  AI Assistant
                </h2>
                <p className="mt-1 text-xs leading-5 text-copy-muted">
                  Future generation chat and project context will appear here.
                </p>
              </div>
              <div className="mt-5 flex flex-1 items-center justify-center rounded-2xl border border-dashed border-surface-border bg-bg-subtle/40 px-4 text-center text-sm text-copy-muted">
                AI chat placeholder
              </div>
            </div>
          </aside>
        </main>
      </div>

      <ProjectDialogs actions={projectActions} />
      <ShareDialog
        canManage={project.ownership === "owned"}
        onOpenChange={setIsShareDialogOpen}
        open={isShareDialogOpen}
        projectName={project.name}
        roomId={roomId}
      />
    </div>
  );
};

export { WorkspaceShell };

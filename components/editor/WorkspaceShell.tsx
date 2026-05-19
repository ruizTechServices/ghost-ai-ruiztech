"use client";

import {
  AlertCircle,
  CheckCircle2,
  Cloud,
  House,
  LayoutTemplate,
  LoaderCircle,
  PanelRightClose,
  PanelRightOpen,
  Share2,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

import { AiWorkspaceSidebar } from "@/components/editor/AiWorkspaceSidebar";
import { Canvas } from "@/components/editor/canvas/Canvas";
import { ProjectDialogs } from "@/components/editor/ProjectDialogs";
import { ProjectSidebar } from "@/components/editor/ProjectSidebar";
import { ShareDialog } from "@/components/editor/ShareDialog";
import { StarterTemplatesModal } from "@/components/editor/starter-templates-modal";
import {
  CANVAS_TEMPLATES,
  type CanvasTemplate,
  type CanvasTemplateImportRequest,
} from "@/components/editor/starter-templates";
import { Button, buttonVariants } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { CanvasAutosaveState } from "@/hooks/useCanvasAutosave";
import { useProjectActions } from "@/hooks/useProjectActions";
import type { EditorProject } from "@/lib/editor/get-editor-projects";
import { cn } from "@/lib/utils";
import type { AiStatusEvent } from "@/types/ai-design";

interface WorkspaceShellProps {
  ownedProjects: EditorProject[];
  project: EditorProject;
  roomId: string;
  sharedProjects: EditorProject[];
}

const getSaveStatusLabel = ({
  lastSavedAt,
  status,
}: CanvasAutosaveState): string => {
  if (status === "saving") return "Saving";
  if (status === "error") return "Save error";
  if (status === "saved" && lastSavedAt) {
    return `Saved ${lastSavedAt.toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    })}`;
  }

  return "Autosave ready";
};

const CanvasSaveStatusIndicator = ({ state }: { state: CanvasAutosaveState }) => {
  const Icon =
    state.status === "saving"
      ? LoaderCircle
      : state.status === "saved"
        ? CheckCircle2
        : state.status === "error"
          ? AlertCircle
          : Cloud;

  return (
    <div
      className={cn(
        "hidden h-8 items-center gap-1.5 rounded-xl border border-surface-border bg-bg-subtle/70 px-2.5 text-xs font-medium text-copy-muted md:flex",
        state.status === "saved" && "text-state-success",
        state.status === "error" && "text-state-error",
      )}
    >
      <Icon
        className={cn("h-4 w-4", state.status === "saving" && "animate-spin")}
      />
      <span>{getSaveStatusLabel(state)}</span>
    </div>
  );
};

const WorkspaceShell = ({
  ownedProjects,
  project,
  roomId,
  sharedProjects,
}: WorkspaceShellProps) => {
  const [isAiSidebarOpen, setIsAiSidebarOpen] = useState(true);
  const [aiStatusEvents, setAiStatusEvents] = useState<AiStatusEvent[]>([]);
  const [canvasSaveState, setCanvasSaveState] = useState<CanvasAutosaveState>({
    lastSavedAt: null,
    status: "idle",
  });
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [isTemplatesModalOpen, setIsTemplatesModalOpen] = useState(false);
  const [templateImportRequest, setTemplateImportRequest] =
    useState<CanvasTemplateImportRequest | null>(null);
  const projectActions = useProjectActions({
    activeProjectId: roomId,
    initialOwnedProjects: ownedProjects,
    initialSharedProjects: sharedProjects,
  });
  const AiSidebarIcon = isAiSidebarOpen ? PanelRightClose : PanelRightOpen;

  const handleAiStatusEvent = (event: AiStatusEvent): void => {
    setAiStatusEvents((current) => {
      if (current.some((statusEvent) => statusEvent.id === event.id)) {
        return current;
      }

      return [...current, event].slice(-80);
    });
  };

  const handleTemplateImport = (template: CanvasTemplate): void => {
    setTemplateImportRequest((current) => ({
      id: (current?.id ?? 0) + 1,
      template,
    }));
  };

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-base text-copy-primary">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-surface-border bg-bg-surface px-4">
        <div className="flex min-w-0 items-center gap-3">
          <Link
            aria-label="Go to project home"
            className={cn(
              buttonVariants({ size: "default", variant: "outline" }),
              "rounded-xl border-surface-border bg-bg-subtle/70 text-copy-primary hover:bg-bg-elevated",
            )}
            href="/editor"
          >
            <House className="h-4 w-4" />
            <span className="hidden sm:inline">Home</span>
          </Link>

          <div className="min-w-0">
            <h1 className="truncate text-sm font-semibold tracking-normal text-copy-primary">
              {project.name}
            </h1>
            <p className="truncate font-mono text-xs text-copy-muted">
              {roomId}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <CanvasSaveStatusIndicator state={canvasSaveState} />
          <Button
            className="rounded-xl"
            onClick={() => setIsTemplatesModalOpen(true)}
            variant="outline"
          >
            <LayoutTemplate className="h-4 w-4" />
            Templates
          </Button>
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
            <Canvas
              key={roomId}
              onAiStatusEvent={handleAiStatusEvent}
              onSaveStatusChange={setCanvasSaveState}
              roomId={roomId}
              templateImportRequest={templateImportRequest}
            />
          </div>

          <AiWorkspaceSidebar
            isOpen={isAiSidebarOpen}
            onOpenChange={setIsAiSidebarOpen}
            roomId={roomId}
            statusEvents={aiStatusEvents.filter(
              (statusEvent) => statusEvent.roomId === roomId,
            )}
          />
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
      <StarterTemplatesModal
        onImport={handleTemplateImport}
        onOpenChange={setIsTemplatesModalOpen}
        open={isTemplatesModalOpen}
        templates={CANVAS_TEMPLATES}
      />
    </div>
  );
};

export { WorkspaceShell };

"use client";

import {
  FolderOpen,
  MoreHorizontal,
  Pencil,
  Plus,
  Trash2,
  Users,
  X,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import type { useProjectActions } from "@/hooks/useProjectActions";
import type { EditorProject } from "@/lib/editor/get-editor-projects";
import { cn } from "@/lib/utils";

interface ProjectSidebarProps {
  actions: ReturnType<typeof useProjectActions>;
  className?: string;
  currentRoomId?: string;
  onClose?: () => void;
  showCloseButton?: boolean;
}

const ProjectSidebar = ({
  actions,
  className,
  currentRoomId,
  onClose,
  showCloseButton = false,
}: ProjectSidebarProps) => {
  return (
    <div className={cn("flex min-h-0 flex-1 flex-col p-4", className)}>
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-normal text-copy-primary">
            Projects
          </h2>
          <p className="text-xs text-copy-muted">Workspace library</p>
        </div>
        {showCloseButton && onClose && (
          <Tooltip>
            <TooltipTrigger
              render={
                <Button
                  aria-label="Close sidebar"
                  onClick={onClose}
                  size="icon-sm"
                  variant="ghost"
                />
              }
            >
              <X className="h-4 w-4" />
            </TooltipTrigger>
            <TooltipContent>Close sidebar</TooltipContent>
          </Tooltip>
        )}
      </div>

      <Button
        className="mt-5 w-full justify-center rounded-xl"
        onClick={actions.openCreateDialog}
      >
        <Plus className="h-4 w-4" />
        New Project
      </Button>

      <Tabs className="mt-5 min-h-0 flex-1" defaultValue="projects">
        <TabsList className="grid w-full grid-cols-2 rounded-xl bg-bg-subtle">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>
        <TabsContent
          className="mt-4 min-h-0 flex-1 rounded-2xl border border-surface-border bg-bg-surface/70 p-3"
          value="projects"
        >
          {actions.ownedProjects.length > 0 ? (
            <ProjectList
              currentRoomId={currentRoomId}
              onDelete={actions.openDeleteDialog}
              onRename={actions.openRenameDialog}
              projects={actions.ownedProjects}
              showActions
            />
          ) : (
            <EmptyState
              description="Created projects will appear here."
              icon={<FolderOpen className="h-8 w-8" />}
              title="No projects yet"
            />
          )}
        </TabsContent>
        <TabsContent
          className="mt-4 min-h-0 flex-1 rounded-2xl border border-surface-border bg-bg-surface/70 p-3"
          value="shared"
        >
          {actions.sharedProjects.length > 0 ? (
            <ProjectList
              currentRoomId={currentRoomId}
              onDelete={actions.openDeleteDialog}
              onRename={actions.openRenameDialog}
              projects={actions.sharedProjects}
            />
          ) : (
            <EmptyState
              description="Collaborative projects will appear here."
              icon={<Users className="h-8 w-8" />}
              title="Nothing shared"
            />
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface ProjectListProps {
  currentRoomId?: string;
  onDelete: (project: EditorProject) => void;
  onRename: (project: EditorProject) => void;
  projects: EditorProject[];
  showActions?: boolean;
}

const ProjectList = ({
  currentRoomId,
  onDelete,
  onRename,
  projects,
  showActions = false,
}: ProjectListProps) => {
  return (
    <div className="space-y-2">
      {projects.map((project) => {
        const isCurrent = project.id === currentRoomId;

        return (
          <div
            className={cn(
              "flex min-h-14 items-center justify-between gap-3 rounded-xl border bg-bg-subtle/70 px-3 py-2",
              isCurrent
                ? "border-brand bg-accent-dim"
                : "border-surface-border",
            )}
            key={project.id}
          >
            <Link
              aria-current={isCurrent ? "page" : undefined}
              className="min-w-0 flex-1 rounded-lg outline-none transition-colors hover:text-brand focus-visible:ring-2 focus-visible:ring-brand"
              href={`/editor/${project.id}`}
            >
              <p className="truncate text-sm font-medium text-copy-primary">
                {project.name}
              </p>
              <p className="truncate font-mono text-xs text-copy-muted">
                {project.id}
              </p>
            </Link>
            {showActions && (
              <DropdownMenu>
                <DropdownMenuTrigger
                  render={
                    <Button
                      aria-label={`Project actions for ${project.name}`}
                      size="icon-sm"
                      variant="ghost"
                    />
                  }
                >
                  <MoreHorizontal className="h-4 w-4" />
                </DropdownMenuTrigger>
                <DropdownMenuContent
                  align="end"
                  className="w-36 border border-surface-border bg-bg-elevated"
                >
                  <DropdownMenuItem onClick={() => onRename(project)}>
                    <Pencil className="h-4 w-4" />
                    Rename
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => onDelete(project)}
                    variant="destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        );
      })}
    </div>
  );
};

interface EmptyStateProps {
  description: string;
  icon: React.ReactNode;
  title: string;
}

const EmptyState = ({ description, icon, title }: EmptyStateProps) => {
  return (
    <div className="flex max-w-52 flex-col items-center gap-3 text-center">
      <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-surface-border bg-bg-subtle text-brand">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-copy-primary">{title}</p>
        <p className="mt-1 text-xs leading-5 text-copy-muted">
          {description}
        </p>
      </div>
    </div>
  );
};

export { ProjectSidebar };

"use client";

import { FolderOpen, MoreHorizontal, Pencil, Plus, Trash2, Users, X } from "lucide-react";

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
import type {
  MockProject,
  useProjectDialogs,
} from "@/components/editor/useProjectDialogs";
import { cn } from "@/lib/utils";

interface SidebarProps {
  dialogs: ReturnType<typeof useProjectDialogs>;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ dialogs, isOpen, onClose }: SidebarProps) => {
  return (
    <aside
      aria-hidden={!isOpen}
      className={cn(
        "fixed left-4 top-20 z-30 flex h-[calc(100vh-6rem)] w-[min(calc(100vw-2rem),22rem)] flex-col rounded-2xl border border-surface-border bg-sidebar/95 p-4 shadow-2xl shadow-bg-base/60 backdrop-blur transition-transform duration-200 ease-out",
        isOpen ? "translate-x-0" : "-translate-x-[calc(100%+2rem)]"
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-base font-semibold tracking-normal text-copy-primary">
            Projects
          </h2>
          <p className="text-xs text-copy-muted">Workspace library</p>
        </div>
        <Tooltip>
          <TooltipTrigger
            render={
              <Button
                aria-label="Close sidebar"
                variant="ghost"
                size="icon-sm"
                onClick={onClose}
              />
            }
          >
            <X className="h-4 w-4" />
          </TooltipTrigger>
          <TooltipContent>Close sidebar</TooltipContent>
        </Tooltip>
      </div>

      <Button
        className="mt-5 w-full justify-center rounded-xl"
        onClick={dialogs.openCreateDialog}
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
          {dialogs.ownedProjects.length > 0 ? (
            <ProjectList
              onDelete={dialogs.openDeleteDialog}
              onRename={dialogs.openRenameDialog}
              projects={dialogs.ownedProjects}
              showActions
            />
          ) : (
            <EmptyState
              icon={<FolderOpen className="h-8 w-8" />}
              title="No projects yet"
              description="Created projects will appear here."
            />
          )}
        </TabsContent>
        <TabsContent
          className="mt-4 min-h-0 flex-1 rounded-2xl border border-surface-border bg-bg-surface/70 p-3"
          value="shared"
        >
          {dialogs.sharedProjects.length > 0 ? (
            <ProjectList
              onDelete={dialogs.openDeleteDialog}
              onRename={dialogs.openRenameDialog}
              projects={dialogs.sharedProjects}
            />
          ) : (
            <EmptyState
              icon={<Users className="h-8 w-8" />}
              title="Nothing shared"
              description="Collaborative projects will appear here."
            />
          )}
        </TabsContent>
      </Tabs>
    </aside>
  );
};

interface ProjectListProps {
  onDelete: (project: MockProject) => void;
  onRename: (project: MockProject) => void;
  projects: MockProject[];
  showActions?: boolean;
}

const ProjectList = ({
  onDelete,
  onRename,
  projects,
  showActions = false,
}: ProjectListProps) => {
  return (
    <div className="space-y-2">
      {projects.map((project) => (
        <div
          className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-surface-border bg-bg-subtle/70 px-3 py-2"
          key={project.id}
        >
          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-copy-primary">
              {project.name}
            </p>
            <p className="truncate font-mono text-xs text-copy-muted">
              {project.slug}
            </p>
          </div>
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
      ))}
    </div>
  );
};

interface EmptyStateProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

const EmptyState = ({ icon, title, description }: EmptyStateProps) => {
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

export { Sidebar };

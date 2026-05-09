"use client";

import { FolderOpen, Plus, Users, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
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

      <Dialog>
        <DialogTrigger
          render={
            <Button className="mt-5 w-full justify-center rounded-xl" />
          }
        >
          <Plus className="h-4 w-4" />
          New Project
        </DialogTrigger>
        <DialogContent className="rounded-3xl border border-surface-border bg-bg-elevated">
          <DialogHeader>
            <DialogTitle>New Project</DialogTitle>
            <DialogDescription>
              Project creation fields will be added when the project workflow is
              implemented.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter showCloseButton>
            <Button disabled>Create project</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Tabs className="mt-5 min-h-0 flex-1" defaultValue="projects">
        <TabsList className="grid w-full grid-cols-2 rounded-xl bg-bg-subtle">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="shared">Shared</TabsTrigger>
        </TabsList>
        <TabsContent
          className="mt-4 flex min-h-0 flex-1 items-center justify-center rounded-2xl border border-dashed border-surface-border bg-bg-surface/70 p-6"
          value="projects"
        >
          <EmptyState
            icon={<FolderOpen className="h-8 w-8" />}
            title="No projects yet"
            description="Created projects will appear here."
          />
        </TabsContent>
        <TabsContent
          className="mt-4 flex min-h-0 flex-1 items-center justify-center rounded-2xl border border-dashed border-surface-border bg-bg-surface/70 p-6"
          value="shared"
        >
          <EmptyState
            icon={<Users className="h-8 w-8" />}
            title="Nothing shared"
            description="Collaborative projects will appear here."
          />
        </TabsContent>
      </Tabs>
    </aside>
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

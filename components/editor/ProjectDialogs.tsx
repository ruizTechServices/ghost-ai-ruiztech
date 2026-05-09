"use client";

import type { FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { useProjectDialogs } from "@/components/editor/useProjectDialogs";

interface ProjectDialogsProps {
  dialogs: ReturnType<typeof useProjectDialogs>;
}

const ProjectDialogs = ({ dialogs }: ProjectDialogsProps) => {
  const isCreateOpen = dialogs.activeDialog?.type === "create";
  const isRenameOpen = dialogs.activeDialog?.type === "rename";
  const isDeleteOpen = dialogs.activeDialog?.type === "delete";

  const handleCreateSubmit = (event: FormEvent<HTMLFormElement>) => {
    dialogs.submitCreateProject(event);
  };

  const handleRenameSubmit = (event: FormEvent<HTMLFormElement>) => {
    dialogs.submitRenameProject(event);
  };

  return (
    <>
      <Dialog open={isCreateOpen} onOpenChange={dialogs.closeDialog}>
        <DialogContent className="rounded-3xl border border-surface-border bg-bg-elevated">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle>Create Project</DialogTitle>
              <DialogDescription>
                Name the workspace before the project data layer is connected.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-5 space-y-3">
              <label className="block text-sm font-medium text-copy-primary">
                Project name
                <Input
                  autoFocus
                  className="mt-2 h-10 rounded-xl border-surface-border bg-bg-subtle/70"
                  onChange={(event) => dialogs.setProjectName(event.target.value)}
                  placeholder="System architecture"
                  value={dialogs.projectName}
                />
              </label>
              <div className="rounded-xl border border-surface-border bg-bg-subtle/70 px-3 py-2 text-xs text-copy-muted">
                Slug preview:{" "}
                <span className="font-mono text-copy-primary">
                  {dialogs.slugPreview}
                </span>
              </div>
            </div>
            <DialogFooter
              className="mt-5 rounded-b-3xl border-surface-border bg-bg-subtle/60"
            >
              <DialogClose render={<Button type="button" variant="outline" />}>
                Close
              </DialogClose>
              <Button disabled={!dialogs.projectName.trim() || dialogs.isLoading}>
                {dialogs.isLoading ? "Creating..." : "Create project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isRenameOpen} onOpenChange={dialogs.closeDialog}>
        <DialogContent className="rounded-3xl border border-surface-border bg-bg-elevated">
          <form onSubmit={handleRenameSubmit}>
            <DialogHeader>
              <DialogTitle>Rename Project</DialogTitle>
              <DialogDescription>
                Current project: {dialogs.selectedProject?.name ?? "Unknown project"}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-5">
              <label className="block text-sm font-medium text-copy-primary">
                Project name
                <Input
                  autoFocus
                  className="mt-2 h-10 rounded-xl border-surface-border bg-bg-subtle/70"
                  onChange={(event) => dialogs.setProjectName(event.target.value)}
                  value={dialogs.projectName}
                />
              </label>
            </div>
            <DialogFooter
              className="mt-5 rounded-b-3xl border-surface-border bg-bg-subtle/60"
            >
              <DialogClose render={<Button type="button" variant="outline" />}>
                Close
              </DialogClose>
              <Button disabled={!dialogs.projectName.trim() || dialogs.isLoading}>
                {dialogs.isLoading ? "Saving..." : "Rename project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={dialogs.closeDialog}>
        <DialogContent className="rounded-3xl border border-surface-border bg-bg-elevated">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
            <DialogDescription>
              Delete {dialogs.selectedProject?.name ?? "this project"} from the
              mock project list.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter
            className="rounded-b-3xl border-surface-border bg-bg-subtle/60"
            showCloseButton
          >
            <Button
              disabled={dialogs.isLoading}
              onClick={dialogs.submitDeleteProject}
              variant="destructive"
            >
              {dialogs.isLoading ? "Deleting..." : "Delete project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { ProjectDialogs };

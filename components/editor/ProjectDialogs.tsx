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
import type { useProjectActions } from "@/hooks/useProjectActions";

interface ProjectDialogsProps {
  actions: ReturnType<typeof useProjectActions>;
}

const ProjectDialogs = ({ actions }: ProjectDialogsProps) => {
  const isCreateOpen = actions.activeDialog?.type === "create";
  const isRenameOpen = actions.activeDialog?.type === "rename";
  const isDeleteOpen = actions.activeDialog?.type === "delete";

  const handleCreateSubmit = (event: FormEvent<HTMLFormElement>) => {
    actions.submitCreateProject(event);
  };

  const handleRenameSubmit = (event: FormEvent<HTMLFormElement>) => {
    actions.submitRenameProject(event);
  };

  return (
    <>
      <Dialog open={isCreateOpen} onOpenChange={actions.closeDialog}>
        <DialogContent className="rounded-3xl border border-surface-border bg-bg-elevated text-copy-primary">
          <form onSubmit={handleCreateSubmit}>
            <DialogHeader>
              <DialogTitle className="text-copy-primary">Create Project</DialogTitle>
              <DialogDescription className="text-copy-muted">
                Name the workspace and create its Liveblocks room ID.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-5 space-y-3">
              <label className="block text-sm font-medium text-copy-primary">
                Project name
                <Input
                  autoFocus
                  className="mt-2 h-10 rounded-xl border-surface-border bg-bg-subtle/70 text-copy-primary placeholder:text-copy-muted"
                  onChange={(event) => actions.setProjectName(event.target.value)}
                  placeholder="System architecture"
                  value={actions.projectName}
                />
              </label>
              <div className="rounded-xl border border-surface-border bg-bg-subtle/70 px-3 py-2 text-xs text-copy-muted">
                Room ID preview:{" "}
                <span className="font-mono text-copy-primary">
                  {actions.roomIdPreview}
                </span>
              </div>
            </div>
            <DialogFooter
              className="mt-5 rounded-b-3xl border-surface-border bg-bg-subtle/60"
            >
              <DialogClose render={<Button type="button" variant="outline" />}>
                Close
              </DialogClose>
              <Button disabled={actions.isLoading} type="submit">
                {actions.isLoading ? "Creating..." : "Create project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isRenameOpen} onOpenChange={actions.closeDialog}>
        <DialogContent className="rounded-3xl border border-surface-border bg-bg-elevated text-copy-primary">
          <form onSubmit={handleRenameSubmit}>
            <DialogHeader>
              <DialogTitle className="text-copy-primary">Rename Project</DialogTitle>
              <DialogDescription className="text-copy-muted">
                Current project: {actions.selectedProject?.name ?? "Unknown project"}
              </DialogDescription>
            </DialogHeader>
            <div className="mt-5">
              <label className="block text-sm font-medium text-copy-primary">
                Project name
                <Input
                  autoFocus
                  className="mt-2 h-10 rounded-xl border-surface-border bg-bg-subtle/70 text-copy-primary placeholder:text-copy-muted"
                  onChange={(event) => actions.setProjectName(event.target.value)}
                  value={actions.projectName}
                />
              </label>
            </div>
            <DialogFooter
              className="mt-5 rounded-b-3xl border-surface-border bg-bg-subtle/60"
            >
              <DialogClose render={<Button type="button" variant="outline" />}>
                Close
              </DialogClose>
              <Button
                disabled={!actions.projectName.trim() || actions.isLoading}
                type="submit"
              >
                {actions.isLoading ? "Saving..." : "Rename project"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isDeleteOpen} onOpenChange={actions.closeDialog}>
        <DialogContent className="rounded-3xl border border-surface-border bg-bg-elevated text-copy-primary">
          <DialogHeader>
            <DialogTitle className="text-copy-primary">Delete Project</DialogTitle>
            <DialogDescription className="text-copy-muted">
              Delete {actions.selectedProject?.name ?? "this project"} from your
              project library.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter
            className="rounded-b-3xl border-surface-border bg-bg-subtle/60"
            showCloseButton
          >
            <Button
              disabled={actions.isLoading}
              onClick={actions.submitDeleteProject}
              variant="destructive"
            >
              {actions.isLoading ? "Deleting..." : "Delete project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export { ProjectDialogs };

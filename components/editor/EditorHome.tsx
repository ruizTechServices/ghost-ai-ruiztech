"use client";

import { Plus } from "lucide-react";

import { useEditorChrome } from "@/components/editor/EditorShell";
import { Button } from "@/components/ui/button";

const EditorHome = () => {
  const { openCreateProjectDialog } = useEditorChrome();

  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-6 py-12">
      <div className="max-w-xl text-center">
        <h1 className="text-3xl font-semibold tracking-normal text-copy-primary">
          Create a project or open an existing one
        </h1>
        <p className="mt-3 text-sm leading-6 text-copy-muted">
          Start a new architecture workspace, or choose a project from the
          sidebar.
        </p>
        <Button
          className="mt-6 rounded-xl"
          onClick={openCreateProjectDialog}
          size="lg"
        >
          <Plus className="h-4 w-4" />
          New Project
        </Button>
      </div>
    </div>
  );
};

export { EditorHome };

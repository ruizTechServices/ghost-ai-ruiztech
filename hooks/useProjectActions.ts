"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  useMemo,
  useState,
  type FormEvent,
} from "react";

import type { EditorProject } from "@/lib/editor/get-editor-projects";

type ProjectDialogType = "create" | "rename" | "delete";

interface ActiveProjectDialog {
  projectId?: string;
  type: ProjectDialogType;
}

interface UseProjectActionsOptions {
  activeProjectId?: string;
  initialOwnedProjects: EditorProject[];
  initialSharedProjects: EditorProject[];
}

const untitledProjectName = "Untitled Project";

const slugifyProjectName = (value: string) => {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "untitled-project";
};

const createRoomId = (name: string, suffix: string) => {
  const slug = slugifyProjectName(name);
  const base = slug
    .slice(0, 64)
    .replace(/-+$/g, "") || "untitled-project";

  return `${base}-${suffix}`;
};

const createShortSuffix = () => {
  const bytes = new Uint8Array(4);
  crypto.getRandomValues(bytes);

  return Array.from(bytes, (byte) => byte.toString(36).padStart(2, "0"))
    .join("")
    .slice(0, 6);
};

const useProjectActions = ({
  activeProjectId,
  initialOwnedProjects,
  initialSharedProjects,
}: UseProjectActionsOptions) => {
  const pathname = usePathname();
  const router = useRouter();
  const [activeDialog, setActiveDialog] = useState<ActiveProjectDialog | null>(
    null,
  );
  const [projectName, setProjectName] = useState("");
  const [createSuffix, setCreateSuffix] = useState(createShortSuffix);
  const [isLoading, setIsLoading] = useState(false);

  const allProjects = useMemo(
    () => [...initialOwnedProjects, ...initialSharedProjects],
    [initialOwnedProjects, initialSharedProjects],
  );
  const selectedProject = activeDialog?.projectId
    ? allProjects.find((project) => project.id === activeDialog.projectId) ??
      null
    : null;
  const roomIdPreview = createRoomId(projectName, createSuffix);

  const openCreateDialog = () => {
    setProjectName("");
    setCreateSuffix(createShortSuffix());
    setActiveDialog({ type: "create" });
  };

  const openRenameDialog = (project: EditorProject) => {
    setProjectName(project.name);
    setActiveDialog({ projectId: project.id, type: "rename" });
  };

  const openDeleteDialog = (project: EditorProject) => {
    setProjectName("");
    setActiveDialog({ projectId: project.id, type: "delete" });
  };

  const closeDialog = () => {
    if (isLoading) return;

    setActiveDialog(null);
    setProjectName("");
  };

  const submitCreateProject = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    setIsLoading(true);

    try {
      const response = await fetch("/api/projects", {
        body: JSON.stringify({
          name: projectName.trim() || untitledProjectName,
          projectId: roomIdPreview,
        }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) throw new Error("Project creation failed.");

      const payload = (await response.json()) as { project: EditorProject };

      setActiveDialog(null);
      setProjectName("");
      router.push(`/editor/${payload.project.id}`);
    } finally {
      setIsLoading(false);
    }
  };

  const submitRenameProject = async (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    const trimmedName = projectName.trim();
    if (!selectedProject || !trimmedName) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        body: JSON.stringify({ name: trimmedName }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "PATCH",
      });

      if (!response.ok) throw new Error("Project rename failed.");

      setActiveDialog(null);
      setProjectName("");
      router.refresh();
    } finally {
      setIsLoading(false);
    }
  };

  const submitDeleteProject = async () => {
    if (!selectedProject) return;

    setIsLoading(true);

    try {
      const response = await fetch(`/api/projects/${selectedProject.id}`, {
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Project deletion failed.");

      setActiveDialog(null);
      setProjectName("");

      if (
        selectedProject.id === activeProjectId ||
        pathname === `/editor/${selectedProject.id}`
      ) {
        router.replace("/editor");
      } else {
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return {
    activeDialog,
    closeDialog,
    isLoading,
    openCreateDialog,
    openDeleteDialog,
    openRenameDialog,
    ownedProjects: initialOwnedProjects,
    projectName,
    roomIdPreview,
    selectedProject,
    setProjectName,
    sharedProjects: initialSharedProjects,
    submitCreateProject,
    submitDeleteProject,
    submitRenameProject,
  };
};

export { useProjectActions };

"use client";

import { useState, type FormEvent } from "react";

export interface MockProject {
  id: string;
  name: string;
  slug: string;
  ownership: "owned" | "shared";
}

type ProjectDialogType = "create" | "rename" | "delete";

interface ActiveProjectDialog {
  type: ProjectDialogType;
  projectId?: string;
}

const MOCK_PROJECTS: MockProject[] = [
  {
    id: "owned-system-map",
    name: "System Map",
    slug: "system-map",
    ownership: "owned",
  },
  {
    id: "owned-supabase-agent",
    name: "Supabase Agent Flow",
    slug: "supabase-agent-flow",
    ownership: "owned",
  },
  {
    id: "shared-realtime-canvas",
    name: "Realtime Canvas Review",
    slug: "realtime-canvas-review",
    ownership: "shared",
  },
];

const slugifyProjectName = (value: string) => {
  const slug = value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug || "untitled-project";
};

const useProjectDialogs = () => {
  const [projects, setProjects] = useState<MockProject[]>(MOCK_PROJECTS);
  const [activeDialog, setActiveDialog] = useState<ActiveProjectDialog | null>(
    null
  );
  const [projectName, setProjectName] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const selectedProject = activeDialog?.projectId
    ? projects.find((project) => project.id === activeDialog.projectId) ?? null
    : null;
  const slugPreview = slugifyProjectName(projectName);
  const ownedProjects = projects.filter(
    (project) => project.ownership === "owned"
  );
  const sharedProjects = projects.filter(
    (project) => project.ownership === "shared"
  );

  const openCreateDialog = () => {
    setProjectName("");
    setActiveDialog({ type: "create" });
  };

  const openRenameDialog = (project: MockProject) => {
    setProjectName(project.name);
    setActiveDialog({ type: "rename", projectId: project.id });
  };

  const openDeleteDialog = (project: MockProject) => {
    setProjectName("");
    setActiveDialog({ type: "delete", projectId: project.id });
  };

  const closeDialog = () => {
    if (isLoading) return;

    setActiveDialog(null);
    setProjectName("");
  };

  const submitCreateProject = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    const trimmedName = projectName.trim();
    if (!trimmedName) return;

    setIsLoading(true);
    const slug = slugifyProjectName(trimmedName);

    setProjects((currentProjects) => [
      {
        id: `mock-${slug}-${currentProjects.length + 1}`,
        name: trimmedName,
        slug,
        ownership: "owned",
      },
      ...currentProjects,
    ]);
    setIsLoading(false);
    setActiveDialog(null);
    setProjectName("");
  };

  const submitRenameProject = (event?: FormEvent<HTMLFormElement>) => {
    event?.preventDefault();

    const trimmedName = projectName.trim();
    if (!selectedProject || !trimmedName) return;

    setIsLoading(true);
    setProjects((currentProjects) =>
      currentProjects.map((project) =>
        project.id === selectedProject.id
          ? { ...project, name: trimmedName, slug: slugifyProjectName(trimmedName) }
          : project
      )
    );
    setIsLoading(false);
    setActiveDialog(null);
    setProjectName("");
  };

  const submitDeleteProject = () => {
    if (!selectedProject) return;

    setIsLoading(true);
    setProjects((currentProjects) =>
      currentProjects.filter((project) => project.id !== selectedProject.id)
    );
    setIsLoading(false);
    setActiveDialog(null);
  };

  return {
    activeDialog,
    closeDialog,
    isLoading,
    openCreateDialog,
    openDeleteDialog,
    openRenameDialog,
    ownedProjects,
    projectName,
    selectedProject,
    setProjectName,
    sharedProjects,
    slugPreview,
    submitCreateProject,
    submitDeleteProject,
    submitRenameProject,
  };
};

export { useProjectDialogs };

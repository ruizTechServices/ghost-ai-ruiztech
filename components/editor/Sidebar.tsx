"use client";

import { ProjectSidebar } from "@/components/editor/ProjectSidebar";
import type { useProjectActions } from "@/hooks/useProjectActions";
import { cn } from "@/lib/utils";

interface SidebarProps {
  actions: ReturnType<typeof useProjectActions>;
  currentRoomId?: string;
  isOpen: boolean;
  onClose: () => void;
}

const Sidebar = ({
  actions,
  currentRoomId,
  isOpen,
  onClose,
}: SidebarProps) => {
  return (
    <aside
      aria-hidden={!isOpen}
      className={cn(
        "fixed left-4 top-20 z-30 flex h-[calc(100vh-6rem)] w-[min(calc(100vw-2rem),22rem)] flex-col rounded-2xl border border-surface-border bg-sidebar/95 p-4 shadow-2xl shadow-bg-base/60 backdrop-blur transition-transform duration-200 ease-out",
        isOpen ? "translate-x-0" : "-translate-x-[calc(100%+2rem)]"
      )}
    >
      <ProjectSidebar
        actions={actions}
        currentRoomId={currentRoomId}
        onClose={onClose}
        showCloseButton
      />
    </aside>
  );
};

export { Sidebar };

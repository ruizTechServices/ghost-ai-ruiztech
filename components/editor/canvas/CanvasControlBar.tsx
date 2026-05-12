"use client";

import { useCanRedo, useCanUndo, useRedo, useUndo } from "@liveblocks/react";
import { useReactFlow } from "@xyflow/react";
import { Minus, Plus, Redo2, Scan, Undo2 } from "lucide-react";
import type { ComponentType } from "react";

import { useKeyboardShortcuts } from "@/hooks/useKeyboardShortcuts";
import { cn } from "@/lib/utils";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

interface ControlButtonProps {
  Icon: ComponentType<{ className?: string }>;
  disabled?: boolean;
  label: string;
  onClick: () => void;
}

const VIEWPORT_ANIMATION_DURATION = 180;
const FIT_VIEW_ANIMATION_DURATION = 240;

const ControlButton = ({
  disabled = false,
  Icon,
  label,
  onClick,
}: ControlButtonProps) => (
  <button
    aria-label={label}
    className={cn(
      "flex h-9 w-9 items-center justify-center rounded-full text-copy-secondary transition-colors",
      "hover:bg-bg-subtle hover:text-copy-primary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand",
      disabled && "cursor-not-allowed opacity-35 hover:bg-transparent hover:text-copy-secondary",
    )}
    disabled={disabled}
    onClick={onClick}
    type="button"
  >
    <Icon className="h-4 w-4" />
  </button>
);

const CanvasControlBar = () => {
  const reactFlow = useReactFlow<CanvasNode, CanvasEdge>();
  const undo = useUndo();
  const redo = useRedo();
  const canUndo = useCanUndo();
  const canRedo = useCanRedo();

  useKeyboardShortcuts({
    animationDuration: VIEWPORT_ANIMATION_DURATION,
    canRedo,
    canUndo,
    reactFlow,
    redo,
    undo,
  });

  const handleZoomOut = (): void => {
    void reactFlow.zoomOut({ duration: VIEWPORT_ANIMATION_DURATION });
  };

  const handleFitView = (): void => {
    void reactFlow.fitView({
      duration: FIT_VIEW_ANIMATION_DURATION,
      padding: 0.2,
    });
  };

  const handleZoomIn = (): void => {
    void reactFlow.zoomIn({ duration: VIEWPORT_ANIMATION_DURATION });
  };

  return (
    <div className="pointer-events-none absolute bottom-24 left-6 z-10">
      <div className="pointer-events-auto flex items-center gap-1 rounded-full border border-surface-border bg-bg-surface/95 p-1.5 shadow-lg backdrop-blur">
        <div className="flex items-center gap-1">
          <ControlButton
            Icon={Minus}
            label="Zoom out"
            onClick={handleZoomOut}
          />
          <ControlButton
            Icon={Scan}
            label="Fit view"
            onClick={handleFitView}
          />
          <ControlButton
            Icon={Plus}
            label="Zoom in"
            onClick={handleZoomIn}
          />
        </div>
        <div className="mx-1 h-6 w-px bg-surface-border" />
        <div className="flex items-center gap-1">
          <ControlButton
            disabled={!canUndo}
            Icon={Undo2}
            label="Undo"
            onClick={undo}
          />
          <ControlButton
            disabled={!canRedo}
            Icon={Redo2}
            label="Redo"
            onClick={redo}
          />
        </div>
      </div>
    </div>
  );
};

export { CanvasControlBar };

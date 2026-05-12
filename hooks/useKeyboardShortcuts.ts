"use client";

import { useEffect } from "react";
import type { Edge, Node, ReactFlowInstance } from "@xyflow/react";

interface UseKeyboardShortcutsOptions<
  NodeType extends Node = Node,
  EdgeType extends Edge = Edge,
> {
  animationDuration?: number;
  canRedo?: boolean;
  canUndo?: boolean;
  reactFlow: ReactFlowInstance<NodeType, EdgeType>;
  redo: () => void;
  undo: () => void;
}

const DEFAULT_ANIMATION_DURATION = 180;

const isEditableTarget = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;

  const tagName = target.tagName.toLowerCase();
  return (
    tagName === "input" ||
    tagName === "textarea" ||
    tagName === "select" ||
    target.isContentEditable ||
    target.closest("[contenteditable='true']") !== null
  );
};

const useKeyboardShortcuts = <
  NodeType extends Node = Node,
  EdgeType extends Edge = Edge,
>({
  animationDuration = DEFAULT_ANIMATION_DURATION,
  canRedo = true,
  canUndo = true,
  reactFlow,
  redo,
  undo,
}: UseKeyboardShortcutsOptions<NodeType, EdgeType>): void => {
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent): void => {
      if (isEditableTarget(event.target)) return;

      const key = event.key.toLowerCase();
      const hasCommandModifier = event.metaKey || event.ctrlKey;

      if (hasCommandModifier && key === "z" && event.shiftKey) {
        event.preventDefault();
        if (canRedo) redo();
        return;
      }

      if (hasCommandModifier && key === "z") {
        event.preventDefault();
        if (canUndo) undo();
        return;
      }

      if (hasCommandModifier && key === "y") {
        event.preventDefault();
        if (canRedo) redo();
        return;
      }

      if (event.metaKey || event.ctrlKey || event.altKey) return;

      if (event.key === "+" || event.key === "=") {
        event.preventDefault();
        void reactFlow.zoomIn({ duration: animationDuration });
        return;
      }

      if (event.key === "-") {
        event.preventDefault();
        void reactFlow.zoomOut({ duration: animationDuration });
      }
    };

    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [
    animationDuration,
    canRedo,
    canUndo,
    reactFlow,
    redo,
    undo,
  ]);
};

export { useKeyboardShortcuts };

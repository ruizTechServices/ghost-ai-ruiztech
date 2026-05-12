"use client";

import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
  useReactFlow,
} from "@xyflow/react";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type MouseEvent,
  type PointerEvent,
  type SyntheticEvent,
} from "react";

import { cn } from "@/lib/utils";
import type { CanvasEdge, CanvasNode } from "@/types/canvas";

const EDGE_INTERACTION_WIDTH = 28;
const EDGE_PATH_OFFSET = 24;
const EDGE_STROKE_WIDTH = 1.8;
const EDGE_EMPTY_LABEL_HINT = "Add label";

const stopCanvasInteraction = (event: SyntheticEvent): void => {
  event.stopPropagation();
};

const CanvasEdgeView = ({
  data,
  id,
  markerEnd,
  selected,
  sourcePosition,
  sourceX,
  sourceY,
  targetPosition,
  targetX,
  targetY,
}: EdgeProps<CanvasEdge>) => {
  const { updateEdgeData } = useReactFlow<CanvasNode, CanvasEdge>();
  const [isHovered, setIsHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [draftLabel, setDraftLabel] = useState(data?.label ?? "");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    borderRadius: 0,
    offset: EDGE_PATH_OFFSET,
    sourcePosition,
    sourceX,
    sourceY,
    targetPosition,
    targetX,
    targetY,
  });
  const label = data?.label ?? "";
  const isActive = selected || isHovered || isEditing;
  const hasLabel = label.trim().length > 0;
  const shouldShowLabel = hasLabel || isActive || isEditing;

  useEffect(() => {
    if (!isEditing) return;

    inputRef.current?.focus();
    inputRef.current?.select();
  }, [isEditing]);

  const startEditing = (event: SyntheticEvent): void => {
    event.stopPropagation();
    setDraftLabel(label);
    setIsEditing(true);
  };

  const saveLabel = (): void => {
    updateEdgeData(id, { label: draftLabel.trim() });
    setIsEditing(false);
  };

  const handleLabelChange = (event: ChangeEvent<HTMLInputElement>): void => {
    setDraftLabel(event.target.value);
  };

  const handleEditorKeyDown = (
    event: KeyboardEvent<HTMLInputElement>,
  ): void => {
    event.stopPropagation();

    if (event.key === "Enter" || event.key === "Escape") {
      event.preventDefault();
      saveLabel();
    }
  };

  const handleEdgeDoubleClick = (event: MouseEvent<SVGGElement>): void => {
    startEditing(event);
  };

  const handleLabelPointerDown = (
    event: PointerEvent<HTMLDivElement | HTMLInputElement>,
  ): void => {
    event.stopPropagation();
  };

  const labelWidth = `${Math.max(draftLabel.length + 2, 8)}ch`;

  return (
    <>
      <g
        onDoubleClick={handleEdgeDoubleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <BaseEdge
          interactionWidth={EDGE_INTERACTION_WIDTH}
          markerEnd={markerEnd}
          path={edgePath}
          stroke={
            isActive ? "var(--canvas-edge-active)" : "var(--canvas-edge-rest)"
          }
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={EDGE_STROKE_WIDTH}
        />
      </g>

      {shouldShowLabel ? (
        <EdgeLabelRenderer>
          <div
            className="nodrag nopan nowheel absolute"
            onClick={stopCanvasInteraction}
            onDoubleClick={startEditing}
            onMouseDown={stopCanvasInteraction}
            onPointerDown={handleLabelPointerDown}
            style={{
              pointerEvents: "all",
              transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
            }}
          >
            {isEditing ? (
              <input
                aria-label="Edge label"
                className="nodrag nopan nowheel h-7 max-w-56 rounded-full border border-surface-border bg-bg-elevated px-3 text-center text-xs font-medium text-copy-primary outline-none transition-colors placeholder:text-copy-muted focus:border-brand"
                onBlur={saveLabel}
                onChange={handleLabelChange}
                onClick={stopCanvasInteraction}
                onDoubleClick={stopCanvasInteraction}
                onKeyDown={handleEditorKeyDown}
                onMouseDown={stopCanvasInteraction}
                onPointerDown={handleLabelPointerDown}
                placeholder={EDGE_EMPTY_LABEL_HINT}
                ref={inputRef}
                style={{ width: labelWidth }}
                value={draftLabel}
              />
            ) : (
              <span
                className={cn(
                  "inline-flex max-w-56 items-center rounded-full border border-surface-border bg-bg-elevated/95 px-2.5 py-1 text-xs font-medium shadow-sm backdrop-blur",
                  hasLabel
                    ? "text-copy-primary"
                    : "text-copy-muted opacity-70",
                )}
              >
                <span className="truncate">
                  {hasLabel ? label : EDGE_EMPTY_LABEL_HINT}
                </span>
              </span>
            )}
          </div>
        </EdgeLabelRenderer>
      ) : null}
    </>
  );
};

export { CanvasEdgeView };

"use client";

import {
  Handle,
  NodeResizer,
  type NodeProps,
  Position,
  useReactFlow,
} from "@xyflow/react";
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type KeyboardEvent,
  type PointerEvent,
  type SyntheticEvent,
} from "react";

import {
  CANVAS_SHAPE_LABEL_PADDING,
  CanvasShapeView,
} from "@/components/editor/canvas/CanvasShapeView";
import { NodeColorToolbar } from "@/components/editor/canvas/NodeColorToolbar";
import { cn } from "@/lib/utils";
import {
  getCanvasNodeColorPair,
  type CanvasEdge,
  type CanvasNode,
  type CanvasNodeColorPair,
} from "@/types/canvas";

const HANDLE_CLASS =
  "h-2.5 w-2.5 border border-bg-base bg-copy-primary opacity-0 transition-opacity group-hover:opacity-100";

const MIN_NODE_HEIGHT = 56;
const MIN_NODE_WIDTH = 72;
const EMPTY_LABEL_PLACEHOLDER = "Add label";

const RESIZE_HANDLE_STYLE = {
  backgroundColor: "var(--accent-primary)",
  border: "1px solid var(--bg-base)",
  borderRadius: "9999px",
  height: 8,
  opacity: 0.85,
  width: 8,
};

const RESIZE_LINE_STYLE = {
  borderColor: "var(--accent-primary)",
  opacity: 0.65,
};

const stopCanvasInteraction = (event: SyntheticEvent): void => {
  event.stopPropagation();
};

const CanvasNodeView = ({ data, id, selected }: NodeProps<CanvasNode>) => {
  const { updateNodeData } = useReactFlow<CanvasNode, CanvasEdge>();
  const [isEditing, setIsEditing] = useState(false);
  const [editingLabel, setEditingLabel] = useState(data.label);
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const activeColorPair = getCanvasNodeColorPair(data.color, data.textColor);

  useEffect(() => {
    if (!isEditing) return;

    textareaRef.current?.focus();
    textareaRef.current?.select();
  }, [isEditing]);

  const startEditing = (event: SyntheticEvent): void => {
    event.stopPropagation();
    setEditingLabel(data.label);
    setIsEditing(true);
  };

  const stopEditing = (): void => {
    setIsEditing(false);
  };

  const handleLabelChange = (event: ChangeEvent<HTMLTextAreaElement>): void => {
    const nextLabel = event.target.value;
    setEditingLabel(nextLabel);
    updateNodeData(id, { label: nextLabel });
  };

  const handleColorSelect = (colorPair: CanvasNodeColorPair): void => {
    updateNodeData(id, {
      color: colorPair.color,
      textColor: colorPair.textColor,
    });
  };

  const handleEditorKeyDown = (
    event: KeyboardEvent<HTMLTextAreaElement>,
  ): void => {
    event.stopPropagation();

    if (event.key === "Escape") {
      event.preventDefault();
      stopEditing();
    }
  };

  const handleEditorPointerDown = (
    event: PointerEvent<HTMLTextAreaElement>,
  ): void => {
    event.stopPropagation();
  };

  return (
    <div className="group relative h-full w-full">
      <NodeColorToolbar
        activeColor={activeColorPair.color}
        activeTextColor={activeColorPair.textColor}
        nodeId={id}
        onSelectColor={handleColorSelect}
        selected={selected}
      />
      <CanvasShapeView
        color={activeColorPair.color}
        selected={selected}
        shape={data.shape}
      />
      <div
        className={cn(
          "absolute inset-0 flex items-center justify-center text-center text-sm font-medium leading-snug",
          CANVAS_SHAPE_LABEL_PADDING[data.shape],
        )}
        onDoubleClick={startEditing}
      >
        {isEditing ? (
          <textarea
            aria-label="Node label"
            className="nodrag nopan nowheel max-h-full min-h-8 w-full resize-none overflow-hidden border-0 bg-transparent text-center text-sm font-medium leading-snug outline-none placeholder:text-copy-muted"
            onBlur={stopEditing}
            onChange={handleLabelChange}
            onClick={stopCanvasInteraction}
            onDoubleClick={stopCanvasInteraction}
            onKeyDown={handleEditorKeyDown}
            onMouseDown={stopCanvasInteraction}
            onPointerDown={handleEditorPointerDown}
            ref={textareaRef}
            rows={2}
            style={{ color: activeColorPair.textColor }}
            value={editingLabel}
          />
        ) : (
          <span
            className={cn(
              "max-w-full truncate",
              !data.label && "opacity-60",
            )}
            style={{ color: activeColorPair.textColor }}
          >
            {data.label || EMPTY_LABEL_PLACEHOLDER}
          </span>
        )}
      </div>
      <NodeResizer
        autoScale
        color="var(--accent-primary)"
        handleStyle={RESIZE_HANDLE_STYLE}
        isVisible={selected}
        keepAspectRatio={data.shape === "circle"}
        lineStyle={RESIZE_LINE_STYLE}
        minHeight={MIN_NODE_HEIGHT}
        minWidth={MIN_NODE_WIDTH}
      />
      <Handle
        className={HANDLE_CLASS}
        id="top"
        position={Position.Top}
        type="source"
      />
      <Handle
        className={HANDLE_CLASS}
        id="right"
        position={Position.Right}
        type="source"
      />
      <Handle
        className={HANDLE_CLASS}
        id="bottom"
        position={Position.Bottom}
        type="source"
      />
      <Handle
        className={HANDLE_CLASS}
        id="left"
        position={Position.Left}
        type="source"
      />
    </div>
  );
};

export { CanvasNodeView };

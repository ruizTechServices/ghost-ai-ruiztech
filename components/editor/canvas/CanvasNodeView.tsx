"use client";

import { Handle, type NodeProps, Position } from "@xyflow/react";

import type { CanvasNode } from "@/types/canvas";

const CanvasNodeView = ({ data }: NodeProps<CanvasNode>) => {
  return (
    <div
      className="flex h-full w-full items-center justify-center rounded-md border-2 bg-bg-surface px-3 text-center text-sm text-copy-primary shadow-sm"
      style={{ borderColor: data.color }}
    >
      <Handle position={Position.Top} type="target" />
      <span className="truncate">{data.label}</span>
      <Handle position={Position.Bottom} type="source" />
    </div>
  );
};

export { CanvasNodeView };

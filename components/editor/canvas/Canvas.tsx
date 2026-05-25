"use client";

import { AiCanvasEvents } from "@/components/editor/canvas/AiCanvasEvents";
import { FlowCanvas } from "@/components/editor/canvas/FlowCanvas";
import type { CanvasTemplateImportRequest } from "@/components/editor/starter-templates";
import type { CanvasAutosaveState } from "@/hooks/useCanvasAutosave";
import type { AiStatusEvent } from "@/types/ai-design";

interface CanvasProps {
  onAiStatusEvent?: (event: AiStatusEvent) => void;
  onSaveStatusChange?: (state: CanvasAutosaveState) => void;
  roomId: string;
  templateImportRequest?: CanvasTemplateImportRequest | null;
}

const Canvas = ({
  onAiStatusEvent,
  onSaveStatusChange,
  roomId,
  templateImportRequest,
}: CanvasProps) => {
  return (
    <>
      <AiCanvasEvents onStatusEvent={onAiStatusEvent} />
      <FlowCanvas
        onSaveStatusChange={onSaveStatusChange}
        projectId={roomId}
        templateImportRequest={templateImportRequest}
      />
    </>
  );
};

export { Canvas };

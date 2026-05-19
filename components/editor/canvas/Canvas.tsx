"use client";

import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense";

import { AiCanvasEvents } from "@/components/editor/canvas/AiCanvasEvents";
import { CanvasErrorBoundary } from "@/components/editor/canvas/CanvasErrorBoundary";
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

const CanvasLoading = () => (
  <div className="flex h-full w-full items-center justify-center bg-bg-base">
    <p className="text-sm text-copy-muted">Loading canvas…</p>
  </div>
);

const Canvas = ({
  onAiStatusEvent,
  onSaveStatusChange,
  roomId,
  templateImportRequest,
}: CanvasProps) => {
  return (
    <CanvasErrorBoundary>
      <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
        <RoomProvider
          id={roomId}
          initialPresence={{ cursor: null, thinking: false }}
        >
          <ClientSideSuspense fallback={<CanvasLoading />}>
            <AiCanvasEvents onStatusEvent={onAiStatusEvent} />
            <FlowCanvas
              onSaveStatusChange={onSaveStatusChange}
              projectId={roomId}
              templateImportRequest={templateImportRequest}
            />
          </ClientSideSuspense>
        </RoomProvider>
      </LiveblocksProvider>
    </CanvasErrorBoundary>
  );
};

export { Canvas };

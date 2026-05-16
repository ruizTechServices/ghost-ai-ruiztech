"use client";

import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense";

import { CanvasErrorBoundary } from "@/components/editor/canvas/CanvasErrorBoundary";
import { FlowCanvas } from "@/components/editor/canvas/FlowCanvas";
import type { CanvasTemplateImportRequest } from "@/components/editor/starter-templates";
import type { CanvasAutosaveState } from "@/hooks/useCanvasAutosave";

interface CanvasProps {
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

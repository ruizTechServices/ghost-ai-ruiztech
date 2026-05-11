"use client";

import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense";

import { CanvasErrorBoundary } from "@/components/editor/canvas/CanvasErrorBoundary";
import { FlowCanvas } from "@/components/editor/canvas/FlowCanvas";

interface CanvasProps {
  roomId: string;
}

const CanvasLoading = () => (
  <div className="flex h-full w-full items-center justify-center bg-bg-base">
    <p className="text-sm text-copy-muted">Loading canvas…</p>
  </div>
);

const Canvas = ({ roomId }: CanvasProps) => {
  return (
    <CanvasErrorBoundary>
      <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
        <RoomProvider
          id={roomId}
          initialPresence={{ cursor: null, isThinking: false }}
        >
          <ClientSideSuspense fallback={<CanvasLoading />}>
            <FlowCanvas />
          </ClientSideSuspense>
        </RoomProvider>
      </LiveblocksProvider>
    </CanvasErrorBoundary>
  );
};

export { Canvas };

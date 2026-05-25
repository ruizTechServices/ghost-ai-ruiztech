"use client";

import {
  ClientSideSuspense,
  LiveblocksProvider,
  RoomProvider,
} from "@liveblocks/react/suspense";
import type { ReactNode } from "react";

import { CanvasErrorBoundary } from "@/components/editor/canvas/CanvasErrorBoundary";

interface WorkspaceRoomProps {
  children: ReactNode;
  roomId: string;
}

const WorkspaceRoomLoading = () => (
  <main className="flex min-w-0 flex-1 items-center justify-center bg-bg-base">
    <p className="text-sm text-copy-muted">Loading workspace...</p>
  </main>
);

const WorkspaceRoom = ({ children, roomId }: WorkspaceRoomProps) => {
  return (
    <CanvasErrorBoundary>
      <LiveblocksProvider authEndpoint="/api/liveblocks-auth">
        <RoomProvider
          id={roomId}
          initialPresence={{ cursor: null, thinking: false }}
        >
          <ClientSideSuspense fallback={<WorkspaceRoomLoading />}>
            {children}
          </ClientSideSuspense>
        </RoomProvider>
      </LiveblocksProvider>
    </CanvasErrorBoundary>
  );
};

export { WorkspaceRoom };

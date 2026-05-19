import "server-only";

import { createClient, type LiveObject, type LsonObject, type Room } from "@liveblocks/client";

import { getCursorColorForUser } from "@/lib/liveblocks/colors";
import { getLiveblocksServerClient } from "@/lib/liveblocks/server";

const AI_AGENT_USER_ID = "ghost-ai-design-agent";
const AI_AGENT_NAME = "Ghost AI";
const LIVEBLOCKS_WAIT_TIMEOUT_MS = 15_000;
const EVENT_FLUSH_DELAY_MS = 250;

type AgentRoom = Room<
  Liveblocks["Presence"],
  LsonObject,
  Liveblocks["UserMeta"],
  Liveblocks["RoomEvent"]
>;

interface LiveblocksMutationClient {
  mutateStorage(
    roomId: string,
    callback: (context: { root: LiveObject<LsonObject> }) => void | Promise<void>,
  ): Promise<void>;
}

interface ConnectedAgentRoom {
  leave: () => void;
  mutationClient: LiveblocksMutationClient;
  room: AgentRoom;
}

const wait = (milliseconds: number): Promise<void> =>
  new Promise((resolve) => {
    setTimeout(resolve, milliseconds);
  });

const withTimeout = async <T>(
  promise: Promise<T>,
  message: string,
): Promise<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;
  const timeout = new Promise<never>((_resolve, reject) => {
    timeoutId = setTimeout(() => reject(new Error(message)), LIVEBLOCKS_WAIT_TIMEOUT_MS);
  });

  try {
    return await Promise.race([promise, timeout]);
  } finally {
    if (timeoutId) clearTimeout(timeoutId);
  }
};

const waitForStorageSynchronized = async (room: AgentRoom): Promise<void> => {
  if (room.getStorageStatus() === "synchronized") return;

  await withTimeout(
    new Promise<void>((resolve) => {
      const unsubscribe = room.subscribe("storage-status", (status) => {
        if (status !== "synchronized") return;

        unsubscribe();
        resolve();
      });
    }),
    "Timed out waiting for Liveblocks storage to synchronize.",
  );
};

const createMutationClient = (room: AgentRoom): LiveblocksMutationClient => ({
  async mutateStorage(_roomId, callback) {
    const { root } = await room.getStorage();
    await callback({ root });
    await waitForStorageSynchronized(room);
  },
});

const connectDesignAgentRoom = async (
  roomId: string,
): Promise<ConnectedAgentRoom> => {
  const liveblocksServer = getLiveblocksServerClient();
  await liveblocksServer.ensureRoom(roomId);

  const client = createClient<Liveblocks["UserMeta"]>({
    authEndpoint: async (requestedRoomId) => {
      if (requestedRoomId !== roomId) {
        return {
          error: "forbidden",
          reason: "Design agent can only access its assigned room.",
        };
      }

      return liveblocksServer.authorizeUser({
        roomId,
        userId: AI_AGENT_USER_ID,
        userInfo: {
          avatar: "",
          color: getCursorColorForUser(AI_AGENT_USER_ID),
          name: AI_AGENT_NAME,
        },
      });
    },
    throttle: 16,
  });

  const { leave, room } = client.enterRoom<
    Liveblocks["Presence"],
    LsonObject,
    Liveblocks["RoomEvent"]
  >(roomId, {
    initialPresence: { cursor: null, thinking: false },
  });

  await withTimeout(
    room.waitUntilPresenceReady(),
    "Timed out waiting for Liveblocks presence to become ready.",
  );

  return {
    leave,
    mutationClient: createMutationClient(room),
    room,
  };
};

const flushLiveblocksEvents = async (): Promise<void> => {
  await wait(EVENT_FLUSH_DELAY_MS);
};

export {
  AI_AGENT_NAME,
  AI_AGENT_USER_ID,
  connectDesignAgentRoom,
  flushLiveblocksEvents,
  waitForStorageSynchronized,
};
export type { AgentRoom, ConnectedAgentRoom, LiveblocksMutationClient };

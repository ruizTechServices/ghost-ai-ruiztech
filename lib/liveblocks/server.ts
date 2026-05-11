import "server-only";

const LIVEBLOCKS_API_BASE = "https://api.liveblocks.io/v2";

interface AuthorizeUserParams {
  roomId: string;
  userId: string;
  userInfo: {
    avatar: string;
    color: string;
    name: string;
  };
}

interface AuthorizeUserResponse {
  token: string;
}

class LiveblocksServerClient {
  private readonly secretKey: string;

  constructor(secretKey: string) {
    this.secretKey = secretKey;
  }

  private headers(): HeadersInit {
    return {
      Authorization: `Bearer ${this.secretKey}`,
      "Content-Type": "application/json",
    };
  }

  async ensureRoom(roomId: string): Promise<void> {
    const existing = await fetch(
      `${LIVEBLOCKS_API_BASE}/rooms/${encodeURIComponent(roomId)}`,
      { headers: this.headers(), method: "GET" }
    );

    if (existing.ok) return;
    if (existing.status !== 404) {
      const text = await existing.text();
      throw new Error(
        `Liveblocks room lookup failed (${existing.status}): ${text}`
      );
    }

    const created = await fetch(`${LIVEBLOCKS_API_BASE}/rooms`, {
      body: JSON.stringify({ defaultAccesses: [], id: roomId }),
      headers: this.headers(),
      method: "POST",
    });

    if (created.ok) return;
    if (created.status === 409) return;

    const text = await created.text();
    throw new Error(`Liveblocks room create failed (${created.status}): ${text}`);
  }

  async authorizeUser({
    roomId,
    userId,
    userInfo,
  }: AuthorizeUserParams): Promise<AuthorizeUserResponse> {
    const response = await fetch(`${LIVEBLOCKS_API_BASE}/authorize-user`, {
      body: JSON.stringify({
        permissions: { [roomId]: ["room:write"] },
        userId,
        userInfo,
      }),
      headers: this.headers(),
      method: "POST",
    });

    if (!response.ok) {
      const text = await response.text();
      throw new Error(
        `Liveblocks authorize-user failed (${response.status}): ${text}`
      );
    }

    return (await response.json()) as AuthorizeUserResponse;
  }
}

let cachedClient: LiveblocksServerClient | null = null;

const getLiveblocksServerClient = (): LiveblocksServerClient => {
  if (cachedClient) return cachedClient;

  const secretKey = process.env.LIVEBLOCKS_SECRET_KEY;
  if (!secretKey) {
    throw new Error("LIVEBLOCKS_SECRET_KEY is not configured");
  }

  cachedClient = new LiveblocksServerClient(secretKey);
  return cachedClient;
};

export { getLiveblocksServerClient, LiveblocksServerClient };

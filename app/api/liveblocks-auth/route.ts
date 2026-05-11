import { auth, currentUser } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

import { getCursorColorForUser } from "@/lib/liveblocks/colors";
import { getLiveblocksServerClient } from "@/lib/liveblocks/server";
import { checkProjectAccess, getCurrentClerkIdentity } from "@/lib/project-access";

const getDisplayName = (
  user: Awaited<ReturnType<typeof currentUser>>
): string => {
  if (!user) return "Anonymous";
  if (user.fullName && user.fullName.trim()) return user.fullName;
  if (user.firstName && user.firstName.trim()) return user.firstName;
  if (user.username && user.username.trim()) return user.username;
  const email =
    user.primaryEmailAddress?.emailAddress ??
    user.emailAddresses.at(0)?.emailAddress ??
    null;
  return email ?? "Anonymous";
};

export async function POST(request: Request): Promise<NextResponse> {
  const { userId } = await auth();
  if (!userId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = (await request.json().catch(() => null)) as
    | { room?: unknown }
    | null;
  const roomId = typeof body?.room === "string" ? body.room : null;
  if (!roomId) {
    return NextResponse.json({ error: "Missing room" }, { status: 400 });
  }

  const identity = await getCurrentClerkIdentity();
  const { access } = await checkProjectAccess({ ...identity, roomId });
  if (!access) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const user = await currentUser();
  const userInfo = {
    avatar: user?.imageUrl ?? "",
    color: getCursorColorForUser(userId),
    name: getDisplayName(user),
  };

  const liveblocks = getLiveblocksServerClient();
  await liveblocks.ensureRoom(roomId);
  const session = await liveblocks.authorizeUser({
    roomId,
    userId,
    userInfo,
  });

  return NextResponse.json(session);
}

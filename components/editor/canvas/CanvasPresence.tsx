"use client";

import { UserButton, useAuth } from "@clerk/nextjs";
import { shallow, useOthersMapped } from "@liveblocks/react/suspense";

import { cn } from "@/lib/utils";

const MAX_VISIBLE_COLLABORATORS = 5;

interface CollaboratorInfo {
  avatar: string;
  color: string;
  name: string;
  userId: string;
}

const getInitials = (name: string): string => {
  const parts = name
    .trim()
    .split(/\s+/)
    .filter(Boolean);

  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0]?.slice(0, 2).toUpperCase() ?? "?";

  return `${parts[0]?.[0] ?? ""}${parts[1]?.[0] ?? ""}`.toUpperCase();
};

const CanvasPresence = () => {
  const { userId } = useAuth();
  const others = useOthersMapped(
    (other): CollaboratorInfo => ({
      avatar: other.info.avatar,
      color: other.info.color,
      name: other.info.name,
      userId: other.id,
    }),
    shallow,
  );
  const collaborators = others
    .map(([, collaborator]) => collaborator)
    .filter((collaborator) => collaborator.userId !== userId);
  const visibleCollaborators = collaborators.slice(0, MAX_VISIBLE_COLLABORATORS);
  const overflowCount = collaborators.length - visibleCollaborators.length;
  const hasCollaborators = collaborators.length > 0;

  return (
    <div className="pointer-events-auto absolute right-4 top-4 z-20 flex h-10 items-center rounded-2xl border border-surface-border bg-bg-surface/90 px-2 shadow-lg shadow-bg-base/40 backdrop-blur">
      {hasCollaborators && (
        <>
          <div className="flex items-center pl-1">
            {visibleCollaborators.map((collaborator, index) => (
              <div
                aria-label={collaborator.name}
                className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border-2 border-bg-base bg-bg-subtle text-xs font-semibold text-copy-primary shadow-sm",
                  index > 0 && "-ml-2",
                )}
                key={collaborator.userId}
                style={{ boxShadow: `0 0 0 1px ${collaborator.color}` }}
                title={collaborator.name}
              >
                {collaborator.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    alt=""
                    className="h-full w-full object-cover"
                    src={collaborator.avatar}
                  />
                ) : (
                  <span>{getInitials(collaborator.name)}</span>
                )}
              </div>
            ))}
            {overflowCount > 0 && (
              <div className="-ml-2 flex h-8 min-w-8 items-center justify-center rounded-full border-2 border-bg-base bg-bg-elevated px-2 text-xs font-semibold text-copy-secondary shadow-sm">
                +{overflowCount}
              </div>
            )}
          </div>
          <div className="mx-2 h-6 w-px bg-surface-border" />
        </>
      )}

      <div className="flex h-8 w-8 items-center justify-center">
        <UserButton
          appearance={{
            elements: {
              userButtonAvatarBox: "h-8 w-8",
              userButtonTrigger: "h-8 w-8",
            },
          }}
          userProfileMode="modal"
        />
      </div>
    </div>
  );
};

export { CanvasPresence };

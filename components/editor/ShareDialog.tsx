"use client";

import { Copy, Trash2, UserRound } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface Collaborator {
  avatarUrl: string | null;
  createdAt: string;
  displayName: string | null;
  email: string;
}

interface ShareDialogProps {
  canManage: boolean;
  onOpenChange: (isOpen: boolean) => void;
  open: boolean;
  projectName: string;
  roomId: string;
}

const ShareDialog = ({
  canManage,
  onOpenChange,
  open,
  projectName,
  roomId,
}: ShareDialogProps) => {
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const projectPath = `/editor/${roomId}`;

  useEffect(() => {
    if (!open) return;

    let isMounted = true;

    const loadCollaborators = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await fetch(`/api/projects/${roomId}/collaborators`);

        if (!response.ok) throw new Error("Unable to load collaborators.");

        const payload = (await response.json()) as {
          collaborators: Collaborator[];
        };

        if (isMounted) setCollaborators(payload.collaborators);
      } catch (loadError) {
        if (isMounted) {
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Unable to load collaborators.",
          );
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };

    loadCollaborators();

    return () => {
      isMounted = false;
    };
  }, [open, roomId]);

  useEffect(() => {
    if (!copied) return;

    const timeoutId = window.setTimeout(() => setCopied(false), 1600);

    return () => window.clearTimeout(timeoutId);
  }, [copied]);

  const inviteCollaborator = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedEmail = email.trim();
    if (!trimmedEmail || !canManage) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${roomId}/collaborators`, {
        body: JSON.stringify({ email: trimmedEmail }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "POST",
      });

      if (!response.ok) throw new Error("Unable to invite collaborator.");

      const payload = (await response.json()) as {
        collaborators: Collaborator[];
      };

      setCollaborators(payload.collaborators);
      setEmail("");
    } catch (inviteError) {
      setError(
        inviteError instanceof Error
          ? inviteError.message
          : "Unable to invite collaborator.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const removeCollaborator = async (collaboratorEmail: string) => {
    if (!canManage) return;

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/projects/${roomId}/collaborators`, {
        body: JSON.stringify({ email: collaboratorEmail }),
        headers: {
          "Content-Type": "application/json",
        },
        method: "DELETE",
      });

      if (!response.ok) throw new Error("Unable to remove collaborator.");

      const payload = (await response.json()) as {
        collaborators: Collaborator[];
      };

      setCollaborators(payload.collaborators);
    } catch (removeError) {
      setError(
        removeError instanceof Error
          ? removeError.message
          : "Unable to remove collaborator.",
      );
    } finally {
      setIsLoading(false);
    }
  };

  const copyProjectLink = async () => {
    await navigator.clipboard.writeText(`${window.location.origin}${projectPath}`);
    setCopied(true);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="rounded-3xl border border-surface-border bg-bg-elevated sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Share Project</DialogTitle>
          <DialogDescription>
            Manage access for {projectName}.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5">
          {canManage && (
            <div className="rounded-2xl border border-surface-border bg-bg-subtle/70 p-3">
              <p className="text-xs font-medium uppercase tracking-normal text-copy-muted">
                Project link
              </p>
              <div className="mt-2 flex gap-2">
                <Input
                  className="h-10 rounded-xl border-surface-border bg-bg-base font-mono text-xs"
                  readOnly
                  value={projectPath}
                />
                <Button
                  className="rounded-xl"
                  onClick={copyProjectLink}
                  type="button"
                  variant="outline"
                >
                  <Copy className="h-4 w-4" />
                  {copied ? "Copied!" : "Copy"}
                </Button>
              </div>
            </div>
          )}

          {canManage && (
            <form className="space-y-3" onSubmit={inviteCollaborator}>
              <label className="block text-sm font-medium text-copy-primary">
                Invite collaborator
                <div className="mt-2 flex gap-2">
                  <Input
                    className="h-10 rounded-xl border-surface-border bg-bg-subtle/70"
                    onChange={(event) => setEmail(event.target.value)}
                    placeholder="teammate@example.com"
                    type="email"
                    value={email}
                  />
                  <Button
                    className="rounded-xl"
                    disabled={!email.trim() || isLoading}
                  >
                    Invite
                  </Button>
                </div>
              </label>
            </form>
          )}

          {!canManage && (
            <div className="rounded-2xl border border-surface-border bg-bg-subtle/60 px-3 py-2 text-sm text-copy-muted">
              Collaborator access is read-only for sharing settings.
            </div>
          )}

          <section>
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-copy-primary">
                Collaborators
              </h3>
              {isLoading && (
                <span className="text-xs text-copy-muted">Loading...</span>
              )}
            </div>

            {error && (
              <p className="mt-2 rounded-xl border border-state-error/50 bg-bg-subtle px-3 py-2 text-sm text-state-error">
                {error}
              </p>
            )}

            <div className="mt-3 space-y-2">
              {collaborators.length > 0 ? (
                collaborators.map((collaborator) => (
                  <div
                    className="flex min-h-14 items-center justify-between gap-3 rounded-xl border border-surface-border bg-bg-subtle/70 px-3 py-2"
                    key={collaborator.email}
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-full border border-surface-border bg-bg-base text-copy-muted">
                        {collaborator.avatarUrl ? (
                          <span
                            aria-hidden
                            className="h-full w-full bg-cover bg-center"
                            style={{
                              backgroundImage: `url(${collaborator.avatarUrl})`,
                            }}
                          />
                        ) : (
                          <UserRound className="h-4 w-4" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate text-sm font-medium text-copy-primary">
                          {collaborator.displayName ?? collaborator.email}
                        </p>
                        {collaborator.displayName && (
                          <p className="truncate text-xs text-copy-muted">
                            {collaborator.email}
                          </p>
                        )}
                      </div>
                    </div>

                    {canManage && (
                      <Button
                        aria-label={`Remove ${collaborator.email}`}
                        disabled={isLoading}
                        onClick={() => removeCollaborator(collaborator.email)}
                        size="icon-sm"
                        type="button"
                        variant="ghost"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))
              ) : (
                <p className="rounded-xl border border-dashed border-surface-border bg-bg-subtle/40 px-3 py-4 text-center text-sm text-copy-muted">
                  No collaborators yet.
                </p>
              )}
            </div>
          </section>
        </div>

        <DialogFooter className="mt-2 rounded-b-3xl border-surface-border bg-bg-subtle/60">
          <DialogClose render={<Button type="button" variant="outline" />}>
            Close
          </DialogClose>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export { ShareDialog };

import { LockKeyhole } from "lucide-react";
import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";

const AccessDenied = () => {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-base px-6 py-12 text-copy-primary">
      <div className="flex max-w-sm flex-col items-center text-center">
        <div className="flex h-14 w-14 items-center justify-center rounded-2xl border border-surface-border bg-bg-subtle text-brand">
          <LockKeyhole className="h-7 w-7" />
        </div>
        <h1 className="mt-5 text-xl font-semibold tracking-normal">
          Project access denied
        </h1>
        <p className="mt-2 text-sm leading-6 text-copy-muted">
          This project does not exist, or your account does not have access.
        </p>
        <Link
          className={buttonVariants({ className: "mt-6 rounded-xl" })}
          href="/editor"
        >
          Back to projects
        </Link>
      </div>
    </div>
  );
};

export { AccessDenied };

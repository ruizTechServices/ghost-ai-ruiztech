interface AuthPageShellProps {
  children: React.ReactNode;
  mode: "sign-in" | "sign-up";
}

const featureItems = [
  "Clerk-secured workspace access",
  "Collaborative architecture canvas",
  "Supabase-backed project persistence",
];

const AuthPageShell = ({ children, mode }: AuthPageShellProps) => {
  const title = mode === "sign-in" ? "Sign in" : "Create your account";
  const description =
    mode === "sign-in"
      ? "Continue to your protected Ghost AI workspace."
      : "Start building collaborative system designs with a protected workspace.";

  return (
    <main className="min-h-screen bg-base text-copy-primary">
      <div className="mx-auto grid min-h-screen w-full max-w-6xl items-center px-6 py-10 lg:grid-cols-[0.9fr_1.1fr] lg:gap-12">
        <section className="hidden border-r border-surface-border pr-12 lg:block">
          <div className="mb-10">
            <p className="text-sm font-semibold tracking-normal text-brand">
              Ghost AI RuizTech
            </p>
            <h1 className="mt-4 text-3xl font-semibold tracking-normal text-copy-primary">
              {title}
            </h1>
            <p className="mt-4 max-w-sm text-sm leading-6 text-copy-muted">
              {description}
            </p>
          </div>
          <ul className="space-y-3 text-sm text-copy-secondary">
            {featureItems.map((item) => (
              <li key={item} className="flex gap-3">
                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-brand" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="flex justify-center lg:justify-end">
          {children}
        </section>
      </div>
    </main>
  );
};

export { AuthPageShell };

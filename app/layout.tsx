import { ClerkProvider, Show, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";
import { TooltipProvider } from "@/components/ui/tooltip";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ghost AI RuizTech",
  description: "Ghost AI RuizTech",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} dark h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-base text-copy-primary">
        <ClerkProvider>
          <TooltipProvider>
            <header className="flex h-16 items-center justify-end gap-4 border-b border-surface-border bg-surface px-4">
              <Show when="signed-out">
                <SignInButton />
                <SignUpButton>
                  <button className="cursor-pointer rounded-xl bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/85">
                    Sign up
                  </button>
                </SignUpButton>
              </Show>
              <Show when="signed-in">
                <UserButton />
              </Show>
            </header>
            {children}
          </TooltipProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

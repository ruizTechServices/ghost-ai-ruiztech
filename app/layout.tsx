import { ClerkProvider } from "@clerk/nextjs";
import { dark } from "@clerk/ui/themes";
import { TooltipProvider } from "@/components/ui/tooltip";
import { clerkSignInUrl } from "@/lib/auth/clerk-routes";
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
        <ClerkProvider
          afterSignOutUrl={clerkSignInUrl}
          appearance={{
            theme: dark,
            variables: {
              colorBackground: "var(--bg-surface)",
              colorBorder: "var(--border-default)",
              colorDanger: "var(--state-error)",
              colorForeground: "var(--text-primary)",
              colorInput: "var(--bg-subtle)",
              colorInputForeground: "var(--text-primary)",
              colorMuted: "var(--bg-elevated)",
              colorMutedForeground: "var(--text-muted)",
              colorPrimary: "var(--accent-primary)",
              colorPrimaryForeground: "var(--bg-base)",
              colorRing: "var(--accent-primary)",
              colorSuccess: "var(--state-success)",
              colorWarning: "var(--state-warning)",
              fontFamily: "var(--font-geist-sans)",
              fontFamilyButtons: "var(--font-geist-sans)",
            },
          }}
        >
          <TooltipProvider>
            {children}
          </TooltipProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

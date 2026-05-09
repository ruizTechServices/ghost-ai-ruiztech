import { ClerkProvider } from "@clerk/nextjs";
import { EditorLayout } from "@/components/editor/EditorLayout";
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
            <EditorLayout>{children}</EditorLayout>
          </TooltipProvider>
        </ClerkProvider>
      </body>
    </html>
  );
}

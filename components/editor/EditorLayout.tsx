"use client";

import { useState } from "react";

import { Navbar } from "@/components/editor/Navbar";
import { Sidebar } from "@/components/editor/Sidebar";

interface EditorLayoutProps {
  children: React.ReactNode;
}

const EditorLayout = ({ children }: EditorLayoutProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-base text-copy-primary">
      <Navbar
        isSidebarOpen={isSidebarOpen}
        onSidebarToggle={() => setIsSidebarOpen((current) => !current)}
      />
      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <main className="min-h-screen pt-16">{children}</main>
    </div>
  );
};

export { EditorLayout };

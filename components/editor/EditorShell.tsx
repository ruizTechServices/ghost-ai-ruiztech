"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import { Navbar } from "@/components/editor/Navbar";
import { Sidebar } from "@/components/editor/Sidebar";

interface EditorShellProps {
  children: React.ReactNode;
}

interface EditorChromeContextValue {
  setProtectedChromeEnabled: Dispatch<SetStateAction<boolean>>;
}

const EditorChromeContext = createContext<EditorChromeContextValue | null>(null);

const EditorShell = ({ children }: EditorShellProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProtectedChromeEnabled, setProtectedChromeEnabled] =
    useState(false);

  const contextValue = useMemo(
    () => ({ setProtectedChromeEnabled }),
    [setProtectedChromeEnabled]
  );

  return (
    <EditorChromeContext.Provider value={contextValue}>
      <div className="min-h-screen bg-base text-copy-primary">
        <Navbar
          isSidebarOpen={isSidebarOpen}
          onSidebarToggle={() => setIsSidebarOpen((current) => !current)}
          showSidebarToggle={isProtectedChromeEnabled}
        />
        {isProtectedChromeEnabled && (
          <Sidebar
            isOpen={isSidebarOpen}
            onClose={() => setIsSidebarOpen(false)}
          />
        )}
        <main className="min-h-screen pt-16">{children}</main>
      </div>
    </EditorChromeContext.Provider>
  );
};

const useEditorChrome = () => {
  const context = useContext(EditorChromeContext);

  if (!context) {
    throw new Error("useEditorChrome must be used within EditorShell.");
  }

  return context;
};

export { EditorShell, useEditorChrome };

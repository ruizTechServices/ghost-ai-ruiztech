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
import { ProjectDialogs } from "@/components/editor/ProjectDialogs";
import { Sidebar } from "@/components/editor/Sidebar";
import { useProjectDialogs } from "@/components/editor/useProjectDialogs";

interface EditorShellProps {
  children: React.ReactNode;
}

interface EditorChromeContextValue {
  openCreateProjectDialog: () => void;
  setProtectedChromeEnabled: Dispatch<SetStateAction<boolean>>;
}

const EditorChromeContext = createContext<EditorChromeContextValue | null>(null);

const EditorShell = ({ children }: EditorShellProps) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isProtectedChromeEnabled, setProtectedChromeEnabled] =
    useState(false);
  const projectDialogs = useProjectDialogs();

  const contextValue = useMemo(
    () => ({
      openCreateProjectDialog: projectDialogs.openCreateDialog,
      setProtectedChromeEnabled,
    }),
    [projectDialogs.openCreateDialog, setProtectedChromeEnabled]
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
          <>
            {isSidebarOpen && (
              <button
                aria-label="Close sidebar"
                className="fixed inset-0 z-20 bg-bg-base/70 backdrop-blur-sm md:hidden"
                onClick={() => setIsSidebarOpen(false)}
                type="button"
              />
            )}
            <Sidebar
              dialogs={projectDialogs}
              isOpen={isSidebarOpen}
              onClose={() => setIsSidebarOpen(false)}
            />
          </>
        )}
        <ProjectDialogs dialogs={projectDialogs} />
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

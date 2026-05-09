"use client";

import { useEffect } from "react";

import { useEditorChrome } from "@/components/editor/EditorShell";

const ProtectedEditorChrome = () => {
  const { setProtectedChromeEnabled } = useEditorChrome();

  useEffect(() => {
    setProtectedChromeEnabled(true);

    return () => {
      setProtectedChromeEnabled(false);
    };
  }, [setProtectedChromeEnabled]);

  return null;
};

export { ProtectedEditorChrome };

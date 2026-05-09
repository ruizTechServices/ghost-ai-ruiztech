import { EditorLayout } from "@/components/editor/EditorLayout";
import { ProtectedEditorChrome } from "@/components/editor/ProtectedEditorChrome";

export default function EditorPage() {
  return (
    <EditorLayout>
      <ProtectedEditorChrome />
      <div className="px-6 py-8">
        <h1 className="text-2xl font-semibold text-copy-primary">
          Editor Workspace
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-copy-muted">
          Protected editor foundation is ready. Project-backed canvas behavior
          will be added in the Supabase implementation unit.
        </p>
      </div>
    </EditorLayout>
  );
}

import { EditorLayout } from "@/components/editor/EditorLayout";
import { EditorHome } from "@/components/editor/EditorHome";
import { ProtectedEditorChrome } from "@/components/editor/ProtectedEditorChrome";

export default function EditorPage() {
  return (
    <EditorLayout>
      <ProtectedEditorChrome />
      <EditorHome />
    </EditorLayout>
  );
}

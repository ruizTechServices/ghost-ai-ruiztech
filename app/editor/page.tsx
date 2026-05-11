import { EditorLayout } from "@/components/editor/EditorLayout";
import { EditorHome } from "@/components/editor/EditorHome";
import { ProtectedEditorChrome } from "@/components/editor/ProtectedEditorChrome";
import { getEditorProjects } from "@/lib/editor/get-editor-projects";

export default async function EditorPage() {
  const { ownedProjects, sharedProjects } = await getEditorProjects();

  return (
    <EditorLayout ownedProjects={ownedProjects} sharedProjects={sharedProjects}>
      <ProtectedEditorChrome />
      <EditorHome />
    </EditorLayout>
  );
}

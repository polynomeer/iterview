import type { ResumeEditorWorkspace } from "./editorTypes";
import type { ResumeEditorController } from "./hooks/useResumeEditorController";

export type EditorControllerProps = {
  ctrl: ResumeEditorController;
};

export type EditorViewProps = EditorControllerProps & {
  workspace: ResumeEditorWorkspace;
};

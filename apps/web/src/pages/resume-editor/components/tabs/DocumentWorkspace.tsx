import { ContextRail } from "../ContextRail";
import { DraftDocumentCard } from "../DraftDocumentCard";
import { ReviewFocusCard } from "../ReviewFocusCard";
import type { EditorViewProps } from "../../editorViewProps";

export function DocumentWorkspace({ ctrl, workspace }: EditorViewProps) {
  const { currentTab, selectedBlock, selectedNode } = ctrl;

  return (
    <>
      <div className="resume-editor-workspace">
        {currentTab === "review" ? <ReviewFocusCard ctrl={ctrl} workspace={workspace} /> : null}
        <DraftDocumentCard ctrl={ctrl} />
      </div>

      {selectedBlock || selectedNode ? <ContextRail ctrl={ctrl} workspace={workspace} /> : null}
    </>
  );
}

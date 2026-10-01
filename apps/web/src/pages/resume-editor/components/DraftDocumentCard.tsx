import { Badge, Button, Card } from "../../../shared/ui/primitives";
import { FallbackBlocks } from "./FallbackBlocks";
import { SelectionInspector } from "./SelectionInspector";
import { EditTab } from "./tabs/EditTab";
import { ReviewTab } from "./tabs/ReviewTab";
import type { EditorControllerProps } from "../editorViewProps";

export function DraftDocumentCard({ ctrl }: EditorControllerProps) {
  const { t, currentTab, selectedBlock, selectedNode, richTreeEnabled, isContextPanelOpen, setIsContextPanelOpen } = ctrl;
  const selectedLabel = richTreeEnabled ? selectedNode?.nodeTypeLabel : selectedBlock?.blockTypeLabel;

  return (
    <Card aria-label={t("resumeEditor.draftDocument")} className="resume-editor-document" padded>
      <div className="editor-head">
        <div className="editor-chips">
          <Badge tone="accent">{currentTab === "review" ? t("resumeEditor.reviewMode") : t("resumeEditor.rowEditor")}</Badge>
          {selectedLabel ? <Badge>{`${t("resumeEditor.selected")} · ${selectedLabel}`}</Badge> : null}
        </div>
        {selectedBlock || selectedNode ? (
          <Button aria-expanded={isContextPanelOpen} onClick={() => setIsContextPanelOpen((current) => !current)} size="sm">
            {isContextPanelOpen ? t("resumeEditor.hideTools") : t("resumeEditor.openTools")}
          </Button>
        ) : null}
      </div>
      <div className="resume-editor-surface">
        {currentTab !== "review" ? <EditTab ctrl={ctrl} /> : <ReviewTab ctrl={ctrl} />}
      </div>
      {selectedBlock || selectedNode ? <SelectionInspector ctrl={ctrl} /> : null}
      <FallbackBlocks ctrl={ctrl} />
    </Card>
  );
}

import { Button } from "../../../../shared/ui/primitives";
import { getSelectableLineRange, scrollToEditorHeading } from "../../editorUtils";
import { createLineMenuRenderers } from "../LineMenu";
import { renderMarkdownDocumentPreview } from "../markdownPreview";
import type { EditorControllerProps } from "../../editorViewProps";

export function ReviewTab({ ctrl }: EditorControllerProps) {
  const {
    t,
    currentTab,
    markdownSource,
    selectedNodeId,
    setSelectedNodeId,
    setSelectedMarkdownRange,
    richTreeEnabled,
    documentTableOfContents,
    effectiveSelectedText,
    setActiveSidePanel,
    setIsContextPanelOpen,
    setIsSecondaryToolsOpen,
    focusedReviewLineIndex,
    setFocusedReviewLineIndex,
    previewReviewSignals,
    activePreviewLineIndex,
    setCurrentCursorLineIndex,
    openPreviewLineMenu,
    handlePreviewLineAction,
  } = ctrl;
  const { renderLineMenu, renderFloatingLineMenu } = createLineMenuRenderers(ctrl);

  return (
    <article className="resume-editor-document-preview">
      {richTreeEnabled && documentTableOfContents.length > 0 ? (
        <div className="resume-editor-document-preview__toc">
          {documentTableOfContents.map((item) => (
            <Button
              aria-pressed={item.nodeId === selectedNodeId}
              key={item.id}
              onClick={() => {
                setSelectedNodeId(item.nodeId);
                setActiveSidePanel("comments");
                setIsContextPanelOpen(true);
                scrollToEditorHeading(item.nodeId);
              }}
              size="sm"
              variant={item.nodeId === selectedNodeId ? "primary" : "ghost"}
            >
              {item.title}
            </Button>
          ))}
        </div>
      ) : null}
      <div className="resume-editor-document-preview__body">
        {renderMarkdownDocumentPreview(markdownSource, {
          t,
          selectedText: effectiveSelectedText,
          tableOfContents: documentTableOfContents,
          activeLineMenuIndex: activePreviewLineIndex,
          focusedLineIndex: currentTab === "review" ? focusedReviewLineIndex : null,
          reviewSignals: currentTab === "review" ? previewReviewSignals : undefined,
          onReviewSignalClick:
            currentTab === "review"
              ? (signalType, lineIndex) => {
                  const selectableRange = getSelectableLineRange(markdownSource, lineIndex);
                  const lineText = selectableRange.selectedText || selectableRange.text || null;
                  setSelectedMarkdownRange(
                    lineText
                      ? {
                          startOffset: selectableRange.startOffset,
                          endOffset: selectableRange.endOffset,
                          text: lineText,
                        }
                      : null,
                  );
                  setCurrentCursorLineIndex(lineIndex);
                  setFocusedReviewLineIndex(lineIndex);
                  setActiveSidePanel(signalType);
                  setIsContextPanelOpen(true);
                  setIsSecondaryToolsOpen(false);
                }
              : undefined,
          onAddLine: undefined,
          onToggleLineMenu: (lineIndex, target) => {
            openPreviewLineMenu(lineIndex, target);
            if (currentTab === "review") {
              setFocusedReviewLineIndex(lineIndex);
            }
          },
          onLineAction: handlePreviewLineAction,
          renderLineMenu,
          onHeadingClick: (nodeId) => {
            setSelectedNodeId(nodeId);
            setActiveSidePanel("comments");
            setIsContextPanelOpen(true);
          },
        })}
        {renderFloatingLineMenu()}
      </div>
    </article>
  );
}

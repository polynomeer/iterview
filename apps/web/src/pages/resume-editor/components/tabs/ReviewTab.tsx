import { getSelectableLineRange, scrollToEditorHeading } from "../../editorUtils";
import { createLineMenuRenderers } from "../LineMenu";
import { renderMarkdownDocumentPreview } from "../markdownPreview";
import type { EditorControllerProps } from "../../editorViewProps";

export function ReviewTab({ ctrl }: EditorControllerProps) {
  const {
    isKorean,
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
    <article className="page-card page-card--muted resume-editor-document-preview">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{isKorean ? "문서 프리뷰" : "Document preview"}</p>
          <h3 className="page-card__title">{isKorean ? "읽기 화면" : "Reading surface"}</h3>
        </div>
        <span className="detail-chip">
          {richTreeEnabled
            ? isKorean
              ? "리치 트리 연결"
              : "Rich-tree aware"
            : isKorean
              ? "마크다운 프리뷰"
              : "Markdown preview"}
        </span>
      </div>
      {richTreeEnabled && documentTableOfContents.length > 0 ? (
        <div className="resume-editor-document-preview__toc">
          {documentTableOfContents.map((item) => (
            <button
              className={`detail-chip detail-chip--interactive ${
                item.nodeId === selectedNodeId ? "detail-chip--active" : ""
              }`}
              key={item.id}
              onClick={() => {
                setSelectedNodeId(item.nodeId);
                setActiveSidePanel("comments");
                setIsContextPanelOpen(true);
                scrollToEditorHeading(item.nodeId);
              }}
              type="button"
            >
              {item.title}
            </button>
          ))}
        </div>
      ) : null}
      <div className="resume-editor-document-preview__body">
        {renderMarkdownDocumentPreview(markdownSource, {
          isKorean,
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

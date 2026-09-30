import { findFirstReviewSignalLine } from "../editorUtils";
import { ContextPanelContent } from "./context-panels/ContextPanelContent";
import type { EditorViewProps } from "../editorViewProps";

export function ContextRail({ ctrl, workspace }: EditorViewProps) {
  const {
    isKorean,
    currentTab,
    primarySidePanels,
    secondarySidePanels,
    isSecondaryPanelActive,
    selectedBlock,
    selectedNode,
    richTreeEnabled,
    activeSidePanel,
    setActiveSidePanel,
    isContextPanelOpen,
    setIsContextPanelOpen,
    isSecondaryToolsOpen,
    setIsSecondaryToolsOpen,
    setFocusedReviewLineIndex,
    contextualSummaryItems,
    previewReviewSignals,
  } = ctrl;

  return (
    <div
      aria-label={isKorean ? "컨텍스트 편집 도구" : "Contextual editor tools"}
      className={`resume-editor-contextual ${isContextPanelOpen ? "resume-editor-contextual--open" : ""}`}
    >
      {isContextPanelOpen ? (
        <div className="resume-editor-contextual__dock">
          {primarySidePanels.map(([panelId, label]) => (
            <button
              className={`detail-chip detail-chip--interactive ${activeSidePanel === panelId ? "detail-chip--active" : ""}`}
              key={panelId}
              onClick={() => {
                setActiveSidePanel(panelId);
                setIsContextPanelOpen(true);
                setIsSecondaryToolsOpen(false);
              }}
              type="button"
            >
              {label}
            </button>
          ))}
          <button
            className={`detail-chip detail-chip--interactive ${isSecondaryToolsOpen || isSecondaryPanelActive ? "detail-chip--active" : ""}`}
            onClick={() => setIsSecondaryToolsOpen((current) => !current)}
            type="button"
          >
            {isKorean ? "더보기" : "More"}
          </button>
          {isSecondaryToolsOpen || isSecondaryPanelActive ? (
            <div className="resume-editor-contextual__secondary">
              {secondarySidePanels.map(([panelId, label]) => (
                <button
                  className={`detail-chip detail-chip--interactive ${activeSidePanel === panelId ? "detail-chip--active" : ""}`}
                  key={panelId}
                  onClick={() => {
                    setActiveSidePanel(panelId);
                    setIsContextPanelOpen(true);
                    setIsSecondaryToolsOpen(true);
                  }}
                  type="button"
                >
                  {label}
                </button>
              ))}
            </div>
          ) : null}
          <button
            className="secondary-button"
            onClick={() => setIsContextPanelOpen(false)}
            type="button"
          >
            {isKorean ? "닫기" : "Close"}
          </button>
        </div>
      ) : currentTab !== "review" ? (
        <div className="resume-editor-contextual__summary">
          {contextualSummaryItems.map((item) => (
            <button
              className="resume-editor-contextual__summary-card"
              key={item.panelId}
              onClick={() => {
                const matchedLineIndex = findFirstReviewSignalLine(
                  previewReviewSignals,
                  item.panelId,
                );
                if (matchedLineIndex >= 0) {
                  setFocusedReviewLineIndex(matchedLineIndex);
                }
                setActiveSidePanel(item.panelId);
                setIsContextPanelOpen(true);
                setIsSecondaryToolsOpen(false);
              }}
              type="button"
            >
              <span className="resume-editor-contextual__summary-label">{item.label}</span>
              <strong className="resume-editor-contextual__summary-value">{item.value}</strong>
              <span className="resume-editor-contextual__summary-helper">{item.helper}</span>
            </button>
          ))}
          <button
            className="secondary-button"
            onClick={() => setIsContextPanelOpen(true)}
            type="button"
          >
            {isKorean ? "도구 열기" : "Open tools"}
          </button>
        </div>
      ) : null}
      {isContextPanelOpen ? (
        <div className="resume-editor-contextual__panel">
          <div className="section-heading">
            <div>
              <p className="section-heading__eyebrow">
                {richTreeEnabled
                  ? isKorean
                    ? "선택 노드"
                    : "Selected node"
                  : isKorean
                    ? "선택 블록"
                    : "Selected block"}
              </p>
              <h3 className="page-card__title">
                {richTreeEnabled
                  ? selectedNode?.metadata.heading ?? selectedNode?.fieldPath ?? selectedNode?.nodeId ?? (isKorean ? "제목 없는 노드" : "Untitled node")
                  : selectedBlock?.title || (isKorean ? "제목 없는 블록" : "Untitled block")}
              </h3>
            </div>
            <span className="detail-chip">
              {richTreeEnabled ? selectedNode?.nodeTypeLabel : selectedBlock?.blockTypeLabel}
            </span>
          </div>
          <ContextPanelContent ctrl={ctrl} workspace={workspace} />
        </div>
      ) : null}
    </div>
  );
}

import { FallbackBlocks } from "./FallbackBlocks";
import { SelectionInspector } from "./SelectionInspector";
import { EditTab } from "./tabs/EditTab";
import { ReviewTab } from "./tabs/ReviewTab";
import type { EditorControllerProps } from "../editorViewProps";

export function DraftDocumentCard({ ctrl }: EditorControllerProps) {
  const {
    isKorean,
    currentTab,
    selectedBlock,
    selectedNode,
    richTreeEnabled,
    isContextPanelOpen,
    setIsContextPanelOpen,
  } = ctrl;

  return (
    <section className="page-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{isKorean ? "초안 문서" : "Draft document"}</p>
          <h2 className="page-card__title">
            {currentTab === "review"
              ? isKorean
                ? "리뷰 읽기 화면"
                : "Review reading surface"
              : richTreeEnabled
                ? isKorean
                  ? "리치 트리 앵커가 연결된 단일 편집 화면"
                  : "Single-surface editor with rich-tree anchors"
                : isKorean
                  ? "단일 편집 화면"
                  : "Single-surface editor"}
          </h2>
        </div>
        <div className="resume-status-badges">
          <span className="detail-chip">
            {currentTab === "review" ? (isKorean ? "리뷰 모드" : "Review mode") : isKorean ? "행 편집기" : "Row editor"}
          </span>
          {selectedBlock || selectedNode ? (
            <>
              <span className="question-status-badge question-status-badge--neutral">
                {isKorean ? "선택됨" : "Selected"} {richTreeEnabled ? selectedNode?.nodeTypeLabel : selectedBlock?.blockType}
              </span>
              <button
                className="secondary-button"
                onClick={() => setIsContextPanelOpen((current) => !current)}
                type="button"
              >
                {isContextPanelOpen
                  ? isKorean
                    ? "도구 숨기기"
                    : "Hide tools"
                  : isKorean
                    ? "도구 열기"
                    : "Open tools"}
              </button>
            </>
          ) : null}
        </div>
      </div>
      <div className="resume-editor-surface">
        {currentTab !== "review" ? <EditTab ctrl={ctrl} /> : null}
        {currentTab === "review" ? <ReviewTab ctrl={ctrl} /> : null}
      </div>
      {selectedBlock || selectedNode ? <SelectionInspector ctrl={ctrl} /> : null}
      <FallbackBlocks ctrl={ctrl} />
    </section>
  );
}

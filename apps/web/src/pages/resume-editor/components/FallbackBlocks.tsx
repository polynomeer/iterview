import type { EditorControllerProps } from "../editorViewProps";

export function FallbackBlocks({ ctrl }: EditorControllerProps) {
  const {
    isKorean,
    blocks,
    selectedBlockId,
    setSelectedBlockId,
    setSelectedNodeId,
    selectedBlock,
    richNodes,
    richTreeEnabled,
    setActiveSidePanel,
    setIsContextPanelOpen,
    isFallbackBlocksOpen,
    setIsFallbackBlocksOpen,
  } = ctrl;

  return (
    <>
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">
            {richTreeEnabled
              ? isKorean
                ? "폴백 블록과 노드 앵커"
                : "Fallback blocks and node anchors"
              : isKorean
                ? "파싱된 블록"
                : "Parsed blocks"}
          </p>
          <h3 className="page-card__title">
            {richTreeEnabled
              ? isKorean
                ? "정밀한 블록 핸들이 필요할 때만 폴백 앵커를 펼치세요"
                : "Keep fallback anchors tucked away unless you need a precise block handle"
              : isKorean
                ? "섹션을 클릭해 컨텍스트 도구를 여세요"
                : "Click a section to open contextual tools"}
          </h3>
        </div>
        <div className="page-card__actions">
          <span className="detail-chip">{isKorean ? `블록 ${blocks.length}개` : `${blocks.length} blocks`}</span>
          <button
            className="secondary-button"
            onClick={() => setIsFallbackBlocksOpen((current) => !current)}
            type="button"
          >
            {isFallbackBlocksOpen
              ? isKorean
                ? "폴백 앵커 숨기기"
                : "Hide fallback anchors"
              : isKorean
                ? "폴백 앵커 표시"
                : "Show fallback anchors"}
          </button>
        </div>
      </div>
      {!isFallbackBlocksOpen && selectedBlock ? (
        <article className="page-card page-card--muted resume-editor-block resume-editor-block--selected">
          <div className="section-heading">
            <div>
              <p className="section-heading__eyebrow">{isKorean ? "현재 폴백 앵커" : "Current fallback anchor"}</p>
              <h3 className="page-card__title">{selectedBlock.title || (isKorean ? "제목 없는 블록" : "Untitled block")}</h3>
            </div>
            <button
              className="secondary-button"
              onClick={() => {
                setActiveSidePanel("comments");
                setIsContextPanelOpen(true);
              }}
              type="button"
            >
              {isKorean ? "도구 열기" : "Open tools"}
            </button>
          </div>
          <p className="page-card__body resume-section__body--preserve">
            {selectedBlock.text || (isKorean ? "본문이 아직 없습니다." : "No body text yet.")}
          </p>
        </article>
      ) : null}
      {isFallbackBlocksOpen ? (
        <div className="resume-editor-block-grid resume-editor-outline-list">
          {blocks.map((block) => (
            <article
              className={`page-card page-card--muted resume-editor-block resume-editor-block--compact ${selectedBlockId === block.blockId ? "resume-editor-block--selected" : ""}`}
              key={block.blockId}
            >
              <div className="section-heading">
                <div>
                  <p className="section-heading__eyebrow">{block.blockTypeLabel}</p>
                  <h3 className="page-card__title">{block.title || (isKorean ? "제목 없는 블록" : "Untitled block")}</h3>
                </div>
                <button
                  className="secondary-button"
                  onClick={() => {
                    setSelectedBlockId(block.blockId);
                    if (richTreeEnabled) {
                      const matchedNode = richNodes.find((node) => node.fieldPath === block.fieldPath);
                      setSelectedNodeId(matchedNode?.nodeId ?? null);
                    }
                    setActiveSidePanel("comments");
                    setIsContextPanelOpen(true);
                  }}
                  type="button"
                >
                  {selectedBlockId === block.blockId
                    ? isKorean
                      ? "도구 열기"
                      : "Open tools"
                    : isKorean
                      ? "블록 선택"
                      : "Select block"}
                </button>
              </div>
              <p className="page-card__body resume-section__body--preserve">
                {block.text || (isKorean ? "본문이 아직 없습니다." : "No body text yet.")}
              </p>
              <div className="filter-chip-row">
                {block.sourceAnchorTypeLabel ? (
                  <span className="detail-chip">{block.sourceAnchorTypeLabel}</span>
                ) : null}
                {block.fieldPath ? <span className="detail-chip">{block.fieldPath}</span> : null}
                <span className="detail-chip">{isKorean ? "순서" : "Order"} {block.displayOrder}</span>
              </div>
              {block.inlineMarks.length > 0 ? (
                <div className="filter-chip-row">
                  {block.inlineMarks.map((mark, index) => (
                    <span className="detail-chip" key={`${block.blockId}-mark-${index}`}>
                      {mark.markTypeLabel}: {mark.text}
                    </span>
                  ))}
                </div>
              ) : null}
            </article>
          ))}
        </div>
      ) : null}
    </>
  );
}

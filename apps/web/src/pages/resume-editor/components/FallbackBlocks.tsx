import type { EditorControllerProps } from "../editorViewProps";

export function FallbackBlocks({ ctrl }: EditorControllerProps) {
  const {
    t,
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
              ? t("resumeEditor.fallbackBlocksAndNodeAnchors")
              : t("resumeEditor.parsedBlocks")}
          </p>
          <h3 className="page-card__title">
            {richTreeEnabled
              ? t("resumeEditor.fallbackAnchorsHint")
              : t("resumeEditor.clickSectionToOpenContextualTools")}
          </h3>
        </div>
        <div className="page-card__actions">
          <span className="detail-chip">{t("resumeEditor.blockCount", { count: blocks.length })}</span>
          <button
            className="secondary-button"
            onClick={() => setIsFallbackBlocksOpen((current) => !current)}
            type="button"
          >
            {isFallbackBlocksOpen
              ? t("resumeEditor.hideFallbackAnchors")
              : t("resumeEditor.showFallbackAnchors")}
          </button>
        </div>
      </div>
      {!isFallbackBlocksOpen && selectedBlock ? (
        <article className="page-card page-card--muted resume-editor-block resume-editor-block--selected">
          <div className="section-heading">
            <div>
              <p className="section-heading__eyebrow">{t("resumeEditor.currentFallbackAnchor")}</p>
              <h3 className="page-card__title">{selectedBlock.title || (t("resumeEditor.untitledBlock"))}</h3>
            </div>
            <button
              className="secondary-button"
              onClick={() => {
                setActiveSidePanel("comments");
                setIsContextPanelOpen(true);
              }}
              type="button"
            >
              {t("resumeEditor.openTools")}
            </button>
          </div>
          <p className="page-card__body resume-section__body--preserve">
            {selectedBlock.text || (t("resumeEditor.noBodyTextYet"))}
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
                  <h3 className="page-card__title">{block.title || (t("resumeEditor.untitledBlock"))}</h3>
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
                    ? t("resumeEditor.openTools")
                    : t("resumeEditor.selectBlock")}
                </button>
              </div>
              <p className="page-card__body resume-section__body--preserve">
                {block.text || (t("resumeEditor.noBodyTextYet"))}
              </p>
              <div className="filter-chip-row">
                {block.sourceAnchorTypeLabel ? (
                  <span className="detail-chip">{block.sourceAnchorTypeLabel}</span>
                ) : null}
                {block.fieldPath ? <span className="detail-chip">{block.fieldPath}</span> : null}
                <span className="detail-chip">{t("resumeEditor.order")} {block.displayOrder}</span>
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

import { Badge, Button } from "../../../shared/ui/primitives";
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
      <div className="editor-head">
        <h3 className="editor-heading">{t("resumeEditor.blocks")}</h3>
        <div className="editor-actions">
          <Badge>{t("resumeEditor.blockCount", { count: blocks.length })}</Badge>
          <Button
            aria-expanded={isFallbackBlocksOpen}
            onClick={() => setIsFallbackBlocksOpen((current) => !current)}
            size="sm"
          >
            {isFallbackBlocksOpen
              ? t("resumeEditor.hideFallbackAnchors")
              : t("resumeEditor.showFallbackAnchors")}
          </Button>
        </div>
      </div>
      {!isFallbackBlocksOpen && selectedBlock ? (
        <article className="editor-item editor-item--selected resume-editor-block resume-editor-block--selected">
          <div className="editor-head">
            <h4 className="editor-heading">{selectedBlock.title || t("resumeEditor.untitledBlock")}</h4>
            <Button
              onClick={() => {
                setActiveSidePanel("comments");
                setIsContextPanelOpen(true);
              }}
              size="sm"
            >
              {t("resumeEditor.openTools")}
            </Button>
          </div>
          <p className="editor-text editor-preserve">
            {selectedBlock.text || t("resumeEditor.noBodyTextYet")}
          </p>
        </article>
      ) : null}
      {isFallbackBlocksOpen ? (
        <div className="resume-editor-block-grid resume-editor-outline-list">
          {blocks.map((block) => {
            const isSelected = selectedBlockId === block.blockId;
            return (
              <article
                className={`editor-item resume-editor-block resume-editor-block--compact ${isSelected ? "editor-item--selected resume-editor-block--selected" : ""}`}
                key={block.blockId}
              >
                <div className="editor-head">
                  <div>
                    <p className="editor-label">{block.blockTypeLabel}</p>
                    <h4 className="editor-heading">{block.title || t("resumeEditor.untitledBlock")}</h4>
                  </div>
                  <Button
                    onClick={() => {
                      setSelectedBlockId(block.blockId);
                      if (richTreeEnabled) {
                        const matchedNode = richNodes.find((node) => node.fieldPath === block.fieldPath);
                        setSelectedNodeId(matchedNode?.nodeId ?? null);
                      }
                      setActiveSidePanel("comments");
                      setIsContextPanelOpen(true);
                    }}
                    size="sm"
                    variant={isSelected ? "primary" : "secondary"}
                  >
                    {isSelected
                      ? t("resumeEditor.openTools")
                      : t("resumeEditor.selectBlock")}
                  </Button>
                </div>
                <p className="editor-text editor-preserve">
                  {block.text || t("resumeEditor.noBodyTextYet")}
                </p>
                {block.sourceAnchorTypeLabel || block.inlineMarks.length > 0 ? (
                  <div className="editor-chips">
                    {block.sourceAnchorTypeLabel ? <Badge>{block.sourceAnchorTypeLabel}</Badge> : null}
                    {block.inlineMarks.map((mark, index) => (
                      <Badge key={`${block.blockId}-mark-${index}`} tone="accent">
                        {mark.markTypeLabel}: {mark.text}
                      </Badge>
                    ))}
                  </div>
                ) : null}
              </article>
            );
          })}
        </div>
      ) : null}
    </>
  );
}

import { InlineComposers } from "../InlineComposers";
import { InlineSuggestionPreviews } from "../InlineSuggestionPreviews";
import { createLineMenuRenderers } from "../LineMenu";
import { renderMarkdownDocumentPreview } from "../markdownPreview";
import { SelectionToolbar } from "../SelectionToolbar";
import type { EditorControllerProps } from "../../editorViewProps";

export function EditTab({ ctrl }: EditorControllerProps) {
  const {
    t,
    markdownSource,
    setSelectedNodeId,
    selectedMarkdownRange,
    documentTableOfContents,
    effectiveSelectedText,
    setActiveSidePanel,
    setIsContextPanelOpen,
    inlineComposerMode,
    slashCommand,
    activePreviewLineIndex,
    setCurrentCursorLineIndex,
    documentEditorLineRefs,
    editorSurfaceBodyRef,
    editorToolbarPosition,
    openPreviewLineMenu,
    syncAnchorsForLineText,
    handleEditableLineInput,
    handleEditableLineSelection,
    insertMarkdownLineAfter,
    handleEditableLineKeyDown,
    handleEditorSurfaceMouseDown,
    handlePreviewLineAction,
    slashMenuItems,
  } = ctrl;
  const { renderLineMenu, renderFloatingLineMenu } = createLineMenuRenderers(ctrl);

  return (
    <div className="resume-editor-write-surface">
      <InlineSuggestionPreviews ctrl={ctrl} />
      {slashCommand ? (
        <article className="resume-editor-slash-menu">
          <div className="section-heading">
            <div>
              <p className="section-heading__eyebrow">{t("resumeEditor.slashMenu")}</p>
              <h3 className="page-card__title">{t("resumeEditor.quickBlockAndActionCommands")}</h3>
            </div>
            <span className="detail-chip">/{slashCommand.query || (t("resumeEditor.slashQueryPlaceholder"))}</span>
          </div>
          <div className="resume-editor-slash-menu__list">
            {slashMenuItems.map((item) => (
              <button
                className="secondary-button resume-editor-slash-menu__item"
                key={item.id}
                onClick={item.onSelect}
                type="button"
              >
                {item.label}
              </button>
            ))}
          </div>
        </article>
      ) : null}
      <article className="page-card page-card--muted resume-editor-document-preview resume-editor-document-preview--editable">
        <div className="section-heading">
          <div>
            <p className="section-heading__eyebrow">{t("resumeEditor.editorSurface")}</p>
            <h3 className="page-card__title">{t("resumeEditor.editEachRowDirectly")}</h3>
          </div>
          <span className="detail-chip">
            {selectedMarkdownRange?.text
              ? t("resumeEditor.selectionTools")
              : t("resumeEditor.selectTextOrUseRowHandles")}
          </span>
        </div>
        <div
          className="resume-editor-document-preview__body"
          onMouseDown={handleEditorSurfaceMouseDown}
          ref={editorSurfaceBodyRef}
        >
          {selectedMarkdownRange?.text && editorToolbarPosition && !inlineComposerMode ? (
            <SelectionToolbar ctrl={ctrl} />
          ) : null}
          {renderMarkdownDocumentPreview(markdownSource, {
            t,
            editable: true,
            selectedText: effectiveSelectedText,
            tableOfContents: documentTableOfContents,
            activeLineMenuIndex: activePreviewLineIndex,
            lineRef: (lineIndex, element) => {
              documentEditorLineRefs.current[lineIndex] = element;
            },
            onEditableLineInput: handleEditableLineInput,
            onEditableLineSelection: (lineIndex, element) => {
              const lineText = markdownSource.split("\n")[lineIndex] ?? "";
              handleEditableLineSelection(lineIndex, lineText, element);
            },
            onEditableLineFocus: (lineIndex, lineText) => {
              setCurrentCursorLineIndex(lineIndex);
              syncAnchorsForLineText(lineText);
            },
            onEditableLineKeyDown: handleEditableLineKeyDown,
            onAddLine: (lineIndex) => {
              insertMarkdownLineAfter(lineIndex);
            },
            onToggleLineMenu: (lineIndex, target) => openPreviewLineMenu(lineIndex, target),
            onLineAction: handlePreviewLineAction,
            renderLineMenu,
            onHeadingClick: (nodeId) => {
              setSelectedNodeId(nodeId);
              setActiveSidePanel("comments");
              setIsContextPanelOpen(true);
            },
          })}
          {renderFloatingLineMenu()}
          <InlineComposers ctrl={ctrl} />
        </div>
      </article>
    </div>
  );
}

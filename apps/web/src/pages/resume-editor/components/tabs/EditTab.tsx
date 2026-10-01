import { InlineComposers } from "../InlineComposers";
import { InlineSuggestionPreviews } from "../InlineSuggestionPreviews";
import { createLineMenuRenderers } from "../LineMenu";
import { renderMarkdownDocumentPreview } from "../markdownPreview";
import { Badge } from "../../../../shared/ui/primitives";
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
        <div aria-label={t("resumeEditor.slashMenu")} className="resume-editor-slash-menu" role="group">
          <Badge>/{slashCommand.query || t("resumeEditor.slashQueryPlaceholder")}</Badge>
          <div className="resume-editor-slash-menu__list">
            {slashMenuItems.map((item) => (
              <button className="editor-menu__item resume-editor-slash-menu__item" key={item.id} onClick={item.onSelect} type="button">
                {item.label}
              </button>
            ))}
          </div>
        </div>
      ) : null}
      <div className="resume-editor-document-preview resume-editor-document-preview--editable">
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
      </div>
    </div>
  );
}

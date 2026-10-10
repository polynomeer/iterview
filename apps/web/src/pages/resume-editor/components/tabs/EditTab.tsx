import { useState, type KeyboardEvent } from "react";
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
    setSlashCommand,
    currentCursorLineIndex,
  } = ctrl;
  const [slashChoice, setSlashChoice] = useState({ query: "", index: 0 });
  // The highlighted option resets whenever the typed command changes.
  const slashQuery = slashCommand?.query ?? "";
  const slashIndex = slashChoice.query === slashQuery ? Math.min(slashChoice.index, Math.max(0, slashMenuItems.length - 1)) : 0;
  const slashListId = "resume-editor-slash-menu";
  const slashOptionId = (index: number) => `${slashListId}-option-${index}`;

  // While a slash command is open, the line keeps focus: arrows move the highlighted option,
  // Enter applies it and Escape dismisses the menu.
  function handleLineKeyDown(lineIndex: number, event: KeyboardEvent<HTMLDivElement>) {
    if (slashCommand && slashMenuItems.length > 0) {
      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const step = event.key === "ArrowDown" ? 1 : -1;
        setSlashChoice({ query: slashQuery, index: (slashIndex + step + slashMenuItems.length) % slashMenuItems.length });
        return;
      }
      if (event.key === "Enter" && !event.shiftKey) {
        event.preventDefault();
        slashMenuItems[slashIndex]?.onSelect();
        return;
      }
    }
    if (slashCommand && event.key === "Escape") {
      event.preventDefault();
      setSlashCommand(null);
      return;
    }
    handleEditableLineKeyDown(lineIndex, event);
  }
  const { renderLineMenu, renderFloatingLineMenu } = createLineMenuRenderers(ctrl);

  return (
    <div className="resume-editor-write-surface">
      <InlineSuggestionPreviews ctrl={ctrl} />
      {slashCommand ? (
        <div className="resume-editor-slash-menu">
          <Badge>/{slashCommand.query || t("resumeEditor.slashQueryPlaceholder")}</Badge>
          <div aria-label={t("resumeEditor.slashMenu")} className="resume-editor-slash-menu__list" id={slashListId} role="listbox">
            {slashMenuItems.map((item, index) => (
              <div
                aria-selected={index === slashIndex}
                className={`editor-menu__item resume-editor-slash-menu__item${index === slashIndex ? " resume-editor-slash-menu__item--active" : ""}`}
                id={slashOptionId(index)}
                key={item.id}
                onClick={item.onSelect}
                onMouseDown={(event) => event.preventDefault()}
                role="option"
              >
                {item.label}
              </div>
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
            onEditableLineKeyDown: handleLineKeyDown,
            tabStopLineIndex: currentCursorLineIndex ?? 0,
            activeDescendant:
              slashCommand && slashMenuItems.length > 0 && currentCursorLineIndex !== null
                ? { lineIndex: currentCursorLineIndex, id: slashOptionId(slashIndex), listId: slashListId }
                : null,
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

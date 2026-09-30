import {
  type KeyboardEvent as ReactKeyboardEvent,
  type MouseEvent as ReactMouseEvent,
  useEffect,
  useRef,
  useState,
} from "react";
import type {
  EditorTab,
  FloatingEditorPosition,
  LineMenuView,
  SlashCommandState,
} from "../editorTypes";
import {
  describeMarkdownLine,
  getMarkdownLineStartOffset,
  getSelectableLineRange,
  normalizePreviewLineText,
  rebuildMarkdownLine,
} from "../editorUtils";
import type { useEditorAnnotations } from "./useEditorAnnotations";
import type { useEditorDocument } from "./useEditorDocument";
import type { useEditorPanels } from "./useEditorPanels";
import type { useEditorSelection } from "./useEditorSelection";

/**
 * Row-level editing of the contentEditable markdown surface: per-line input,
 * selection capture, line insert/remove/duplicate, the row menu, and the
 * floating toolbar/popover positioning.
 */
export function useLineEditing({
  currentTab,
  doc,
  selection,
  panels,
  annotations,
}: {
  currentTab: EditorTab;
  doc: ReturnType<typeof useEditorDocument>;
  selection: ReturnType<typeof useEditorSelection>;
  panels: ReturnType<typeof useEditorPanels>;
  annotations: ReturnType<typeof useEditorAnnotations>;
}) {
  const { blocks, markdownSource, setMarkdownSource } = doc;
  const { richNodes, setSelectedBlockId, setSelectedNodeId, selectedMarkdownRange, setSelectedMarkdownRange } =
    selection;
  const { setActiveSidePanel, setIsContextPanelOpen } = panels;
  const {
    inlineComposerMode,
    setInlineComposerMode,
    setInlineSuggestionPreview,
    openInlineComposer,
    runInlineRewriteSuggestions,
  } = annotations;
  const [slashCommand, setSlashCommand] = useState<SlashCommandState>(null);
  const [activePreviewLineIndex, setActivePreviewLineIndex] = useState<number | null>(null);
  const [activePreviewLineMenuView, setActivePreviewLineMenuView] = useState<LineMenuView>("root");
  const [previewLineMenuPosition, setPreviewLineMenuPosition] = useState<FloatingEditorPosition>(null);
  const [currentCursorLineIndex, setCurrentCursorLineIndex] = useState<number | null>(null);
  const documentEditorLineRefs = useRef<Record<number, HTMLDivElement | null>>({});
  const editorSurfaceBodyRef = useRef<HTMLDivElement | null>(null);
  const [editorToolbarPosition, setEditorToolbarPosition] = useState<FloatingEditorPosition>(null);
  const [editorPopoverPosition, setEditorPopoverPosition] = useState<FloatingEditorPosition>(null);
  const [isSelectionFormatOpen, setIsSelectionFormatOpen] = useState(false);

  useEffect(() => {
    if (currentTab !== "edit") {
      setEditorToolbarPosition(null);
      setEditorPopoverPosition(null);
      return;
    }

    const container = editorSurfaceBodyRef.current;

    if (!container) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const maxLeft = Math.max(16, containerRect.width - 280);

    const getRangeRect = () => {
      const selection = window.getSelection();

      if (!selection || selection.rangeCount === 0 || !selectedMarkdownRange?.text) {
        return null;
      }

      const range = selection.getRangeAt(0);

      if (!container.contains(range.commonAncestorContainer)) {
        return null;
      }

      return range.getBoundingClientRect();
    };
    const getLineRect = () => {
      if (currentCursorLineIndex === null) {
        return null;
      }

      return documentEditorLineRefs.current[currentCursorLineIndex]?.getBoundingClientRect() ?? null;
    };
    const selectionRect = getRangeRect();
    const anchorRect = selectionRect ?? (inlineComposerMode ? getLineRect() : null);

    if (!anchorRect) {
      setEditorToolbarPosition(null);
      setEditorPopoverPosition(null);
      return;
    }

    const baseLeft = Math.min(
      maxLeft,
      Math.max(16, anchorRect.left - containerRect.left + anchorRect.width / 2 - 110),
    );
    const toolbarTop = Math.max(8, anchorRect.top - containerRect.top - 52);
    const popoverTop = anchorRect.bottom - containerRect.top + 12;

    setEditorToolbarPosition({
      top: toolbarTop,
      left: baseLeft,
    });

    if (inlineComposerMode) {
      setEditorPopoverPosition({
        top: popoverTop,
        left: Math.min(maxLeft, Math.max(16, anchorRect.left - containerRect.left)),
      });
      return;
    }

    setEditorPopoverPosition(null);
  }, [
    currentCursorLineIndex,
    currentTab,
    inlineComposerMode,
    markdownSource,
    selectedMarkdownRange,
  ]);

  useEffect(() => {
    if (!selectedMarkdownRange?.text) {
      setIsSelectionFormatOpen(false);
    }
  }, [selectedMarkdownRange]);

  function openPreviewLineMenu(lineIndex: number, target: HTMLButtonElement) {
    const container = editorSurfaceBodyRef.current;

    if (activePreviewLineIndex === lineIndex) {
      setActivePreviewLineIndex(null);
      setPreviewLineMenuPosition(null);
      return;
    }

    if (!container) {
      setActivePreviewLineIndex(lineIndex);
      setPreviewLineMenuPosition(null);
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const triggerRect = target.getBoundingClientRect();
    const menuWidth = 232;
    const nextLeft = Math.min(
      Math.max(16, containerRect.width - menuWidth - 16),
      Math.max(16, triggerRect.left - containerRect.left + triggerRect.width + 10),
    );
    const nextTop = Math.max(12, triggerRect.top - containerRect.top - 6);

    setActivePreviewLineMenuView("root");
    setCurrentCursorLineIndex(lineIndex);
    setPreviewLineMenuPosition({
      left: nextLeft,
      top: nextTop,
    });
    setActivePreviewLineIndex(lineIndex);
  }

  function syncAnchorsForLineText(lineText: string) {
    const normalizedLineText = normalizePreviewLineText(lineText).toLowerCase();

    if (!normalizedLineText) {
      return;
    }

    const matchedBlock = blocks.find((block) => block.text.toLowerCase().includes(normalizedLineText));
    const matchedNode = richNodes.find((node) => (node.text ?? "").toLowerCase().includes(normalizedLineText));

    if (matchedBlock) {
      setSelectedBlockId(matchedBlock.blockId);
    }

    if (matchedNode?.nodeId) {
      setSelectedNodeId(matchedNode.nodeId);
    }
  }

  function handleEditableLineInput(lineIndex: number, nextContent: string) {
    const currentLines = markdownSource.split("\n");
    const currentLine = currentLines[lineIndex] ?? "";
    const descriptor = describeMarkdownLine(currentLine);
    const nextLine = rebuildMarkdownLine(descriptor, nextContent);
    const nextLines = [...currentLines];
    nextLines[lineIndex] = nextLine;
    const nextMarkdownSource = nextLines.join("\n");
    const lineStart = getMarkdownLineStartOffset(nextMarkdownSource, lineIndex);

    setMarkdownSource(nextMarkdownSource);
    setCurrentCursorLineIndex(lineIndex);
    syncAnchorsForLineText(nextLine);

    if (nextContent.trim().startsWith("/")) {
      setSlashCommand({
        query: nextContent.trim().slice(1).trim().toLowerCase(),
        lineStart,
        lineEnd: lineStart + nextLine.length,
      });
      return;
    }

    setSlashCommand(null);
  }

  function handleEditableLineSelection(lineIndex: number, lineText: string, element: HTMLDivElement) {
    const lineDescriptor = describeMarkdownLine(lineText);
    const lineStart = getMarkdownLineStartOffset(markdownSource, lineIndex) + lineDescriptor.prefix.length;
    const selection = window.getSelection();

    setCurrentCursorLineIndex(lineIndex);
    syncAnchorsForLineText(lineText);

    if (!selection || selection.rangeCount === 0) {
      setSelectedMarkdownRange(null);
      return;
    }

    const range = selection.getRangeAt(0);

    if (!element.contains(range.startContainer) || !element.contains(range.endContainer)) {
      setSelectedMarkdownRange(null);
      return;
    }

    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(element);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    const localStartOffset = preSelectionRange.toString().length;
    const selectedText = range.toString().trim();

    if (!selectedText) {
      setSelectedMarkdownRange(null);
      return;
    }

    const startOffset = lineStart + localStartOffset;
    const endOffset = startOffset + selectedText.length;

    setSelectedMarkdownRange({
      startOffset,
      endOffset,
      text: selectedText,
    });
    setActiveSidePanel("comments");
    setIsContextPanelOpen(true);
  }


  function focusLineInEditor(lineIndex: number) {
    const targetLine = documentEditorLineRefs.current[lineIndex];

    if (!targetLine) {
      return;
    }

    window.requestAnimationFrame(() => {
      targetLine.focus();
      targetLine.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  function updateMarkdownLine(lineIndex: number, nextLine: string) {
    const nextLines = markdownSource.split("\n");
    nextLines[lineIndex] = nextLine;
    setMarkdownSource(nextLines.join("\n"));
  }

  function duplicateMarkdownLine(lineIndex: number) {
    const nextLines = markdownSource.split("\n");
    const duplicatedLine = nextLines[lineIndex] ?? "";
    nextLines.splice(lineIndex + 1, 0, duplicatedLine);
    setMarkdownSource(nextLines.join("\n"));
  }

  function insertMarkdownLineAfter(lineIndex: number, nextLine = "") {
    const nextLines = markdownSource.split("\n");
    nextLines.splice(lineIndex + 1, 0, nextLine);
    setMarkdownSource(nextLines.join("\n"));
    setCurrentCursorLineIndex(lineIndex + 1);

    window.requestAnimationFrame(() => {
      focusLineInEditor(lineIndex + 1);
    });
  }

  function removeMarkdownLine(lineIndex: number, direction: "previous" | "next") {
    const nextLines = markdownSource.split("\n");

    if (nextLines.length <= 1) {
      return;
    }

    nextLines.splice(lineIndex, 1);
    const nextFocusIndex =
      direction === "previous"
        ? Math.max(0, lineIndex - 1)
        : Math.min(nextLines.length - 1, lineIndex);

    setMarkdownSource(nextLines.join("\n"));
    setCurrentCursorLineIndex(nextFocusIndex);
    setSelectedMarkdownRange(null);
    setInlineComposerMode(null);
    setInlineSuggestionPreview(null);
    setActivePreviewLineIndex(null);
    setPreviewLineMenuPosition(null);

    window.requestAnimationFrame(() => {
      focusLineInEditor(nextFocusIndex);
    });
  }

  function handleEditableLineKeyDown(lineIndex: number, event: ReactKeyboardEvent<HTMLDivElement>) {
    if (
      (event.key === "Backspace" || event.key === "Delete") &&
      !(event.currentTarget.innerText ?? "").trim()
    ) {
      event.preventDefault();
      removeMarkdownLine(lineIndex, event.key === "Backspace" ? "previous" : "next");
      return;
    }

    if (event.key !== "Enter") {
      return;
    }

    if (event.shiftKey) {
      event.preventDefault();

      const selection = window.getSelection();

      if (!selection || selection.rangeCount === 0) {
        return;
      }

      const range = selection.getRangeAt(0);
      range.deleteContents();
      const lineBreak = document.createElement("br");
      range.insertNode(lineBreak);
      range.setStartAfter(lineBreak);
      range.collapse(true);
      selection.removeAllRanges();
      selection.addRange(range);
      handleEditableLineInput(lineIndex, event.currentTarget.innerText ?? "");
      return;
    }

    event.preventDefault();
    insertMarkdownLineAfter(lineIndex);
  }

  function handleEditorSurfaceMouseDown(event: ReactMouseEvent<HTMLDivElement>) {
    if (event.button !== 0) {
      return;
    }

    const target = event.target as HTMLElement | null;

    if (!target) {
      return;
    }

    if (
      target.closest(".resume-editor-context-toolbar") ||
      target.closest(".resume-editor-inline-composer") ||
      target.closest(".resume-editor-document-preview__menu-popover") ||
      target.closest(".resume-editor-slash-menu") ||
      target.closest(".resume-editor-document-preview__grip")
    ) {
      return;
    }

    setCurrentCursorLineIndex(null);
    setSelectedMarkdownRange(null);
    setInlineSuggestionPreview(null);
    setInlineComposerMode(null);
    setActivePreviewLineIndex(null);
    setPreviewLineMenuPosition(null);
    setSlashCommand(null);
  }

  function handlePreviewLineAction(action: string, lineIndex: number, lineText: string) {
    const normalizedLineText = normalizePreviewLineText(lineText) || "New line";
    const nextSelectionRange = getSelectableLineRange(markdownSource, lineIndex);

    switch (action) {
      case "heading1":
        updateMarkdownLine(lineIndex, `# ${normalizedLineText}`);
        break;
      case "heading2":
        updateMarkdownLine(lineIndex, `## ${normalizedLineText}`);
        break;
      case "bullet":
        updateMarkdownLine(lineIndex, `- ${normalizedLineText}`);
        break;
      case "quote":
        updateMarkdownLine(lineIndex, `> ${normalizedLineText}`);
        break;
      case "duplicate":
        duplicateMarkdownLine(lineIndex);
        break;
      case "comment":
        openInlineComposer("comment", nextSelectionRange.selectedText ? nextSelectionRange : null);
        break;
      case "card":
        openInlineComposer("card", nextSelectionRange.selectedText ? nextSelectionRange : null);
        break;
      case "rewrite":
        if (nextSelectionRange.selectedText) {
          setSelectedMarkdownRange(nextSelectionRange);
          void runInlineRewriteSuggestions(nextSelectionRange);
        }
        break;
      case "tools":
        if (nextSelectionRange.selectedText) {
          setSelectedMarkdownRange(nextSelectionRange);
        }
        setActiveSidePanel("comments");
        setIsContextPanelOpen(true);
        break;
      default:
        break;
    }

    setActivePreviewLineMenuView("root");
    setActivePreviewLineIndex(null);
    setPreviewLineMenuPosition(null);
  }

  return {
    slashCommand,
    setSlashCommand,
    activePreviewLineIndex,
    setActivePreviewLineIndex,
    activePreviewLineMenuView,
    setActivePreviewLineMenuView,
    previewLineMenuPosition,
    setPreviewLineMenuPosition,
    currentCursorLineIndex,
    setCurrentCursorLineIndex,
    documentEditorLineRefs,
    editorSurfaceBodyRef,
    editorToolbarPosition,
    setEditorToolbarPosition,
    editorPopoverPosition,
    setEditorPopoverPosition,
    isSelectionFormatOpen,
    setIsSelectionFormatOpen,
    openPreviewLineMenu,
    syncAnchorsForLineText,
    handleEditableLineInput,
    handleEditableLineSelection,
    focusLineInEditor,
    updateMarkdownLine,
    duplicateMarkdownLine,
    insertMarkdownLineAfter,
    removeMarkdownLine,
    handleEditableLineKeyDown,
    handleEditorSurfaceMouseDown,
    handlePreviewLineAction,
  };
}

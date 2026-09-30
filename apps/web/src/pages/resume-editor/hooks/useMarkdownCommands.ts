import type { SelectionFormatAction } from "../editorTypes";
import { getLineIndexForOffset, normalizePreviewLineText } from "../editorUtils";
import type { useEditorAnnotations } from "./useEditorAnnotations";
import type { useEditorDocument } from "./useEditorDocument";
import type { useEditorSelection } from "./useEditorSelection";
import type { useLineEditing } from "./useLineEditing";

/** Slash-menu commands and selection formatting that rewrite the markdown source. */
export function useMarkdownCommands({
  isKorean,
  doc,
  selection,
  annotations,
  lineEditing,
}: {
  isKorean: boolean;
  doc: ReturnType<typeof useEditorDocument>;
  selection: ReturnType<typeof useEditorSelection>;
  annotations: ReturnType<typeof useEditorAnnotations>;
  lineEditing: ReturnType<typeof useLineEditing>;
}) {
  const { markdownSource, setMarkdownSource } = doc;
  const { selectedMarkdownRange, setSelectedMarkdownRange } = selection;
  const { openInlineComposer, runInlineQuestionSuggestions, runInlineRewriteSuggestions } = annotations;
  const { slashCommand, setSlashCommand, setIsSelectionFormatOpen } = lineEditing;
  const slashMenuItems = [
    {
      id: "h1",
      label: isKorean ? "제목 1" : "Heading 1",
      matches: ["", "h1", "heading", "title"],
      onSelect: () => replaceSlashLine("# __TEXT__", isKorean ? "섹션 제목" : "Section title"),
    },
    {
      id: "h2",
      label: isKorean ? "제목 2" : "Heading 2",
      matches: ["h2", "subheading", "subtitle"],
      onSelect: () => replaceSlashLine("## __TEXT__", isKorean ? "하위 섹션" : "Subsection"),
    },
    {
      id: "bullet",
      label: isKorean ? "불릿 목록" : "Bullet list",
      matches: ["bullet", "list", "ul"],
      onSelect: () => replaceSlashLine("- __TEXT__", isKorean ? "불릿 항목" : "Bullet point"),
    },
    {
      id: "quote",
      label: isKorean ? "인용 / 콜아웃" : "Quote / callout",
      matches: ["quote", "callout"],
      onSelect: () => replaceSlashLine("> __TEXT__", isKorean ? "콜아웃" : "Callout"),
    },
    {
      id: "comment",
      label: isKorean ? "선택 영역에 댓글" : "Comment on selection",
      matches: ["comment", "note"],
      onSelect: () => {
        openInlineComposer("comment");
        setSlashCommand(null);
      },
    },
    {
      id: "question",
      label: isKorean ? "질문 제안" : "Question suggestion",
      matches: ["question", "prompt"],
      onSelect: () => {
        void runInlineQuestionSuggestions();
        setSlashCommand(null);
      },
    },
    {
      id: "rewrite",
      label: isKorean ? "문장 재작성 제안" : "Rewrite suggestion",
      matches: ["rewrite", "improve"],
      onSelect: () => {
        void runInlineRewriteSuggestions();
        setSlashCommand(null);
      },
    },
  ].filter((item) =>
    slashCommand
      ? item.matches.some((token) => token.includes(slashCommand.query) || slashCommand.query.includes(token))
      : false,
  );

  function replaceSlashLine(snippet: string, fallbackLabel: string) {
    const currentValue = markdownSource;

    if (!slashCommand) {
      insertMarkdownSnippet(snippet, fallbackLabel);
      return;
    }

    const rawSelectedText = currentValue.slice(slashCommand.lineStart, slashCommand.lineEnd).trim();
    const selectedText =
      !rawSelectedText || rawSelectedText === "/" ? fallbackLabel : rawSelectedText.replace(/^\//, "").trim();
    const resolvedSnippet = snippet.replace("__TEXT__", selectedText);
    const nextValue =
      currentValue.slice(0, slashCommand.lineStart) +
      resolvedSnippet +
      currentValue.slice(slashCommand.lineEnd);

    setMarkdownSource(nextValue);
    setSlashCommand(null);
  }

  function insertMarkdownSnippet(snippet: string, fallbackLabel: string) {
    const currentValue = markdownSource;
    const selectionStart = selectedMarkdownRange?.startOffset ?? currentValue.length;
    const selectionEnd = selectedMarkdownRange?.endOffset ?? currentValue.length;
    const rawSelectedText = currentValue.slice(selectionStart, selectionEnd).trim();
    const selectedText = !rawSelectedText || rawSelectedText === "/" ? fallbackLabel : rawSelectedText;
    const resolvedSnippet = snippet.replace("__TEXT__", selectedText);
    const nextValue =
      currentValue.slice(0, selectionStart) + resolvedSnippet + currentValue.slice(selectionEnd);

    setMarkdownSource(nextValue);
  }

  function updateMarkdownSelection(replacement: string) {
    if (!selectedMarkdownRange) {
      return;
    }

    const nextMarkdownSource =
      markdownSource.slice(0, selectedMarkdownRange.startOffset) +
      replacement +
      markdownSource.slice(selectedMarkdownRange.endOffset);

    setMarkdownSource(nextMarkdownSource);
    setSelectedMarkdownRange({
      startOffset: selectedMarkdownRange.startOffset,
      endOffset: selectedMarkdownRange.startOffset + replacement.length,
      text: replacement,
    });
  }

  function applySelectionFormat(action: SelectionFormatAction) {
    if (!selectedMarkdownRange?.text) {
      return;
    }

    const selectedText = selectedMarkdownRange.text;

    if (action === "bold") {
      updateMarkdownSelection(`**${selectedText}**`);
      setIsSelectionFormatOpen(false);
      return;
    }

    if (action === "italic") {
      updateMarkdownSelection(`*${selectedText}*`);
      setIsSelectionFormatOpen(false);
      return;
    }

    if (action === "code") {
      updateMarkdownSelection(`\`${selectedText}\``);
      setIsSelectionFormatOpen(false);
      return;
    }

    const lines = markdownSource.split("\n");
    const startLineIndex = getLineIndexForOffset(markdownSource, selectedMarkdownRange.startOffset);
    const endLineIndex = getLineIndexForOffset(
      markdownSource,
      Math.max(selectedMarkdownRange.startOffset, selectedMarkdownRange.endOffset - 1),
    );

    for (let lineIndex = startLineIndex; lineIndex <= endLineIndex; lineIndex += 1) {
      const line = lines[lineIndex] ?? "";
      const normalizedLineText = normalizePreviewLineText(line) || "New line";

      if (action === "heading1") {
        lines[lineIndex] = `# ${normalizedLineText}`;
      } else if (action === "heading2") {
        lines[lineIndex] = `## ${normalizedLineText}`;
      } else if (action === "bullet") {
        lines[lineIndex] = `- ${normalizedLineText}`;
      } else if (action === "quote") {
        lines[lineIndex] = `> ${normalizedLineText}`;
      }
    }

    setMarkdownSource(lines.join("\n"));
    setIsSelectionFormatOpen(false);
  }

  return {
    slashMenuItems,
    replaceSlashLine,
    insertMarkdownSnippet,
    updateMarkdownSelection,
    applySelectionFormat,
  };
}

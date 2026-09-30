import { useLocale } from "../../../shared/i18n";
import type { SelectionFormatAction } from "../editorTypes";
import { getLineIndexForOffset, normalizePreviewLineText } from "../editorUtils";
import type { useEditorAnnotations } from "./useEditorAnnotations";
import type { useEditorDocument } from "./useEditorDocument";
import type { useEditorSelection } from "./useEditorSelection";
import type { useLineEditing } from "./useLineEditing";

/** Slash-menu commands and selection formatting that rewrite the markdown source. */
export function useMarkdownCommands({
  doc,
  selection,
  annotations,
  lineEditing,
}: {
  doc: ReturnType<typeof useEditorDocument>;
  selection: ReturnType<typeof useEditorSelection>;
  annotations: ReturnType<typeof useEditorAnnotations>;
  lineEditing: ReturnType<typeof useLineEditing>;
}) {
  const { t } = useLocale();
  const { markdownSource, setMarkdownSource } = doc;
  const { selectedMarkdownRange, setSelectedMarkdownRange } = selection;
  const { openInlineComposer, runInlineQuestionSuggestions, runInlineRewriteSuggestions } = annotations;
  const { slashCommand, setSlashCommand, setIsSelectionFormatOpen } = lineEditing;
  const slashMenuItems = [
    {
      id: "h1",
      label: t("resumeEditor.heading1"),
      matches: ["", "h1", "heading", "title"],
      onSelect: () => replaceSlashLine("# __TEXT__", t("resumeEditor.sectionTitle")),
    },
    {
      id: "h2",
      label: t("resumeEditor.heading2"),
      matches: ["h2", "subheading", "subtitle"],
      onSelect: () => replaceSlashLine("## __TEXT__", t("resumeEditor.subsection")),
    },
    {
      id: "bullet",
      label: t("resumeEditor.bulletList"),
      matches: ["bullet", "list", "ul"],
      onSelect: () => replaceSlashLine("- __TEXT__", t("resumeEditor.bulletPoint")),
    },
    {
      id: "quote",
      label: t("resumeEditor.quoteCallout"),
      matches: ["quote", "callout"],
      onSelect: () => replaceSlashLine("> __TEXT__", t("resumeEditor.callout")),
    },
    {
      id: "comment",
      label: t("resumeEditor.commentOnSelection"),
      matches: ["comment", "note"],
      onSelect: () => {
        openInlineComposer("comment");
        setSlashCommand(null);
      },
    },
    {
      id: "question",
      label: t("resumeEditor.questionSuggestion"),
      matches: ["question", "prompt"],
      onSelect: () => {
        void runInlineQuestionSuggestions();
        setSlashCommand(null);
      },
    },
    {
      id: "rewrite",
      label: t("resumeEditor.rewriteSuggestionCommand"),
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

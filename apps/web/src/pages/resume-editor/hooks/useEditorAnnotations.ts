import { useState } from "react";
import {
  useCreateResumeEditorCommentMutation,
  useCreateResumeEditorCommentReplyMutation,
  useCreateResumeEditorQuestionCardMutation,
  useResumeEditorQuestionSuggestionsMutation,
  useResumeEditorRewriteSuggestionsMutation,
  useUpdateResumeEditorCommentMutation,
  useUpdateResumeEditorQuestionCardMutation,
} from "../../../features/resume-editor/api/useResumeEditorAnnotationMutations";
import type { InlineComposerMode, InlineSuggestionPreview, SelectionOverride } from "../editorTypes";
import { replaceFirstOccurrence, splitLines } from "../editorUtils";
import type { useEditorDocument } from "./useEditorDocument";
import type { useEditorSelection } from "./useEditorSelection";

/** Comments, question cards, AI suggestions, and the inline composer drafts. */
export function useEditorAnnotations({
  versionId,
  doc,
  selection,
}: {
  versionId: string | undefined;
  doc: ReturnType<typeof useEditorDocument>;
  selection: ReturnType<typeof useEditorSelection>;
}) {
  const {
    workspaceQuery,
    blocks,
    setBlocks,
    markdownSource,
    setMarkdownSource,
    saveBlocks,
    saveMarkdownDraft,
    patchDocumentOperations,
  } = doc;
  const { selectedBlock, effectiveSelectedText, currentSelectionAnchor, setSelectedMarkdownRange } = selection;
  const createCommentMutation = useCreateResumeEditorCommentMutation(versionId ?? null);
  const updateCommentMutation = useUpdateResumeEditorCommentMutation(versionId ?? null);
  const createReplyMutation = useCreateResumeEditorCommentReplyMutation(versionId ?? null);
  const createQuestionCardMutation = useCreateResumeEditorQuestionCardMutation(versionId ?? null);
  const updateQuestionCardMutation = useUpdateResumeEditorQuestionCardMutation(versionId ?? null);
  const questionSuggestionsMutation = useResumeEditorQuestionSuggestionsMutation(versionId ?? null);
  const rewriteSuggestionsMutation = useResumeEditorRewriteSuggestionsMutation(versionId ?? null);

  const [newCommentBody, setNewCommentBody] = useState("");
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});
  const [newQuestionCardTitle, setNewQuestionCardTitle] = useState("");
  const [newQuestionCardText, setNewQuestionCardText] = useState("");
  const [newQuestionCardType, setNewQuestionCardType] = useState("behavioral");
  const [questionSuggestionMax, setQuestionSuggestionMax] = useState("3");
  const [inlineSuggestionPreview, setInlineSuggestionPreview] =
    useState<InlineSuggestionPreview>(null);
  const [inlineComposerMode, setInlineComposerMode] = useState<InlineComposerMode>(null);
  const [inlineCommentBody, setInlineCommentBody] = useState("");
  const [inlineCardTitle, setInlineCardTitle] = useState("");
  const [inlineCardText, setInlineCardText] = useState("");

  async function runInlineQuestionSuggestions(
    selectionOverride?: SelectionOverride,
  ) {
    const effectiveSelection = selectionOverride?.selectedText
      ? {
          ...currentSelectionAnchor,
          selectionStartOffset: selectionOverride.startOffset,
          selectionEndOffset: selectionOverride.endOffset,
          selectedText: selectionOverride.selectedText,
          anchorQuote: selectionOverride.selectedText,
        }
      : currentSelectionAnchor;
    const effectiveFieldPath = effectiveSelection?.fieldPath ?? selectedBlock?.fieldPath ?? null;
    const effectiveText = selectionOverride?.selectedText ?? effectiveSelectedText;

    if (!selectedBlock && !effectiveSelection) {
      return;
    }

    setInlineSuggestionPreview("question");
    await questionSuggestionsMutation.mutateAsync({
      blockId: selectedBlock?.blockId ?? null,
      selectionAnchor: effectiveSelection,
      fieldPath: effectiveFieldPath,
      selectedText: effectiveText,
      maxSuggestions: Number(questionSuggestionMax) || 3,
    });
  }

  async function runInlineRewriteSuggestions(
    selectionOverride?: SelectionOverride,
  ) {
    const effectiveSelection = selectionOverride?.selectedText
      ? {
          ...currentSelectionAnchor,
          selectionStartOffset: selectionOverride.startOffset,
          selectionEndOffset: selectionOverride.endOffset,
          selectedText: selectionOverride.selectedText,
          anchorQuote: selectionOverride.selectedText,
        }
      : currentSelectionAnchor;
    const effectiveFieldPath = effectiveSelection?.fieldPath ?? selectedBlock?.fieldPath ?? null;
    const effectiveText = selectionOverride?.selectedText ?? effectiveSelectedText;

    if (!selectedBlock && !effectiveSelection) {
      return;
    }

    setInlineSuggestionPreview("rewrite");
    await rewriteSuggestionsMutation.mutateAsync({
      blockId: selectedBlock?.blockId ?? null,
      selectionAnchor: effectiveSelection,
      fieldPath: effectiveFieldPath,
      selectedText: effectiveText,
    });
  }

  function openInlineComposer(
    mode: InlineComposerMode,
    selectionOverride?: SelectionOverride,
  ) {
    if (selectionOverride?.selectedText) {
      setSelectedMarkdownRange({
        startOffset: selectionOverride.startOffset,
        endOffset: selectionOverride.endOffset,
        text: selectionOverride.selectedText,
      });
    }

    setInlineSuggestionPreview(null);
    setInlineComposerMode(mode);

    if (mode === "comment") {
      setInlineCommentBody("");
      return;
    }

    setInlineCardTitle("");
    setInlineCardText(selectionOverride?.selectedText ?? effectiveSelectedText ?? "");
  }

  async function submitInlineComment() {
    if ((!selectedBlock && !currentSelectionAnchor) || !inlineCommentBody.trim()) {
      return;
    }

    await createCommentMutation.mutateAsync({
      blockId: selectedBlock?.blockId ?? null,
      selectionAnchor: currentSelectionAnchor,
      fieldPath: currentSelectionAnchor?.fieldPath ?? selectedBlock?.fieldPath ?? null,
      selectionStartOffset: null,
      selectionEndOffset: null,
      selectedText: effectiveSelectedText,
      body: inlineCommentBody,
    });
    setInlineCommentBody("");
    setInlineComposerMode(null);
  }

  async function submitInlineQuestionCard() {
    if ((!selectedBlock && !currentSelectionAnchor) || !inlineCardText.trim()) {
      return;
    }

    await createQuestionCardMutation.mutateAsync({
      blockId: selectedBlock?.blockId ?? null,
      selectionAnchor: currentSelectionAnchor,
      fieldPath: currentSelectionAnchor?.fieldPath ?? selectedBlock?.fieldPath ?? null,
      selectionStartOffset: null,
      selectionEndOffset: null,
      selectedText: effectiveSelectedText,
      title: inlineCardTitle || null,
      questionText: inlineCardText,
      questionType: newQuestionCardType,
      linkedQuestionId: null,
      followUpSuggestions: [],
    });
    setInlineCardTitle("");
    setInlineCardText("");
    setInlineComposerMode(null);
  }

  async function handleApplyRewrite(suggestedText: string) {
    if (
      currentSelectionAnchor?.nodeId &&
      workspaceQuery.data?.selectionCapabilities.supportsOperations &&
      currentSelectionAnchor.selectionStartOffset !== null &&
      currentSelectionAnchor.selectionEndOffset !== null &&
      currentSelectionAnchor.selectionEndOffset > currentSelectionAnchor.selectionStartOffset
    ) {
      await patchDocumentOperations(
        [
          {
            operationType: "text_replace",
            nodeId: currentSelectionAnchor.nodeId,
            startOffset: currentSelectionAnchor.selectionStartOffset,
            endOffset: currentSelectionAnchor.selectionEndOffset,
            text: suggestedText,
          },
        ],
        "rewrite_apply",
      );

      if (effectiveSelectedText && markdownSource.includes(effectiveSelectedText)) {
        setMarkdownSource(replaceFirstOccurrence(markdownSource, effectiveSelectedText, suggestedText));
      }
      return;
    }

    if (effectiveSelectedText && markdownSource.includes(effectiveSelectedText)) {
      const nextMarkdownSource = replaceFirstOccurrence(markdownSource, effectiveSelectedText, suggestedText);

      setMarkdownSource(nextMarkdownSource);
      await saveMarkdownDraft(nextMarkdownSource, "rewrite_apply");
      return;
    }

    if (!selectedBlock) {
      return;
    }

    const nextBlocks = blocks.map((block) =>
      block.blockId === selectedBlock.blockId
        ? {
            ...block,
            text: suggestedText,
            lines: splitLines(suggestedText),
          }
        : block,
    );

    setBlocks(nextBlocks);
    await saveBlocks(nextBlocks, "rewrite_apply");
  }

  return {
    createCommentMutation,
    updateCommentMutation,
    createReplyMutation,
    createQuestionCardMutation,
    updateQuestionCardMutation,
    questionSuggestionsMutation,
    rewriteSuggestionsMutation,
    newCommentBody,
    setNewCommentBody,
    replyDrafts,
    setReplyDrafts,
    newQuestionCardTitle,
    setNewQuestionCardTitle,
    newQuestionCardText,
    setNewQuestionCardText,
    newQuestionCardType,
    setNewQuestionCardType,
    questionSuggestionMax,
    setQuestionSuggestionMax,
    inlineSuggestionPreview,
    setInlineSuggestionPreview,
    inlineComposerMode,
    setInlineComposerMode,
    inlineCommentBody,
    setInlineCommentBody,
    inlineCardTitle,
    setInlineCardTitle,
    inlineCardText,
    setInlineCardText,
    runInlineQuestionSuggestions,
    runInlineRewriteSuggestions,
    openInlineComposer,
    submitInlineComment,
    submitInlineQuestionCard,
    handleApplyRewrite,
  };
}

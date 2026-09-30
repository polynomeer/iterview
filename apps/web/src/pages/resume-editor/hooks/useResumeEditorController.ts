import { useEffect, useMemo, useState } from "react";
import { useParams, useSearchParams } from "react-router-dom";
import { useLocale } from "../../../shared/i18n";
import { useResumeVersionSnapshotsQuery } from "../../../features/resume/api/useResumeVersionSnapshotsQuery";
import { useResumeEditorPrintPreviewQuery } from "../../../features/resume-editor/api/useResumeEditorSecondaryQueries";
import type { EditorSidePanel, EditorTab } from "../editorTypes";
import { createEditorSessionKey, mapEditableBlocks, normalizeEditorTab, splitLines } from "../editorUtils";
import { useEditorAnnotations } from "./useEditorAnnotations";
import { useEditorDocument } from "./useEditorDocument";
import { useEditorPanels } from "./useEditorPanels";
import { useEditorSelection } from "./useEditorSelection";
import { useLineEditing } from "./useLineEditing";
import { useMarkdownCommands } from "./useMarkdownCommands";
import { usePresenceHeartbeat } from "./usePresenceHeartbeat";
import { useReviewSignals } from "./useReviewSignals";
import { useRevisionHistory } from "./useRevisionHistory";

/**
 * Composes every piece of resume editor state into one flat controller object
 * that the page and its tab/panel components read from.
 */
export function useResumeEditorController() {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const { versionId } = useParams<{ versionId: string }>();
  const safeVersionId = versionId ?? "";
  const [searchParams, setSearchParams] = useSearchParams();
  const currentTab = normalizeEditorTab(searchParams.get("tab"));
  const [sessionKey] = useState(() => createEditorSessionKey());
  const doc = useEditorDocument(versionId, isKorean, sessionKey);
  const { workspaceQuery, setBlocks, setMarkdownSource, setLayoutMetadata, mergePreviewMutation } = doc;
  const snapshotsQuery = useResumeVersionSnapshotsQuery(versionId ?? null);
  const printPreviewQuery = useResumeEditorPrintPreviewQuery(
    versionId ?? null,
    currentTab === "print-preview",
  );
  const history = useRevisionHistory(versionId, currentTab);
  const selection = useEditorSelection(doc.blocks, workspaceQuery);
  const { selectedBlockId, setSelectedBlockId, setSelectedNodeId, setSelectedMarkdownRange } = selection;
  const panels = useEditorPanels();
  const { activeSidePanel, setIsFallbackBlocksOpen } = panels;
  const annotations = useEditorAnnotations({ versionId, doc, selection });
  const review = useReviewSignals({
    currentTab,
    isKorean,
    markdownSource: doc.markdownSource,
    workspaceQuery,
    questionSuggestionsMutation: annotations.questionSuggestionsMutation,
    rewriteSuggestionsMutation: annotations.rewriteSuggestionsMutation,
  });
  const { setFocusedReviewLineIndex } = review;
  usePresenceHeartbeat({
    versionId,
    workspace: workspaceQuery.data,
    currentTab,
    selectedBlockId,
    sessionKey,
  });
  const lineEditing = useLineEditing({ currentTab, doc, selection, panels, annotations });
  const { setSlashCommand } = lineEditing;
  const markdownCommands = useMarkdownCommands({ isKorean, doc, selection, annotations, lineEditing });

  useEffect(() => {
    if (!workspaceQuery.data) {
      return;
    }

    setBlocks(mapEditableBlocks(workspaceQuery.data.document.blocks));
    setMarkdownSource(workspaceQuery.data.document.markdownSource);
    setLayoutMetadata(workspaceQuery.data.document.layoutMetadata);
    setSelectedBlockId((current) => current ?? workspaceQuery.data.document.blocks[0]?.blockId ?? null);
    setSelectedNodeId((current) => current ?? workspaceQuery.data.document.nodes[0]?.nodeId ?? null);
    setSelectedMarkdownRange(null);
    setSlashCommand(null);
    setFocusedReviewLineIndex(null);
  }, [workspaceQuery.data?.revisionNo]);

  useEffect(() => {
    if (!workspaceQuery.data) {
      return;
    }

    setIsFallbackBlocksOpen(workspaceQuery.data.documentModel !== "rich_tree");
  }, [workspaceQuery.data?.workspaceId, workspaceQuery.data?.documentModel]);

  const sourceContextCards = useMemo(() => {
    if (!snapshotsQuery.data) {
      return [];
    }

    return [
      snapshotsQuery.data.profile?.summaryText
        ? {
            title: isKorean ? "프로필 요약" : "Profile summary",
            body: snapshotsQuery.data.profile.summaryText,
          }
        : null,
      snapshotsQuery.data.skills.length > 0
        ? {
            title: isKorean ? "스킬" : "Skills",
            body: snapshotsQuery.data.skills.map((skill) => skill.label).join(", "),
          }
        : null,
      snapshotsQuery.data.experiences[0]
        ? {
            title: isKorean ? "원본 경력" : "Source experience",
            body: snapshotsQuery.data.experiences[0].impactText ?? snapshotsQuery.data.experiences[0].summary,
          }
        : null,
      snapshotsQuery.data.projects[0]
        ? {
            title: isKorean ? "원본 프로젝트" : "Source project",
            body: snapshotsQuery.data.projects[0].contentText ?? snapshotsQuery.data.projects[0].summary,
          }
        : null,
    ].filter(Boolean) as Array<{ title: string; body: string }>;
  }, [isKorean, snapshotsQuery.data]);

  const primarySidePanels: Array<[EditorSidePanel, string]> = [
    ["comments", isKorean ? "댓글" : "Comments"],
    ["question-cards", isKorean ? "질문 카드" : "Question cards"],
    ["suggestions", isKorean ? "제안" : "Suggestions"],
  ];

  const secondarySidePanels: Array<[EditorSidePanel, string]> = [
    ["source", isKorean ? "원본" : "Source"],
    ["presence", isKorean ? "접속 상태" : "Presence"],
  ];

  const isSecondaryPanelActive = activeSidePanel === "source" || activeSidePanel === "presence";
  const primaryTabs: EditorTab[] = ["edit", "review"];
  const secondaryTabs: EditorTab[] = ["heatmap", "print-preview", "history"];
  const isSecondaryTabActive = secondaryTabs.includes(currentTab);

  function updateTab(nextTab: EditorTab) {
    const next = new URLSearchParams(searchParams);
    next.set("tab", nextTab);
    setSearchParams(next);
  }

  function resolveConflictBlock(blockId: string, source: "current" | "proposed" | "merged") {
    const mergePreview = mergePreviewMutation.data;

    if (!mergePreview) {
      return;
    }

    const conflict = mergePreview.conflicts.find((item) => item.blockId === blockId);

    if (!conflict) {
      return;
    }

    const nextText =
      source === "current"
        ? conflict.currentText ?? ""
        : source === "proposed"
          ? conflict.proposedText ?? ""
          : mergePreview.mergedDocument.blocks.find((block) => block.blockId === blockId)?.textValue ?? "";

    setBlocks((current) =>
      current.map((block) =>
        block.blockId === blockId
          ? {
              ...block,
              text: nextText,
              lines: splitLines(nextText),
            }
          : block,
      ),
    );
    setSelectedBlockId(blockId);
  }

  return {
    isKorean,
    versionId,
    safeVersionId,
    searchParams,
    setSearchParams,
    currentTab,
    sessionKey,
    snapshotsQuery,
    printPreviewQuery,
    sourceContextCards,
    primarySidePanels,
    secondarySidePanels,
    isSecondaryPanelActive,
    primaryTabs,
    secondaryTabs,
    isSecondaryTabActive,
    updateTab,
    resolveConflictBlock,
    ...doc,
    ...history,
    ...selection,
    ...panels,
    ...annotations,
    ...review,
    ...lineEditing,
    ...markdownCommands,
  };
}

export type ResumeEditorController = ReturnType<typeof useResumeEditorController>;

import { useState } from "react";
import { ApiClientError } from "../../../shared/api/errors";
import { useLocale } from "../../../shared/i18n";
import { useResumeEditorWorkspaceQuery } from "../../../features/resume-editor/api/useResumeEditorWorkspaceQuery";
import {
  useImportResumeEditorMarkdownMutation,
  usePatchResumeEditorDocumentOperationsMutation,
  useResumeEditorMergePreviewMutation,
  useUpdateResumeEditorDocumentMutation,
} from "../../../features/resume-editor/api/useResumeEditorDocumentMutations";
import type { EditableBlock } from "../editorTypes";
import { mapRichNodeRequest, splitLines } from "../editorUtils";

/**
 * Owns the editable draft (blocks + markdown source), the save paths, and the
 * 409 stale-write recovery that turns a conflict into a server merge preview.
 */
export function useEditorDocument(versionId: string | undefined, sessionKey: string) {
  const { t } = useLocale();
  const workspaceQuery = useResumeEditorWorkspaceQuery(versionId ?? null);
  const updateDocumentMutation = useUpdateResumeEditorDocumentMutation(versionId ?? null);
  const patchDocumentOperationsMutation = usePatchResumeEditorDocumentOperationsMutation(
    versionId ?? null,
  );
  const importMarkdownMutation = useImportResumeEditorMarkdownMutation(versionId ?? null);
  const mergePreviewMutation = useResumeEditorMergePreviewMutation(versionId ?? null);

  const [blocks, setBlocks] = useState<EditableBlock[]>([]);
  const [markdownSource, setMarkdownSource] = useState("");
  const [layoutMetadata, setLayoutMetadata] = useState<Record<string, string>>({});
  const [saveMessage, setSaveMessage] = useState<string | null>(null);
  const [mergePreviewMessage, setMergePreviewMessage] = useState<string | null>(null);

  async function saveBlocks(nextBlocks: EditableBlock[], changeSource: string) {
    if (!workspaceQuery.data) {
      return;
    }

    try {
      await updateDocumentMutation.mutateAsync({
        blocks: nextBlocks.map((block) => ({
          blockId: block.blockId,
          blockType: block.blockType,
          title: block.title || null,
          text: block.text || null,
          lines: splitLines(block.text),
          sourceAnchorType: block.sourceAnchorType,
          sourceAnchorRecordId: block.sourceAnchorRecordId,
          sourceAnchorKey: block.sourceAnchorKey,
          fieldPath: block.fieldPath,
          displayOrder: block.displayOrder,
          metadata: block.metadata,
          inlineMarks: block.inlineMarks.map((mark) => ({
            markType: mark.markType,
            startOffset: mark.startOffset,
            endOffset: mark.endOffset,
            text: mark.text,
            href: mark.href,
          })),
        })),
        rootNodeId: workspaceQuery.data.document.rootNodeId,
        nodes: mapRichNodeRequest(workspaceQuery.data.document.nodes),
        tableOfContents: workspaceQuery.data.document.tableOfContents.map((item) => ({
          nodeId: item.nodeId,
          title: item.title,
          depth: item.depth,
          fieldPath: item.fieldPath,
        })),
        markdownSource,
        layoutMetadata,
        baseRevisionNo: workspaceQuery.data.revisionNo,
        changeSource,
      });
      setSaveMessage(t("resumeEditor.draftWorkspaceSaved"));
      setMergePreviewMessage(null);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 409) {
        await workspaceQuery.refetch();
        const mergePreview = await mergePreviewMutation.mutateAsync({
          blocks: nextBlocks.map((block) => ({
            blockId: block.blockId,
            blockType: block.blockType,
            title: block.title || null,
            text: block.text || null,
            lines: splitLines(block.text),
            sourceAnchorType: block.sourceAnchorType,
            sourceAnchorRecordId: block.sourceAnchorRecordId,
            sourceAnchorKey: block.sourceAnchorKey,
            fieldPath: block.fieldPath,
            displayOrder: block.displayOrder,
            metadata: block.metadata,
            inlineMarks: block.inlineMarks.map((mark) => ({
              markType: mark.markType,
              startOffset: mark.startOffset,
              endOffset: mark.endOffset,
              text: mark.text,
              href: mark.href,
            })),
          })),
          rootNodeId: workspaceQuery.data.document.rootNodeId,
          nodes: mapRichNodeRequest(workspaceQuery.data.document.nodes),
          tableOfContents: workspaceQuery.data.document.tableOfContents.map((item) => ({
            nodeId: item.nodeId,
            title: item.title,
            depth: item.depth,
            fieldPath: item.fieldPath,
          })),
          markdownSource,
          layoutMetadata,
          baseRevisionNo: workspaceQuery.data.revisionNo,
        });

        setMergePreviewMessage(
          mergePreview.mergeStatus === "clean"
            ? t("resumeEditor.mergePreviewClean")
            : t("resumeEditor.mergePreviewConflicts"),
        );
      } else {
        throw error;
      }
    }
  }

  async function saveMarkdownDraft(nextMarkdownSource: string, changeSource: string) {
    if (!workspaceQuery.data) {
      return;
    }

    try {
      await importMarkdownMutation.mutateAsync({
        markdownSource: nextMarkdownSource,
        replaceDocument: true,
        baseRevisionNo: workspaceQuery.data.revisionNo,
        changeSource,
      });
      setSaveMessage(t("resumeEditor.draftWorkspaceSaved"));
      setMergePreviewMessage(null);
    } catch (error) {
      if (error instanceof ApiClientError && error.status === 409) {
        await workspaceQuery.refetch();
        const mergePreview = await mergePreviewMutation.mutateAsync({
          blocks: blocks.map((block) => ({
            blockId: block.blockId,
            blockType: block.blockType,
            title: block.title || null,
            text: block.text || null,
            lines: splitLines(block.text),
            sourceAnchorType: block.sourceAnchorType,
            sourceAnchorRecordId: block.sourceAnchorRecordId,
            sourceAnchorKey: block.sourceAnchorKey,
            fieldPath: block.fieldPath,
            displayOrder: block.displayOrder,
            metadata: block.metadata,
            inlineMarks: block.inlineMarks.map((mark) => ({
              markType: mark.markType,
              startOffset: mark.startOffset,
              endOffset: mark.endOffset,
              text: mark.text,
              href: mark.href,
            })),
          })),
          rootNodeId: workspaceQuery.data.document.rootNodeId,
          nodes: mapRichNodeRequest(workspaceQuery.data.document.nodes),
          tableOfContents: workspaceQuery.data.document.tableOfContents.map((item) => ({
            nodeId: item.nodeId,
            title: item.title,
            depth: item.depth,
            fieldPath: item.fieldPath,
          })),
          markdownSource: nextMarkdownSource,
          layoutMetadata,
          baseRevisionNo: workspaceQuery.data.revisionNo,
        });

        setMergePreviewMessage(
          mergePreview.mergeStatus === "clean"
            ? t("resumeEditor.mergePreviewClean")
            : t("resumeEditor.mergePreviewConflicts"),
        );
      } else {
        throw error;
      }
    }
  }

  async function patchDocumentOperations(
    operations: Array<{
      operationType: string;
      nodeId?: string | null;
      parentNodeId?: string | null;
      referenceNodeId?: string | null;
      text?: string | null;
      startOffset?: number | null;
      endOffset?: number | null;
      nodeType?: string | null;
      markType?: string | null;
      href?: string | null;
      collapsed?: boolean | null;
    }>,
    changeSource: string,
  ) {
    if (!workspaceQuery.data) {
      return;
    }

    await patchDocumentOperationsMutation.mutateAsync({
      operations,
      baseRevisionNo: workspaceQuery.data.revisionNo,
      changeSource,
      clientSessionKey: sessionKey,
      clientChangeId: `${changeSource}-${Date.now().toString(36)}`,
    });
    setSaveMessage(t("resumeEditor.draftWorkspaceSaved"));
    setMergePreviewMessage(null);
  }

  async function saveCurrentDraft(changeSource: string) {
    if (workspaceQuery.data?.document.markdownSource !== markdownSource) {
      await saveMarkdownDraft(markdownSource, changeSource);
      return;
    }

    await saveBlocks(blocks, changeSource);
  }

  return {
    workspaceQuery,
    updateDocumentMutation,
    patchDocumentOperationsMutation,
    importMarkdownMutation,
    mergePreviewMutation,
    blocks,
    setBlocks,
    markdownSource,
    setMarkdownSource,
    layoutMetadata,
    setLayoutMetadata,
    saveMessage,
    setSaveMessage,
    mergePreviewMessage,
    setMergePreviewMessage,
    saveBlocks,
    saveMarkdownDraft,
    patchDocumentOperations,
    saveCurrentDraft,
  };
}

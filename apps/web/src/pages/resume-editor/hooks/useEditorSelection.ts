import { useState } from "react";
import type { useResumeEditorWorkspaceQuery } from "../../../features/resume-editor/api/useResumeEditorWorkspaceQuery";
import type { EditableBlock, MarkdownSelectionState } from "../editorTypes";
import { getDefaultSelectedText } from "../editorUtils";

export function useEditorSelection(
  blocks: EditableBlock[],
  workspaceQuery: ReturnType<typeof useResumeEditorWorkspaceQuery>,
) {
  const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [selectedMarkdownRange, setSelectedMarkdownRange] = useState<MarkdownSelectionState>(null);

  const selectedBlock =
    blocks.find((block) => block.blockId === selectedBlockId) ?? blocks[0] ?? null;
  const richNodes = workspaceQuery.data?.document.nodes ?? [];
  const selectedNode = richNodes.find((node) => node.nodeId === selectedNodeId) ?? richNodes[0] ?? null;
  const richTreeEnabled =
    workspaceQuery.data?.documentModel === "rich_tree" &&
    workspaceQuery.data.selectionCapabilities.supportsRichTree &&
    richNodes.length > 0;
  const documentTableOfContents =
    workspaceQuery.data?.document.tableOfContents.filter(
      (item): item is (typeof workspaceQuery.data.document.tableOfContents)[number] & { nodeId: string } =>
        Boolean(item.nodeId),
    ) ?? [];
  const effectiveSelectedText =
    selectedMarkdownRange?.text ??
    (richTreeEnabled ? selectedNode?.text?.trim().slice(0, 180) ?? null : getDefaultSelectedText(selectedBlock));
  const currentSelectionAnchor =
    richTreeEnabled && selectedNode
      ? {
          nodeId: selectedNode.nodeId,
          anchorPath: selectedNode.nodeId,
          fieldPath: selectedNode.fieldPath,
          selectionStartOffset: selectedMarkdownRange?.startOffset ?? null,
          selectionEndOffset: selectedMarkdownRange?.endOffset ?? null,
          selectedText: selectedMarkdownRange?.text ?? effectiveSelectedText,
          anchorQuote: selectedMarkdownRange?.text ?? effectiveSelectedText,
          sentenceIndex: null,
        }
      : null;

  return {
    selectedBlockId,
    setSelectedBlockId,
    selectedNodeId,
    setSelectedNodeId,
    selectedMarkdownRange,
    setSelectedMarkdownRange,
    selectedBlock,
    richNodes,
    selectedNode,
    richTreeEnabled,
    documentTableOfContents,
    effectiveSelectedText,
    currentSelectionAnchor,
  };
}

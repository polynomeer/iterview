import type { QuestionTreeResponseDto } from "../../shared/types/question-tree";

export type QuestionTreeNodeModel = {
  id: string;
  title: string;
  depth: number;
  difficulty: string;
  relationshipType: string | null;
  parentQuestionId: string | null;
  status: string;
  isRoot: boolean;
};

export type QuestionTreeModel = {
  rootQuestionId: string | null;
  nodes: QuestionTreeNodeModel[];
};

function flattenTree(
  node: QuestionTreeResponseDto["root"],
  parentQuestionId: string | null,
): QuestionTreeNodeModel[] {
  if (!node) {
    return [];
  }

  const id = String(node.questionId);
  const currentNode: QuestionTreeNodeModel = {
    id,
    title: node.title ?? "Follow-up question",
    depth: node.depth ?? 0,
    difficulty: node.difficulty ?? "General",
    relationshipType: node.relationshipType ?? null,
    parentQuestionId,
    status: node.nodeStatus ?? "unanswered",
    isRoot: parentQuestionId === null,
  };

  return [currentNode, ...(node.children ?? []).flatMap((child) => flattenTree(child, id))];
}

export function mapQuestionTreeResponseDtoToModel(
  response: QuestionTreeResponseDto,
): QuestionTreeModel {
  const rootQuestionId =
    response.root?.questionId === null || response.root?.questionId === undefined
      ? null
      : String(response.root.questionId);

  return {
    rootQuestionId,
    nodes: flattenTree(response.root ?? null, null),
  };
}

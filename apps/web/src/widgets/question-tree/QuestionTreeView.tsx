import { useMemo, useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import type { QuestionTreeModel } from "../../entities/question-tree/model";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { useLayoutMode } from "../../shared/ui/layout";
import { QuestionStatusBadge } from "../../shared/ui/QuestionStatusBadge";

type QuestionTreeViewProps = {
  tree: QuestionTreeModel;
};

export function QuestionTreeView({ tree }: QuestionTreeViewProps) {
  const { t } = useLocale();
  const { isDesktop } = useLayoutMode();
  const [selectedNodeId, setSelectedNodeId] = useState(tree.rootQuestionId);
  const selectedNode = useMemo(
    () => tree.nodes.find((node) => node.id === selectedNodeId) ?? tree.nodes[0],
    [selectedNodeId, tree.nodes],
  );
  const siblingCount = selectedNode?.parentQuestionId
    ? tree.nodes.filter((node) => node.parentQuestionId === selectedNode.parentQuestionId).length
    : tree.nodes.filter((node) => node.isRoot).length;

  return (
    <section className="page-card question-tree-surface">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{t("questionTree.hierarchyEyebrow")}</p>
          <h2 className="page-card__title">{t("questionTree.hierarchyTitle")}</h2>
        </div>
        <span className="section-heading__count">{tree.nodes.length}</span>
      </div>
      <p className="page-card__body question-tree-surface__intro">
        Move from the root to the deepest branch with the assumption that each child question is probing the weakest unsupported line above it.
      </p>
      <div className={`question-tree-flow ${isDesktop ? "question-tree-flow--desktop" : "question-tree-flow--mobile"}`}>
        <div className="question-tree">
          {tree.nodes.map((node, index) => (
            <button
              className={`question-tree__node${node.isRoot ? " question-tree__node--root" : ""}${node.id === selectedNode?.id ? " question-tree__node--active" : ""}`}
              key={node.id}
              onClick={() => {
                setSelectedNodeId(node.id);
              }}
              style={{ "--tree-depth": String(Math.max(node.depth, 0)) } as CSSProperties}
              type="button"
            >
              <div className="question-tree__line" />
              <div className="question-tree__content">
                <div className="question-tree__content-topline">
                  <div className="question-tree__node-step">{index + 1}</div>
                  <div className="question-tree__summary">
                    <article className="question-tree__summary-item">
                      <span>Depth</span>
                      <strong>{node.depth}</strong>
                    </article>
                    <article className="question-tree__summary-item">
                      <span>Type</span>
                      <strong>{node.isRoot ? t("questionTree.root") : node.relationshipType ?? "node"}</strong>
                    </article>
                  </div>
                </div>
                <div className="question-tree__meta">
                  <QuestionStatusBadge status={node.status} />
                  <span>{t("questionTree.depth")} {node.depth}</span>
                  <span>{node.difficulty}</span>
                  {node.relationshipType ? <span>{node.relationshipType}</span> : null}
                  {node.parentQuestionId ? <span>{t("questionTree.parent")} #{node.parentQuestionId}</span> : <span>{t("questionTree.root")}</span>}
                </div>
                <h3 className="list-item-card__title">{node.title}</h3>
                <div className="list-item-card__actions">
                  <span className="detail-chip detail-chip--accent">
                    {node.id === selectedNode?.id ? "Selected" : "Inspect node"}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
        {selectedNode ? (
          <aside className="question-tree-inspector">
            <div className="question-tree-inspector__header">
              <div>
                <p className="section-heading__eyebrow">Node inspector</p>
                <h2 className="page-card__title">{selectedNode.title}</h2>
              </div>
              <QuestionStatusBadge status={selectedNode.status} />
            </div>
            <div className="question-tree-inspector__stats">
              <article>
                <span>Depth</span>
                <strong>{selectedNode.depth}</strong>
              </article>
              <article>
                <span>Siblings</span>
                <strong>{siblingCount}</strong>
              </article>
              <article>
                <span>Difficulty</span>
                <strong>{selectedNode.difficulty}</strong>
              </article>
            </div>
            <div className="question-tree-inspector__panels">
              <div className="question-tree-inspector__panel">
                <span>Traversal meaning</span>
                <p>
                  {selectedNode.isRoot
                    ? "This is the root claim. Every deeper node exists to pressure-test one unsupported line in the original answer."
                    : "Treat this node as the next likely attack point if the parent answer stays vague or weakly evidenced."}
                </p>
              </div>
              <div className="question-tree-inspector__panel">
                <span>Relationship</span>
                <p>{selectedNode.isRoot ? t("questionTree.root") : selectedNode.relationshipType ?? "node"}</p>
                <p>{selectedNode.parentQuestionId ? `${t("questionTree.parent")} #${selectedNode.parentQuestionId}` : "No parent node"}</p>
              </div>
            </div>
            <div className="question-tree-inspector__actions">
              <Link className="secondary-button" to={routeConfig.questionDetail.buildPath({ questionId: selectedNode.id })}>
                {t("questionTree.viewDetail")}
              </Link>
              <Link className="primary-button" to={routeConfig.answerEditor.buildPath({ questionId: selectedNode.id })}>
                {t("questionTree.answer")}
              </Link>
              <Link className="secondary-button" to={routeConfig.questionTree.buildPath({ questionId: selectedNode.id })}>
                Re-root from here
              </Link>
            </div>
          </aside>
        ) : null}
      </div>
    </section>
  );
}

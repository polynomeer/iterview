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
              <div className="question-tree__content list-item-card">
                <div className="list-item-card__content">
                  <div className="question-tree__content-topline">
                    <div className="question-tree__node-step">{index + 1}</div>
                    <div className="list-item-card__meta question-tree__meta">
                      <QuestionStatusBadge status={node.status} />
                      <span>{t("questionTree.depth")} {node.depth}</span>
                      <span>{node.isRoot ? t("questionTree.root") : node.relationshipType ?? t("questionTree.node")}</span>
                      <span>{node.difficulty}</span>
                    </div>
                  </div>
                  <h3 className="list-item-card__title">{node.title}</h3>
                  <div className="list-item-card__meta question-tree__meta question-tree__meta--secondary">
                    {node.parentQuestionId ? <span>{t("questionTree.parent")} #{node.parentQuestionId}</span> : <span>{t("questionTree.root")}</span>}
                    <span className={`detail-chip ${node.id === selectedNode?.id ? "detail-chip--accent" : ""}`}>
                      {node.id === selectedNode?.id ? t("questionTree.selected") : t("questionTree.inspectNode")}
                    </span>
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
        {selectedNode ? (
          <aside className="question-tree-inspector">
            <div className="question-tree-inspector__header">
              <div>
                <p className="section-heading__eyebrow">{t("questionTree.nodeInspector")}</p>
                <h2 className="page-card__title">{selectedNode.title}</h2>
              </div>
              <QuestionStatusBadge status={selectedNode.status} />
            </div>
            <div className="question-tree-inspector__stats">
              <article>
                <span>{t("questionTree.depth")}</span>
                <strong>{selectedNode.depth}</strong>
              </article>
              <article>
                <span>{t("questionTree.siblings")}</span>
                <strong>{siblingCount}</strong>
              </article>
              <article>
                <span>{t("questionTree.difficulty")}</span>
                <strong>{selectedNode.difficulty}</strong>
              </article>
            </div>
            <div className="question-tree-inspector__panels">
              <div className="question-tree-inspector__panel">
                <span>{t("questionTree.traversalMeaning")}</span>
                <p>
                  {selectedNode.isRoot
                    ? t("questionTree.rootMeaning")
                    : t("questionTree.childMeaning")}
                </p>
              </div>
              <div className="question-tree-inspector__panel">
                <span>{t("questionTree.relationship")}</span>
                <p>{selectedNode.isRoot ? t("questionTree.root") : selectedNode.relationshipType ?? t("questionTree.node")}</p>
                <p>{selectedNode.parentQuestionId ? `${t("questionTree.parent")} #${selectedNode.parentQuestionId}` : t("questionTree.noParentNode")}</p>
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
                {t("questionTree.rerootFromHere")}
              </Link>
            </div>
          </aside>
        ) : null}
      </div>
    </section>
  );
}

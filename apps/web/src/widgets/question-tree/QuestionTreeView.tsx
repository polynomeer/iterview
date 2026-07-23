import type { CSSProperties } from "react";
import { Link } from "react-router-dom";
import type { QuestionTreeModel } from "../../entities/question-tree/model";
import { routeConfig } from "../../shared/config/routes";
import { useLocale } from "../../shared/i18n";
import { QuestionStatusBadge } from "../../shared/ui/QuestionStatusBadge";

type QuestionTreeViewProps = {
  tree: QuestionTreeModel;
};

export function QuestionTreeView({ tree }: QuestionTreeViewProps) {
  const { t } = useLocale();

  return (
    <section className="page-card">
      <div className="section-heading">
        <div>
          <p className="section-heading__eyebrow">{t("questionTree.hierarchyEyebrow")}</p>
          <h2 className="page-card__title">{t("questionTree.hierarchyTitle")}</h2>
        </div>
        <span className="section-heading__count">{tree.nodes.length}</span>
      </div>
      <div className="question-tree">
        {tree.nodes.map((node) => (
          <article
            className={`question-tree__node${node.isRoot ? " question-tree__node--root" : ""}`}
            key={node.id}
            style={{ "--tree-depth": String(Math.max(node.depth, 0)) } as CSSProperties}
          >
            <div className="question-tree__line" />
            <div className="question-tree__content">
              <div className="question-tree__meta">
                <QuestionStatusBadge status={node.status} />
                <span>{t("questionTree.depth")} {node.depth}</span>
                <span>{node.difficulty}</span>
                {node.relationshipType ? <span>{node.relationshipType}</span> : null}
                {node.parentQuestionId ? <span>{t("questionTree.parent")} #{node.parentQuestionId}</span> : <span>{t("questionTree.root")}</span>}
              </div>
              <h3 className="list-item-card__title">{node.title}</h3>
              <div className="list-item-card__actions">
                <Link className="secondary-button" to={routeConfig.questionDetail.buildPath({ questionId: node.id })}>
                  {t("questionTree.viewDetail")}
                </Link>
                <Link className="primary-button" to={routeConfig.answerEditor.buildPath({ questionId: node.id })}>
                  {t("questionTree.answer")}
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}

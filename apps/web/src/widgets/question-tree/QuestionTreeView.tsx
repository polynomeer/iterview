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
  const { locale, t } = useLocale();
  const isKorean = locale === "ko";
  const { isDesktop } = useLayoutMode();
  const [selectedNodeId, setSelectedNodeId] = useState(tree.rootQuestionId);
  const selectedNode = useMemo(
    () => tree.nodes.find((node) => node.id === selectedNodeId) ?? tree.nodes[0],
    [selectedNodeId, tree.nodes],
  );
  const childNodes = useMemo(
    () => tree.nodes.filter((node) => node.parentQuestionId === selectedNode?.id),
    [selectedNode?.id, tree.nodes],
  );
  const ancestry = useMemo(() => {
    if (!selectedNode) {
      return [];
    }

    const lineage = [selectedNode];
    let cursor = selectedNode.parentQuestionId;

    while (cursor) {
      const parent = tree.nodes.find((node) => node.id === cursor);
      if (!parent) {
        break;
      }
      lineage.unshift(parent);
      cursor = parent.parentQuestionId;
    }

    return lineage;
  }, [selectedNode, tree.nodes]);
  const siblingCount = selectedNode?.parentQuestionId
    ? tree.nodes.filter((node) => node.parentQuestionId === selectedNode.parentQuestionId).length
    : tree.nodes.filter((node) => node.isRoot).length;
  const relationLabel = selectedNode?.isRoot
    ? t("questionTree.root")
    : selectedNode?.relationshipType ?? t("questionTree.node");
  const scoreLabel = selectedNode ? Math.max(58, 82 - selectedNode.depth * 6) : 0;
  const attemptLabel = selectedNode?.depth === 0 ? (isKorean ? "2일 전" : "2 days ago") : selectedNode?.depth === 1 ? (isKorean ? "어제" : "Yesterday") : (isKorean ? "방금 전" : "Just now");
  const bestScoreLabel = selectedNode ? Math.max(scoreLabel, 78 - selectedNode.depth * 2) : 0;

  return (
    <section className="page-card question-tree-surface question-map-surface">
      <div className="question-map-surface__toolbar">
        <div className="question-map-surface__toolbar-group">
          <button className="question-map-surface__toggle question-map-surface__toggle--active" type="button">
            {isKorean ? "맵 보기" : "Map view"}
          </button>
          <button className="question-map-surface__toggle" type="button">
            {isKorean ? "DFS 집중" : "DFS focus"}
          </button>
          <button className="question-map-surface__toggle" type="button">
            {isKorean ? "전체 경로" : "All paths"}
          </button>
        </div>
        <div className="question-map-surface__toolbar-group">
          <button className="question-map-surface__ghost-action" type="button">
            {isKorean ? "필터" : "Filter"}
          </button>
          <div className="question-map-surface__zoom-control" aria-hidden="true">
            <span>-</span>
            <strong>100%</strong>
            <span>+</span>
          </div>
          <button className="question-map-surface__ghost-action" type="button">
            {isKorean ? "화면 맞춤" : "Fit view"}
          </button>
        </div>
      </div>
      <div className={`question-tree-flow question-map-flow ${isDesktop ? "question-tree-flow--desktop" : "question-tree-flow--mobile"}`}>
        <div className="question-map-canvas">
          <div className="question-map-canvas__header">
            <div>
              <p className="page-card__label">{t("questionTree.hierarchyEyebrow")}</p>
              <h2 className="page-card__title">{t("questionTree.hierarchyTitle")}</h2>
            </div>
            <span className="section-heading__count">{tree.nodes.length}</span>
          </div>
          <div className="question-map-canvas__path-strip">
            {ancestry.map((node, index) => (
              <article
                className={`question-map-canvas__path-chip ${node.id === selectedNode?.id ? "question-map-canvas__path-chip--active" : ""}`}
                key={node.id}
              >
                <span>{index === 0 ? t("questionTree.root") : `${t("questionTree.depth")} ${node.depth}`}</span>
                <strong>{node.title}</strong>
              </article>
            ))}
          </div>
          <div className="question-tree question-map-canvas__grid">
            {tree.nodes.map((node, index) => (
              <button
                className={`question-tree__node question-map-node${node.isRoot ? " question-tree__node--root" : ""}${node.id === selectedNode?.id ? " question-tree__node--active" : ""}`}
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
          <div className="question-map-canvas__legend">
            <div className="question-map-canvas__legend-copy">
              <span className="page-card__label">{isKorean ? "선택 경로" : "Selected path"}</span>
              <p className="page-card__body">
                {isKorean
                  ? "루트에서 선택 노드까지의 DFS 경로를 먼저 보고, 자식 질문으로 더 내려갈지 우측 레일에서 판단합니다."
                  : "Read the DFS path from the root to the selected node first, then decide from the right rail whether to go deeper."}
              </p>
            </div>
            <div className="question-map-canvas__legend-minimap" aria-hidden="true">
              <div className="question-map-canvas__legend-minimap-track" />
              <div className="question-map-canvas__legend-minimap-window" />
            </div>
          </div>
        </div>
        {selectedNode ? (
          <aside className="question-tree-inspector question-map-inspector">
            <div className="question-tree-inspector__header">
              <div>
                <p className="section-heading__eyebrow">{isKorean ? "질문 상세" : "Question details"}</p>
                <h2 className="page-card__title">{selectedNode.title}</h2>
              </div>
              <QuestionStatusBadge status={selectedNode.status} />
            </div>
            <div className="question-map-inspector__chips">
              <span className="detail-chip detail-chip--accent">{selectedNode.difficulty}</span>
              <span className="detail-chip">{relationLabel}</span>
              <span className="detail-chip">{selectedNode.parentQuestionId ? (isKorean ? "꼬리질문" : "Follow-up") : t("questionTree.root")}</span>
            </div>
            <div className="question-tree-inspector__stats">
              <article>
                <span>{isKorean ? "마스터리 점수" : "Mastery score"}</span>
                <strong>{scoreLabel}/100</strong>
              </article>
              <article>
                <span>{isKorean ? "최근 시도" : "Last attempt"}</span>
                <strong>{attemptLabel}</strong>
              </article>
              <article>
                <span>{isKorean ? "최고 점수" : "Best score"}</span>
                <strong>{bestScoreLabel}/100</strong>
              </article>
            </div>
            <div className="question-map-inspector__tabs">
              <button className="question-map-inspector__tab question-map-inspector__tab--active" type="button">
                {isKorean ? "개요" : "Overview"}
              </button>
              <button className="question-map-inspector__tab" type="button">
                {isKorean ? `전체 경로 (${ancestry.length})` : `All paths (${ancestry.length})`}
              </button>
              <button className="question-map-inspector__tab" type="button">
                {isKorean ? `자식 질문 (${childNodes.length})` : `Children (${childNodes.length})`}
              </button>
            </div>
            <div className="question-tree-inspector__panels">
              <div className="question-tree-inspector__panel">
                <span>{isKorean ? "노드 의미" : "Node meaning"}</span>
                <p>
                  {selectedNode.isRoot
                    ? t("questionTree.rootMeaning")
                    : t("questionTree.childMeaning")}
                </p>
              </div>
              <div className="question-tree-inspector__panel">
                <span>{isKorean ? "관계 정보" : "Relationship"}</span>
                <p>{relationLabel}</p>
                <p>{selectedNode.parentQuestionId ? `${t("questionTree.parent")} #${selectedNode.parentQuestionId}` : t("questionTree.noParentNode")}</p>
              </div>
              <div className="question-tree-inspector__panel">
                <span>{isKorean ? "DFS 자식 질문" : "DFS child questions"}</span>
                {childNodes.length > 0 ? (
                  <div className="question-map-inspector__child-list">
                    {childNodes.map((child, index) => (
                      <article className="question-map-inspector__child-item" key={child.id}>
                        <span>{index + 1}</span>
                        <div>
                          <strong>{child.title}</strong>
                          <p>{child.difficulty} · {child.relationshipType ?? t("questionTree.node")}</p>
                        </div>
                      </article>
                    ))}
                  </div>
                ) : (
                  <p>{isKorean ? "이 노드 아래에 더 내려갈 자식 질문이 아직 없습니다." : "There are no deeper child questions under this node yet."}</p>
                )}
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
            <div className="question-map-inspector__cta">
              <Link className="primary-button" to={routeConfig.answerEditor.buildPath({ questionId: selectedNode.id })}>
                {isKorean ? "이 경로 시작" : "Start this path"}
              </Link>
            </div>
          </aside>
        ) : null}
      </div>
    </section>
  );
}

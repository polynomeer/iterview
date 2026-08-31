import { useParams } from "react-router-dom";
import { useQuestionDetailQuery } from "../../features/question/api/useQuestionDetailQuery";
import { useQuestionTreeQuery } from "../../features/question/api/useQuestionTreeQuery";
import { getErrorDetails } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import { useLocale } from "../../shared/i18n";
import { QuestionTreeView } from "../../widgets/question-tree/QuestionTreeView";

export function QuestionTreePage() {
  const { questionId } = useParams<{ questionId: string }>();
  const { locale, t } = useLocale();
  const isKorean = locale === "ko";
  const questionDetailQuery = useQuestionDetailQuery(questionId);
  const questionTreeQuery = useQuestionTreeQuery(questionId);
  const totalNodes = questionTreeQuery.data?.nodes.length ?? 0;
  const deepestDepth = questionTreeQuery.data?.nodes.reduce((max, node) => Math.max(max, node.depth), 0) ?? 0;
  const followupCount = questionTreeQuery.data?.nodes.filter((node) => !node.isRoot).length ?? 0;
  const relationshipCount = questionTreeQuery.data
    ? new Set(questionTreeQuery.data.nodes.map((node) => node.relationshipType).filter(Boolean)).size
    : 0;

  if (!questionId) {
    return (
      <PageContainer
        description={t("questionTree.missingDescription")}
        eyebrow={t("questionTree.pageEyebrow")}
        title={t("questionTree.missingTitle")}
      >
        <EmptyStateCard
          action={{
            label: t("questionTree.openPractice"),
            to: routeConfig.practice.buildPath(),
          }}
          body={t("questionTree.missingCardBody")}
          title={t("questionTree.missingCardTitle")}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      description={t("questionTree.workspaceBodyShort")}
      eyebrow={t("questionTree.pageEyebrow")}
      title={t("questionTree.workspaceTitleShort")}
    >
      {questionDetailQuery.isLoading || questionTreeQuery.isLoading ? (
        <LoadingStateCard
          body={t("questionTree.loadingBody")}
          title={t("questionTree.loadingTitle")}
        />
      ) : null}

      {questionDetailQuery.isError ? (
        <ErrorStateCard
          body={
            questionDetailQuery.error instanceof Error
              ? questionDetailQuery.error.message
              : t("questionTree.rootLoadErrorBody")
          }
          details={getErrorDetails(questionDetailQuery.error)}
          onAction={() => {
            void questionDetailQuery.refetch();
          }}
          title={t("questionTree.rootLoadErrorTitle")}
        />
      ) : null}

      {questionTreeQuery.isError ? (
        <ErrorStateCard
          body={
            questionTreeQuery.error instanceof Error
              ? questionTreeQuery.error.message
              : t("questionTree.treeLoadErrorBody")
          }
          details={getErrorDetails(questionTreeQuery.error)}
          onAction={() => {
            void questionTreeQuery.refetch();
          }}
          title={t("questionTree.treeLoadErrorTitle")}
        />
      ) : null}

      {!questionTreeQuery.isLoading &&
      !questionTreeQuery.isError &&
      questionTreeQuery.data &&
      questionTreeQuery.data.nodes.length === 0 ? (
        <EmptyStateCard
          action={{
            label: t("questionTree.backToQuestionDetail"),
            to: routeConfig.questionDetail.buildPath({ questionId }),
          }}
          body={t("questionTree.emptyBody")}
          title={t("questionTree.emptyTitle")}
        />
      ) : null}

      {!questionDetailQuery.isLoading &&
      !questionDetailQuery.isError &&
      questionDetailQuery.data &&
      !questionTreeQuery.isLoading &&
      !questionTreeQuery.isError &&
      questionTreeQuery.data ? (
        <div className="page-stack">
          <section className="page-card question-tree-workspace-surface">
            <div className="question-tree-workspace-surface__header">
              <div className="question-tree-workspace-surface__intro">
                <div className="question-tree-workspace-surface__eyebrow-row">
                  <span className="page-card__label">{isKorean ? "질문 맵" : "Question map"}</span>
                  <span className="question-status-badge question-status-badge--accent">{isKorean ? "DFS 준비됨" : "DFS ready"}</span>
                </div>
                <p className="question-tree-workspace-surface__breadcrumbs">
                  {questionDetailQuery.data.category}
                  <span>/</span>
                  {isKorean ? "질문 맵" : "Question map"}
                  <span>/</span>
                  {isKorean ? "분기 탐색" : "Branch traversal"}
                </p>
                <h2 className="question-tree-workspace-surface__title">
                  {isKorean ? "질문 트리를 깊이우선으로 읽는 맵 작업공간" : "A map workspace for reading the question tree depth-first"}
                </h2>
                <p className="question-tree-workspace-surface__body">
                  {isKorean
                    ? "중앙 맵에서 현재 분기와 연결 구조를 보고, 우측 디테일 레일에서 어떤 노드부터 방어할지 판단하세요."
                    : "Use the center map to read the active branch and connections, then decide from the right rail which node to defend first."}
                </p>
              </div>
              <div className="question-tree-workspace-surface__stats">
                <article className="question-tree-workspace-surface__stat">
                  <span>{t("questionTree.nodes")}</span>
                  <strong>{totalNodes}</strong>
                </article>
                <article className="question-tree-workspace-surface__stat">
                  <span>{t("questionTree.followups")}</span>
                  <strong>{followupCount}</strong>
                </article>
                <article className="question-tree-workspace-surface__stat">
                  <span>{t("questionTree.deepestDepth")}</span>
                  <strong>{deepestDepth}</strong>
                </article>
                <article className="question-tree-workspace-surface__stat">
                  <span>{t("questionTree.relations")}</span>
                  <strong>{relationshipCount}</strong>
                </article>
              </div>
            </div>
            <div className="question-tree-workspace-surface__guidance">
              <article className="question-tree-workspace-surface__guidance-card">
                <span>{isKorean ? "탐색 규칙" : "Traversal rule"}</span>
                <strong>{isKorean ? "루트 질문을 고정한 뒤, 자식 질문을 한 분기씩 끝까지 내려갑니다." : "Keep the root fixed, then descend one child branch at a time."}</strong>
              </article>
              <article className="question-tree-workspace-surface__guidance-card">
                <span>{isKorean ? "취약 분기 감시" : "Weak branch watch"}</span>
                <strong>{isKorean ? "점수가 낮거나 재도전이 필요한 노드는 우측 레일에서 바로 다시 답변 경로로 넘깁니다." : "Push weaker or retry-prone nodes directly into the answer flow from the right rail."}</strong>
              </article>
            </div>
          </section>
          <section className="page-card question-tree-root-brief">
            <div className="question-tree-root-brief__topline">
              <span className="page-card__label">{isKorean ? "루트 질문" : "Root question"}</span>
              <span className="question-status-badge">{t("questionTree.rootNode")}</span>
            </div>
            <h2 className="page-card__title">{questionDetailQuery.data.title}</h2>
            <p className="page-card__body">
              {isKorean
                ? "이 루트 질문을 기준으로 하위 꼬리질문이 어떻게 이어지는지 맵에서 확인하고, 각 분기를 개별 방어 단위로 관리합니다."
                : "Use this root prompt as the anchor, inspect how follow-ups branch beneath it, and manage each branch as its own defense unit."}
            </p>
            <div className="question-tree-root-brief__supporting">
              <article className="question-tree-root-brief__supporting-item">
                <span>{t("questionTree.category")}</span>
                <strong>{questionDetailQuery.data.category}</strong>
              </article>
              <article className="question-tree-root-brief__supporting-item">
                <span>{t("questionTree.difficulty")}</span>
                <strong>{questionDetailQuery.data.difficulty}</strong>
              </article>
            </div>
          </section>
          <QuestionTreeView tree={questionTreeQuery.data} />
        </div>
      ) : null}
    </PageContainer>
  );
}

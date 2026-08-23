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
  const { t } = useLocale();
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
      description={t("questionTree.pageDescription")}
      eyebrow={t("questionTree.pageEyebrow")}
      title={t("questionTree.pageTitle")}
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
                  <span className="page-card__label">Question map</span>
                  <span className="question-status-badge question-status-badge--accent">DFS ready</span>
                </div>
                <p className="question-tree-workspace-surface__breadcrumbs">
                  Root prompt
                  <span>/</span>
                  Follow-up hierarchy
                  <span>/</span>
                  Branch coverage
                </p>
                <h2 className="question-tree-workspace-surface__title">Question tree workspace</h2>
                <p className="question-tree-workspace-surface__body">
                  Keep the full branching map in view so each answer can be traced back to what it unlocks next,
                  what it depends on, and where the resume-backed source of truth still looks weak.
                </p>
              </div>
              <div className="question-tree-workspace-surface__stats">
                <article className="question-tree-workspace-surface__stat">
                  <span>Nodes</span>
                  <strong>{totalNodes}</strong>
                </article>
                <article className="question-tree-workspace-surface__stat">
                  <span>Follow-ups</span>
                  <strong>{followupCount}</strong>
                </article>
                <article className="question-tree-workspace-surface__stat">
                  <span>Deepest depth</span>
                  <strong>{deepestDepth}</strong>
                </article>
                <article className="question-tree-workspace-surface__stat">
                  <span>Relations</span>
                  <strong>{relationshipCount}</strong>
                </article>
              </div>
            </div>
            <div className="question-tree-workspace-surface__guidance">
              <article className="question-tree-workspace-surface__guidance-card">
                <span>Traversal rule</span>
                <strong>Read every node as a DFS checkpoint, not a loose list of follow-ups.</strong>
              </article>
              <article className="question-tree-workspace-surface__guidance-card">
                <span>Weak line watch</span>
                <strong>Any vague answer here becomes the branch the next question is most likely to attack.</strong>
              </article>
            </div>
          </section>
          <section className="page-card question-tree-root-brief">
            <div className="question-tree-root-brief__topline">
              <span className="page-card__label">{t("questionTree.rootQuestionLabel")}</span>
              <span className="question-status-badge">Root node</span>
            </div>
            <h2 className="page-card__title">{questionDetailQuery.data.title}</h2>
            <p className="page-card__body">{t("questionTree.rootQuestionBody")}</p>
            <div className="question-tree-root-brief__supporting">
              <article className="question-tree-root-brief__supporting-item">
                <span>Category</span>
                <strong>{questionDetailQuery.data.category}</strong>
              </article>
              <article className="question-tree-root-brief__supporting-item">
                <span>Difficulty</span>
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

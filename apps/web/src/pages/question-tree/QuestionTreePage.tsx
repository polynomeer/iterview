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
          <section className="page-card">
            <span className="page-card__label">{t("questionTree.rootQuestionLabel")}</span>
            <h2 className="page-card__title">{questionDetailQuery.data.title}</h2>
            <p className="page-card__body">{t("questionTree.rootQuestionBody")}</p>
          </section>
          <QuestionTreeView tree={questionTreeQuery.data} />
        </div>
      ) : null}
    </PageContainer>
  );
}

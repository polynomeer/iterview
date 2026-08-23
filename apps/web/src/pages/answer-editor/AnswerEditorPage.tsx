import { Link, useNavigate, useParams } from "react-router-dom";
import { useState } from "react";
import { useSubmitAnswerMutation } from "../../features/answer/api/useSubmitAnswerMutation";
import { useAnswerDraft } from "../../features/answer/model/useAnswerDraft";
import { useQuestionDetailQuery } from "../../features/question/api/useQuestionDetailQuery";
import { useResumeListQuery } from "../../features/resume/api/useResumeListQuery";
import { getActiveResumeVersionId } from "../../entities/resume/model";
import { useQuestionTreeQuery } from "../../features/question/api/useQuestionTreeQuery";
import { routeConfig } from "../../shared/config/routes";
import { getErrorDetails } from "../../shared/api/errors";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { SectionPanel, useLayoutMode } from "../../shared/ui/layout";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import { useLocale } from "../../shared/i18n";
import { AnswerEditorDesktopLayout, AnswerEditorMobileLayout } from "./AnswerEditorLayouts";
import { AnswerTextEditor, QuestionPromptCard, SubmitActionBar } from "../../widgets/answer";

export function AnswerEditorPage() {
  const navigate = useNavigate();
  const { questionId } = useParams<{ questionId: string }>();
  const { isDesktop } = useLayoutMode();
  const questionDetailQuery = useQuestionDetailQuery(questionId);
  const questionTreeQuery = useQuestionTreeQuery(questionId);
  const resumeListQuery = useResumeListQuery();
  const submitAnswerMutation = useSubmitAnswerMutation();
  const { draft, setDraft, clearDraft } = useAnswerDraft(questionId);
  const { t } = useLocale();
  const [hasTriedSubmit, setHasTriedSubmit] = useState(false);
  const trimmedDraft = draft.trim();
  const validationMessage =
    hasTriedSubmit && trimmedDraft.length === 0
      ? t("answer.validationWriteResponse")
      : null;
  const activeResumeVersionId = getActiveResumeVersionId(resumeListQuery.data);
  const resumeValidationMessage =
    null;

  async function handleSubmit() {
    setHasTriedSubmit(true);

    if (!questionId || trimmedDraft.length === 0) {
      return;
    }

    const response = await submitAnswerMutation.mutateAsync({
      questionId,
      resumeVersionId: activeResumeVersionId,
      contentText: trimmedDraft,
    });

    clearDraft();
    navigate(routeConfig.resultAnalysis.buildPath({ answerAttemptId: String(response.answerAttemptId) }));
  }

  const submitErrorMessage =
    submitAnswerMutation.error instanceof Error
      ? submitAnswerMutation.error.message
      : resumeListQuery.error instanceof Error
        ? resumeListQuery.error.message
        : null;
  const submitErrorDetails =
    submitAnswerMutation.error instanceof Error
      ? getErrorDetails(submitAnswerMutation.error)
      : resumeListQuery.error instanceof Error
        ? getErrorDetails(resumeListQuery.error)
        : [];
  const submitInfoMessage =
    !resumeListQuery.isLoading && !resumeListQuery.isError && !activeResumeVersionId
      ? t("answer.noActiveResumeInfo")
      : null;

  if (!questionId) {
    return (
      <PageContainer
        description={t("answer.missingDescription")}
        eyebrow={t("answer.pageEyebrow")}
        title={t("answer.missingTitle")}
      >
        <EmptyStateCard
          action={{
            label: t("common.backToPractice"),
            to: routeConfig.practice.buildPath(),
          }}
          body={t("answer.noQuestionBody")}
          title={t("answer.noQuestionTitle")}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      description={t("answer.pageDescription")}
      eyebrow={t("answer.pageEyebrow")}
      title={t("answer.pageTitle")}
    >
      {questionDetailQuery.isLoading ? (
        <LoadingStateCard
          body={t("answer.loadingBody")}
          title={t("answer.loadingTitle")}
        />
      ) : null}

      {questionDetailQuery.isError ? (
        <ErrorStateCard
          body={
            questionDetailQuery.error instanceof Error
              ? questionDetailQuery.error.message
              : t("answer.loadErrorBody")
          }
          details={getErrorDetails(questionDetailQuery.error)}
          onAction={() => {
            void questionDetailQuery.refetch();
          }}
          title={t("answer.loadErrorTitle")}
        />
      ) : null}

      {!questionDetailQuery.isLoading && !questionDetailQuery.isError && questionDetailQuery.data === null ? (
        <EmptyStateCard
          action={{
            label: t("common.backToPractice"),
            to: routeConfig.practice.buildPath(),
          }}
          body={t("answer.unavailableBody")}
          title={t("answer.unavailableTitle")}
        />
      ) : null}

      {!questionDetailQuery.isLoading && !questionDetailQuery.isError && questionDetailQuery.data ? (
        (() => {
          const supportCount =
            questionDetailQuery.data.learningMaterials.length +
            (questionDetailQuery.data.relatedSkills ?? []).length;
          const treeNodeCount = questionTreeQuery.data?.nodes.length ?? 0;
          const workspaceSummary = (
            <section className="page-card answer-editor-workspace-surface">
              <div className="answer-editor-workspace-surface__header">
                <div className="answer-editor-workspace-surface__intro">
                  <div className="answer-editor-workspace-surface__eyebrow-row">
                    <span className="page-card__label">Answer workspace</span>
                    <span className="question-status-badge question-status-badge--accent">
                      Draft lane
                    </span>
                  </div>
                  <p className="answer-editor-workspace-surface__breadcrumbs">
                    Prompt context
                    <span>/</span>
                    Evidence anchor
                    <span>/</span>
                    Submission decision
                  </p>
                  <h2 className="answer-editor-workspace-surface__title">Write one answer the next follow-up cannot easily break</h2>
                  <p className="answer-editor-workspace-surface__body">
                    Keep the current node, the active resume context, and the follow-up tree close enough that the draft
                    stays specific instead of drifting into generic interview language.
                  </p>
                </div>
                <div className="answer-editor-workspace-surface__stats">
                  <article className="answer-editor-workspace-surface__stat">
                    <span>Draft chars</span>
                    <strong>{trimmedDraft.length || 0}</strong>
                  </article>
                  <article className="answer-editor-workspace-surface__stat">
                    <span>Resume source</span>
                    <strong>{activeResumeVersionId ? "Resume linked" : t("common.optional")}</strong>
                  </article>
                  <article className="answer-editor-workspace-surface__stat">
                    <span>Tree nodes</span>
                    <strong>{treeNodeCount}</strong>
                  </article>
                  <article className="answer-editor-workspace-surface__stat">
                    <span>Support items</span>
                    <strong>{supportCount}</strong>
                  </article>
                </div>
              </div>
              <div className="answer-editor-workspace-surface__chips">
                <span className="detail-chip">{questionDetailQuery.data.difficulty}</span>
                {(questionDetailQuery.data.relatedSkills ?? []).slice(0, 3).map((skill) => (
                  <span className="detail-chip detail-chip--accent" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          );
          const promptSection = <QuestionPromptCard question={questionDetailQuery.data} />;
          const editorSection = (
            <AnswerTextEditor
              disabled={submitAnswerMutation.isPending}
              mode="workspace"
              onChange={setDraft}
              value={draft}
            />
          );
          const submitSection = (
            <SubmitActionBar
              errorMessage={submitErrorMessage}
              errorDetails={submitErrorDetails}
              infoMessage={submitInfoMessage}
              isPending={submitAnswerMutation.isPending}
              isSubmitDisabled={trimmedDraft.length === 0}
              onSubmit={() => {
                void handleSubmit();
              }}
              validationMessage={validationMessage ?? resumeValidationMessage}
            />
          );
          const contextSection = (
              <SectionPanel as="aside" className="answer-editor-context" variant="muted">
                <span className="page-card__label">{t("answer.contextLabel")}</span>
                <h2 className="page-card__title">Keep decision context beside the draft</h2>
                <div className="stats-grid">
                  <article className="stat-tile">
                    <p className="stat-tile__label">{t("answer.resumeStatus")}</p>
                    <strong className="stat-tile__value stat-tile__value--small">
                    {resumeListQuery.isLoading
                      ? t("common.loading")
                      : activeResumeVersionId
                        ? t("answer.activeVersionReady")
                        : t("common.optional")}
                  </strong>
                </article>
                <article className="stat-tile">
                  <p className="stat-tile__label">{t("answer.draftLength")}</p>
                  <strong className="stat-tile__value stat-tile__value--small">
                    {trimmedDraft.length > 0 ? `${trimmedDraft.length} ${t("answer.chars")}` : t("answer.emptyDraft")}
                  </strong>
                </article>
                <article className="stat-tile">
                  <p className="stat-tile__label">{t("answer.relatedSkills")}</p>
                  <strong className="stat-tile__value stat-tile__value--small">
                    {(questionDetailQuery.data.relatedSkills ?? []).length > 0
                      ? (questionDetailQuery.data.relatedSkills ?? []).length
                      : t("common.none")}
                  </strong>
                </article>
                <article className="stat-tile">
                  <p className="stat-tile__label">{t("answer.treeNodes")}</p>
                  <strong className="stat-tile__value stat-tile__value--small">
                    {questionTreeQuery.data ? String(questionTreeQuery.data.nodes.length) : "-"}
                  </strong>
                </article>
                </div>
                <p className="page-card__body">
                  {t("answer.contextBody")}
                </p>
                <div className="answer-editor-context__rules">
                  <div className="answer-editor-context__rule">
                    <strong>1. Claim</strong>
                    <span>Answer the exact prompt before expanding into background.</span>
                  </div>
                  <div className="answer-editor-context__rule">
                    <strong>2. Evidence</strong>
                    <span>Anchor at least one concrete fact, number, or constraint from your real work.</span>
                  </div>
                  <div className="answer-editor-context__rule">
                    <strong>3. Next branch</strong>
                    <span>Write as if the next follow-up will test the weakest unsupported line.</span>
                  </div>
                </div>
                <div className="page-card__actions">
                  <Link
                    className="secondary-button"
                    to={routeConfig.questionTree.buildPath({ questionId })}
                  >
                    {t("answer.openFollowUpTree")}
                  </Link>
                </div>
              </SectionPanel>
          );

          if (!isDesktop) {
            return (
              <AnswerEditorMobileLayout
                workspaceSummary={workspaceSummary}
                contextSection={contextSection}
                editorSection={editorSection}
                promptSection={promptSection}
                submitSection={submitSection}
              />
            );
          }

          return (
            <AnswerEditorDesktopLayout
              workspaceSummary={workspaceSummary}
              contextSection={contextSection}
              editorSection={editorSection}
              promptSection={promptSection}
              submitSection={submitSection}
            />
          );
        })()
      ) : null}
    </PageContainer>
  );
}

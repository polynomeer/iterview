import { useState } from "react";
import { useParams } from "react-router-dom";
import { useQuestionDetailQuery } from "../../features/question/api/useQuestionDetailQuery";
import { routeConfig } from "../../shared/config/routes";
import { useQuestionAnswerHistoryQuery } from "../../features/question/api/useQuestionAnswerHistoryQuery";
import { useRecommendedFollowupsQuery } from "../../features/question/api/useRecommendedFollowupsQuery";
import { useResumeBasedQuestionsQuery } from "../../features/question/api/useResumeBasedQuestionsQuery";
import { useQuestionReferenceAnswersQuery } from "../../features/question/api/useQuestionReferenceAnswersQuery";
import { useQuestionLearningMaterialsQuery } from "../../features/question/api/useQuestionLearningMaterialsQuery";
import { useCreateQuestionReferenceAnswerMutation } from "../../features/question/api/useCreateQuestionReferenceAnswerMutation";
import { useCreateQuestionLearningMaterialMutation } from "../../features/question/api/useCreateQuestionLearningMaterialMutation";
import {
  mapLearningMaterialsToModel,
  mapRecommendedQuestionsToModel,
  mapReferenceAnswersToModel,
} from "../../entities/question/model";
import { ApiClientError, getErrorDetails } from "../../shared/api/errors";
import { AuthRequiredStateCard } from "../../shared/ui/AuthRequiredStateCard";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { FeedbackNotice } from "../../shared/ui/FeedbackNotice";
import { useLayoutMode } from "../../shared/ui/layout";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { PageContainer } from "../../shared/ui/PageContainer";
import { SectionEmptyState } from "../../shared/ui/SectionEmptyState";
import { useAuth } from "../../shared/auth/useAuth";
import { useLocale } from "../../shared/i18n";
import { QuestionDetailDesktopLayout, QuestionDetailMobileLayout } from "./QuestionDetailLayouts";
import {
  AnswerHistorySection,
  LearningMaterialsSection,
  ProgressSummaryCard,
  QuestionHeader,
  QuestionMetaSection,
  RecommendedQuestionSection,
  ReferenceAnswersSection,
} from "../../widgets/question";

function mergeById<T extends { id: string }>(primary: T[], fallback: T[]) {
  const merged = new Map<string, T>();

  [...primary, ...fallback].forEach((item) => {
    merged.set(item.id, item);
  });

  return [...merged.values()];
}

export function QuestionDetailPage() {
  const { questionId } = useParams<{ questionId: string }>();
  const { isDesktop } = useLayoutMode();
  const { t } = useLocale();
  const questionDetailQuery = useQuestionDetailQuery(questionId);
  const answerHistoryQuery = useQuestionAnswerHistoryQuery(questionId);
  const followupsQuery = useRecommendedFollowupsQuery(questionId);
  const resumeBasedQuery = useResumeBasedQuestionsQuery();
  const createReferenceAnswerMutation = useCreateQuestionReferenceAnswerMutation();
  const createLearningMaterialMutation = useCreateQuestionLearningMaterialMutation();
  const [isReferenceComposerOpen, setIsReferenceComposerOpen] = useState(false);
  const [isLearningComposerOpen, setIsLearningComposerOpen] = useState(false);
  const [referenceSubmitError, setReferenceSubmitError] = useState<string | null>(null);
  const [learningSubmitError, setLearningSubmitError] = useState<string | null>(null);
  const [referenceForm, setReferenceForm] = useState({
    title: "",
    answerText: "",
    answerFormat: "outline",
  });
  const [learningForm, setLearningForm] = useState({
    title: "",
    materialType: "",
    description: "",
    contentText: "",
    contentUrl: "",
    sourceName: "",
    difficultyLevel: "",
    estimatedMinutes: "",
    relationshipType: "",
    labelOverride: "",
    relevanceScore: "",
  });
  const referenceAnswersQuery = useQuestionReferenceAnswersQuery(
    questionId,
    Boolean(questionId) && !questionDetailQuery.isLoading && !questionDetailQuery.data?.referenceAnswers.length,
  );
  const learningMaterialsQuery = useQuestionLearningMaterialsQuery(
    questionId,
    Boolean(questionId) && !questionDetailQuery.isLoading && !questionDetailQuery.data?.learningMaterials.length,
  );
  const { isAuthenticated } = useAuth();
  const isAnswerHistoryUnauthorized =
    answerHistoryQuery.error instanceof ApiClientError && answerHistoryQuery.error.status === 401;

  const handleReferenceFormChange = (field: "title" | "answerText" | "answerFormat", value: string) => {
    setReferenceForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleLearningFormChange = (field: string, value: string) => {
    setLearningForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  async function handleReferenceSubmit() {
    if (!questionId) {
      return;
    }

    const title = referenceForm.title.trim();
    const answerText = referenceForm.answerText.trim();

    if (!title || !answerText) {
      setReferenceSubmitError(t("question.referenceAnswerValidation"));
      return;
    }

    setReferenceSubmitError(null);

    try {
      await createReferenceAnswerMutation.mutateAsync({
        questionId,
        body: {
          title,
          answerText,
          answerFormat: referenceForm.answerFormat.trim() || "outline",
        },
      });
      setReferenceForm({
        title: "",
        answerText: "",
        answerFormat: "outline",
      });
      setIsReferenceComposerOpen(false);
    } catch (error) {
      setReferenceSubmitError(
        error instanceof Error ? error.message : t("question.referenceAnswerSaveError"),
      );
    }
  }

  async function handleLearningMaterialSubmit() {
    if (!questionId) {
      return;
    }

    const title = learningForm.title.trim();
    const materialType = learningForm.materialType.trim();
    const contentText = learningForm.contentText.trim();
    const contentUrl = learningForm.contentUrl.trim();

    if (!title || !materialType) {
      setLearningSubmitError(t("question.learningMaterialValidationRequired"));
      return;
    }

    if (!contentText && !contentUrl) {
      setLearningSubmitError(t("question.learningMaterialValidationContent"));
      return;
    }

    setLearningSubmitError(null);

    try {
      await createLearningMaterialMutation.mutateAsync({
        questionId,
        body: {
          title,
          materialType,
          description: learningForm.description.trim() || undefined,
          contentText: contentText || undefined,
          contentUrl: contentUrl || undefined,
          sourceName: learningForm.sourceName.trim() || undefined,
          difficultyLevel: learningForm.difficultyLevel.trim() || undefined,
          estimatedMinutes: learningForm.estimatedMinutes
            ? Number(learningForm.estimatedMinutes)
            : undefined,
          relationshipType: learningForm.relationshipType.trim() || undefined,
          labelOverride: learningForm.labelOverride.trim() || undefined,
          relevanceScore: learningForm.relevanceScore ? Number(learningForm.relevanceScore) : undefined,
        },
      });
      setLearningForm({
        title: "",
        materialType: "",
        description: "",
        contentText: "",
        contentUrl: "",
        sourceName: "",
        difficultyLevel: "",
        estimatedMinutes: "",
        relationshipType: "",
        labelOverride: "",
        relevanceScore: "",
      });
      setIsLearningComposerOpen(false);
    } catch (error) {
      setLearningSubmitError(
        error instanceof Error ? error.message : t("question.learningMaterialSaveError"),
      );
    }
  }

  if (!questionId) {
    return (
      <PageContainer
        description="The requested question could not be identified from the current route."
        eyebrow="Question Detail"
        title="Question not found"
      >
        <EmptyStateCard
          action={{
            label: "Browse practice questions",
            to: routeConfig.practice.buildPath(),
          }}
          body="Open the practice list and choose a question to view its full details."
          title="Missing question id"
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      description="Review the full prompt, metadata, learning support, and your current progress before starting an answer."
      eyebrow="Question Detail"
      title="Question detail"
    >
      {questionDetailQuery.isLoading ? (
        <LoadingStateCard
          body="Loading the question prompt, related metadata, learning materials, and progress summary."
          title="Preparing question detail"
        />
      ) : null}

      {questionDetailQuery.isError ? (
        <ErrorStateCard
          body={
            questionDetailQuery.error instanceof Error
              ? questionDetailQuery.error.message
              : "The question detail screen could not be loaded."
          }
          details={getErrorDetails(questionDetailQuery.error)}
          onAction={() => {
            void questionDetailQuery.refetch();
          }}
          title="Unable to load question detail"
        />
      ) : null}

      {!questionDetailQuery.isLoading && !questionDetailQuery.isError && questionDetailQuery.data === null ? (
        <EmptyStateCard
          action={{
            label: "Browse practice questions",
            to: routeConfig.practice.buildPath(),
          }}
          body="This question is not available right now."
          title="Question not found"
        />
      ) : null}

      {!questionDetailQuery.isLoading && !questionDetailQuery.isError && questionDetailQuery.data
        ? (() => {
            const progressSection = questionDetailQuery.data.userProgressSummary ? (
              <ProgressSummaryCard progress={questionDetailQuery.data.userProgressSummary} />
            ) : (
              <SectionEmptyState
                body="You have not started this question yet. Begin an answer to create your first progress summary."
                label="Progress"
                title="No progress summary yet"
              />
            );

            const answerHistorySection = !isAuthenticated ? (
              <AuthRequiredStateCard
                body="Login to see your personal answer history for this question."
                title="Your answer history is available after sign-in"
              />
            ) : answerHistoryQuery.isLoading ? (
              <LoadingStateCard
                body="Loading your recent attempts for this question."
                label="Answer history"
                title="Preparing your answer history"
              />
            ) : answerHistoryQuery.isError && isAnswerHistoryUnauthorized ? (
              <AuthRequiredStateCard
                body="Login again to see your personal answer history for this question."
                title="Your answer history is available after sign-in"
              />
            ) : answerHistoryQuery.isError ? (
              <ErrorStateCard
                body={
                  answerHistoryQuery.error instanceof Error
                    ? answerHistoryQuery.error.message
                    : "The answer history could not be loaded."
                }
                details={getErrorDetails(answerHistoryQuery.error)}
                onAction={() => {
                  void answerHistoryQuery.refetch();
                }}
                title="Unable to load answer history"
              />
            ) : answerHistoryQuery.data && answerHistoryQuery.data.items.length > 0 ? (
              <AnswerHistorySection history={answerHistoryQuery.data} />
            ) : (
              <SectionEmptyState
                body="You have not submitted any answers for this question yet."
                label="Answer history"
                title="No answer history yet"
              />
            );

            const referenceAnswers = mergeById(
              questionDetailQuery.data.referenceAnswers,
              mapReferenceAnswersToModel(referenceAnswersQuery.data),
            );
            const learningMaterials = mergeById(
              questionDetailQuery.data.learningMaterials,
              mapLearningMaterialsToModel(learningMaterialsQuery.data),
            );

            const referenceSection = referenceAnswersQuery.isLoading &&
              questionDetailQuery.data.referenceAnswers.length === 0 ? (
              <LoadingStateCard
                body="Loading curated answer examples for this question."
                label="Reference answers"
                title="Preparing study answers"
              />
            ) : referenceAnswersQuery.isError &&
              questionDetailQuery.data.referenceAnswers.length === 0 ? (
              <ErrorStateCard
                body={
                  referenceAnswersQuery.error instanceof Error
                    ? referenceAnswersQuery.error.message
                    : "Reference answers could not be loaded."
                }
                details={getErrorDetails(referenceAnswersQuery.error)}
                onAction={() => {
                  void referenceAnswersQuery.refetch();
                }}
                title="Unable to load reference answers"
              />
            ) : referenceAnswers.length > 0 || isAuthenticated ? (
              <ReferenceAnswersSection
                authHint={t("question.authHintReferenceAnswer")}
                canAdd={isAuthenticated}
                form={referenceForm}
                isComposerOpen={isReferenceComposerOpen}
                isSubmitting={createReferenceAnswerMutation.isPending}
                items={referenceAnswers}
                onFormChange={handleReferenceFormChange}
                onSubmit={handleReferenceSubmit}
                onToggleComposer={() => {
                  setReferenceSubmitError(null);
                  setIsReferenceComposerOpen((current) => !current);
                }}
                submitError={referenceSubmitError}
              />
            ) : (
              <SectionEmptyState
                body="No curated reference answers are linked to this question yet."
                label="Reference answers"
                title="No reference answers available"
              />
            );

            const materialsSection =
              learningMaterialsQuery.isLoading && questionDetailQuery.data.learningMaterials.length === 0 ? (
                <LoadingStateCard
                  body="Loading curated learning materials for this question."
                  label="Learning materials"
                  title="Preparing study materials"
                />
              ) : learningMaterialsQuery.isError && questionDetailQuery.data.learningMaterials.length === 0 ? (
                <ErrorStateCard
                  body={
                    learningMaterialsQuery.error instanceof Error
                      ? learningMaterialsQuery.error.message
                      : "Learning materials could not be loaded."
                  }
                  details={getErrorDetails(learningMaterialsQuery.error)}
                  onAction={() => {
                    void learningMaterialsQuery.refetch();
                  }}
                  title="Unable to load learning materials"
                />
              ) : learningMaterials.length > 0 || isAuthenticated ? (
                <LearningMaterialsSection
                  authHint={t("question.authHintLearningMaterial")}
                  canAdd={isAuthenticated}
                  form={learningForm}
                  isComposerOpen={isLearningComposerOpen}
                  isSubmitting={createLearningMaterialMutation.isPending}
                  materials={learningMaterials}
                  onFormChange={handleLearningFormChange}
                  onSubmit={handleLearningMaterialSubmit}
                  onToggleComposer={() => {
                    setLearningSubmitError(null);
                    setIsLearningComposerOpen((current) => !current);
                  }}
                  submitError={learningSubmitError}
                />
              ) : (
                <SectionEmptyState
                  body="No learning materials are linked to this question yet."
                  label="Learning materials"
                  title="No materials available"
                />
              );

            const recommendedItems = mapRecommendedQuestionsToModel(
              followupsQuery.data,
              resumeBasedQuery.data,
            ).filter((item) => item.id !== questionId);

            const recommendedSection =
              recommendedItems.length > 0 ? (
                <RecommendedQuestionSection items={recommendedItems} />
              ) : (
                <SectionEmptyState
                  body="No related or resume-based follow-up recommendations are available yet."
                  label="Recommended next"
                  title="No recommended questions"
                />
              );

            const progress = questionDetailQuery.data.userProgressSummary;
            const promptDensity = questionDetailQuery.data.body.split(/\s+/).filter(Boolean).length;
            const supportCount =
              referenceAnswers.length +
              learningMaterials.length +
              (answerHistoryQuery.data?.items.length ?? 0);
            const workspaceSummary = (
              <section className="page-card question-detail-workspace-surface">
                <div className="question-detail-workspace-surface__header">
                  <div className="question-detail-workspace-surface__intro">
                    <div className="question-detail-workspace-surface__eyebrow-row">
                      <span className="page-card__label">Question workspace</span>
                      <span className="question-status-badge question-status-badge--accent">
                        {questionDetailQuery.data.difficulty}
                      </span>
                    </div>
                    <p className="question-detail-workspace-surface__breadcrumbs">
                      {questionDetailQuery.data.category}
                      <span>/</span>
                      {questionDetailQuery.data.roles[0] ?? "Practice path"}
                      <span>/</span>
                      {questionDetailQuery.data.companies[0] ?? "Interview prep"}
                    </p>
                    <h2 className="question-detail-workspace-surface__title">Preparation snapshot</h2>
                    <p className="question-detail-workspace-surface__body">
                      {questionDetailQuery.data.title}. Read the prompt as a branch root, then keep evidence, model
                      answers, and prior attempts in view until the source of truth is explicit enough to defend under
                      follow-up pressure.
                    </p>
                  </div>
                  <div className="question-detail-workspace-surface__stats">
                    <article className="question-detail-workspace-surface__stat">
                      <span>Attempts</span>
                      <strong>{progress?.attemptsCount ?? 0}</strong>
                    </article>
                    <article className="question-detail-workspace-surface__stat">
                      <span>Best score</span>
                      <strong>{progress?.bestScoreLabel ?? "Not started"}</strong>
                    </article>
                    <article className="question-detail-workspace-surface__stat">
                      <span>Support items</span>
                      <strong>{supportCount}</strong>
                    </article>
                    <article className="question-detail-workspace-surface__stat">
                      <span>Prompt words</span>
                      <strong>{promptDensity}</strong>
                    </article>
                  </div>
                </div>
                <div className="question-detail-workspace-surface__chips">
                  {questionDetailQuery.data.tags.slice(0, 4).map((tag) => (
                    <span className="detail-chip" key={tag}>
                      {`Topic ${tag}`}
                    </span>
                  ))}
                  {questionDetailQuery.data.companies.slice(0, 3).map((company) => (
                    <span className="detail-chip detail-chip--accent" key={company}>
                      {`Company ${company}`}
                    </span>
                  ))}
                </div>
              </section>
            );

            if (!isDesktop) {
              return (
                <QuestionDetailMobileLayout
                  workspaceSummary={workspaceSummary}
                  answerHistorySection={answerHistorySection}
                  headerSection={<QuestionHeader question={questionDetailQuery.data} />}
                  materialsSection={
                    <>
                      {referenceSection}
                      {referenceAnswersQuery.isError && questionDetailQuery.data.referenceAnswers.length > 0 ? (
                        <FeedbackNotice
                          message="Reference answers were shown from the question detail payload while the dedicated study endpoint failed."
                          tone="info"
                        />
                      ) : null}
                      {materialsSection}
                      {learningMaterialsQuery.isError && questionDetailQuery.data.learningMaterials.length > 0 ? (
                        <FeedbackNotice
                          message="Learning materials were shown from the question detail payload while the dedicated study endpoint failed."
                          tone="info"
                        />
                      ) : null}
                    </>
                  }
                  metadataSection={<QuestionMetaSection question={questionDetailQuery.data} />}
                  progressSection={progressSection}
                  recommendedSection={recommendedSection}
                />
              );
            }

            return (
              <QuestionDetailDesktopLayout
                workspaceSummary={workspaceSummary}
                  answerHistorySection={answerHistorySection}
                  headerSection={<QuestionHeader question={questionDetailQuery.data} />}
                  materialsSection={
                    <>
                      {referenceSection}
                      {referenceAnswersQuery.isError && questionDetailQuery.data.referenceAnswers.length > 0 ? (
                        <FeedbackNotice
                          message="Reference answers were shown from the question detail payload while the dedicated study endpoint failed."
                          tone="info"
                        />
                      ) : null}
                      {materialsSection}
                      {learningMaterialsQuery.isError && questionDetailQuery.data.learningMaterials.length > 0 ? (
                        <FeedbackNotice
                          message="Learning materials were shown from the question detail payload while the dedicated study endpoint failed."
                          tone="info"
                        />
                      ) : null}
                    </>
                  }
                  metadataSection={<QuestionMetaSection question={questionDetailQuery.data} />}
                  progressSection={progressSection}
                  recommendedSection={recommendedSection}
              />
            );
          })()
        : null}
    </PageContainer>
  );
}

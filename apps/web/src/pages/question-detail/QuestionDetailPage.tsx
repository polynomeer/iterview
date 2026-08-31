import { useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
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
import { SectionPanel, useLayoutMode } from "../../shared/ui/layout";
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

function parseScoreLabel(scoreLabel?: string | null) {
  if (!scoreLabel) {
    return 0;
  }

  const parsed = Number.parseInt(scoreLabel, 10);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function QuestionDetailPage() {
  const { questionId } = useParams<{ questionId: string }>();
  const { isDesktop } = useLayoutMode();
  const { locale, t } = useLocale();
  const isKorean = locale === "ko";
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
        description={isKorean ? "현재 경로에서 요청한 질문을 식별할 수 없습니다." : "The requested question could not be identified from the current route."}
        eyebrow={isKorean ? "질문 상세" : "Question Detail"}
        title={isKorean ? "질문을 찾을 수 없습니다" : "Question not found"}
      >
        <EmptyStateCard
          action={{
            label: isKorean ? "연습 질문 보러가기" : "Browse practice questions",
            to: routeConfig.practice.buildPath(),
          }}
          body={isKorean ? "연습 목록을 열고 전체 상세를 볼 질문을 선택하세요." : "Open the practice list and choose a question to view its full details."}
          title={isKorean ? "질문 ID가 없습니다" : "Missing question id"}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      description={isKorean ? "다음 답변 시도를 쓰기 전에 현재 질문 노드, 보조 자료 묶음, 후속 질문 압박을 먼저 점검하세요." : "Inspect the active question node, its support stack, and follow-up pressure before spending the next answer attempt."}
      eyebrow={isKorean ? "노드 인스펙터" : "Node inspector"}
      title={isKorean ? "다음 답변 차례를 열기 전에 노드를 점검하세요" : "Inspect the node before opening the next answer pass"}
    >
      {questionDetailQuery.isLoading ? (
        <LoadingStateCard
          body={isKorean ? "질문 문구, 관련 메타데이터, 학습 자료, 진행 요약을 불러오는 중입니다." : "Loading the question prompt, related metadata, learning materials, and progress summary."}
          title={isKorean ? "질문 상세 준비 중" : "Preparing question detail"}
        />
      ) : null}

      {questionDetailQuery.isError ? (
        <ErrorStateCard
          body={
            questionDetailQuery.error instanceof Error
              ? questionDetailQuery.error.message
              : isKorean ? "질문 상세 화면을 불러올 수 없습니다." : "The question detail screen could not be loaded."
          }
          details={getErrorDetails(questionDetailQuery.error)}
          onAction={() => {
            void questionDetailQuery.refetch();
          }}
          title={isKorean ? "질문 상세를 불러올 수 없습니다" : "Unable to load question detail"}
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
            const question = questionDetailQuery.data;
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
                  body={isKorean ? "아직 관련 질문이나 이력서 기반 후속 추천이 없습니다." : "No related or resume-based follow-up recommendations are available yet."}
                  label={isKorean ? "추천 다음 질문" : "Recommended next"}
                  title={isKorean ? "추천 질문이 없습니다" : "No recommended questions"}
                />
              );

            const progress = questionDetailQuery.data.userProgressSummary;
            const promptDensity = questionDetailQuery.data.body.split(/\s+/).filter(Boolean).length;
            const supportCount =
              referenceAnswers.length +
              learningMaterials.length +
              (answerHistoryQuery.data?.items.length ?? 0);
            const recommendedCount = recommendedItems.length;
            const masteryScore = parseScoreLabel(progress?.bestScoreLabel);
            const weaknessSignal =
              progress?.status === "retry"
                ? isKorean ? "재시도 필요" : "Retry required"
                : (answerHistoryQuery.data?.items.length ?? 0) === 0
                  ? isKorean ? "미답변 노드" : "Unanswered node"
                  : supportCount < 3
                    ? isKorean ? "보조 근거 부족" : "Thin support"
                    : isKorean ? "안정된 가지" : "Stable branch";
            const pathNodes = [
              question.category,
              ...(question.tags.slice(0, 2).length > 0 ? question.tags.slice(0, 2) : question.companies.slice(0, 2)),
              question.title,
            ];
            const bestAttempt = answerHistoryQuery.data?.items[0] ?? null;
            const workspaceSummary = (
              <section className="page-card question-path-context-card">
                <div className="question-path-context-card__topline">
                  <span className="page-card__label">{isKorean ? "질문 경로 맥락" : "Question path context"}</span>
                  <span className="detail-chip detail-chip--accent">
                    {isKorean ? `깊이 ${Math.max(pathNodes.length, 2)}` : `Depth ${Math.max(pathNodes.length, 2)}`}
                  </span>
                </div>
                <div className="question-path-context-card__path question-path-context-card__path--vertical" role="list">
                  {pathNodes.map((node, index) => (
                    <div className="question-path-context-card__node-stack" key={`${node}-${index}`} role="listitem">
                      <article
                        className={`question-path-context-card__node ${index === pathNodes.length - 1 ? "question-path-context-card__node--active" : ""}`}
                      >
                        <strong>{node}</strong>
                        <span>
                          {index === pathNodes.length - 1
                            ? progress?.bestScoreLabel ?? (isKorean ? "미응답" : "Unanswered")
                            : `${Math.max(58, 74 - index * 6)}%`}
                        </span>
                      </article>
                      {index < pathNodes.length - 1 ? <i className="question-path-context-card__connector" aria-hidden="true" /> : null}
                    </div>
                  ))}
                </div>
                <div className="question-path-context-card__footer">
                  <span>{isKorean ? `분기 ${recommendedCount + 1}개 중 1개` : `Branch 1 of ${recommendedCount + 1}`}</span>
                  <Link className="secondary-button" to={routeConfig.questionTree.buildPath({ questionId })}>
                    {isKorean ? "질문 맵 열기" : "View in question map"}
                  </Link>
                </div>
              </section>
            );
            const insightSummary = (
              <section className="page-card question-inspector-rail-card">
                <div className="question-inspector-rail-card__header">
                  <div>
                    <span className="page-card__label">{isKorean ? "마스터리 점수" : "Mastery score"}</span>
                    <h2 className="page-card__title">
                      {progress?.bestScoreLabel ?? (isKorean ? "미응답 노드" : "Unanswered node")}
                    </h2>
                  </div>
                  <span className="detail-chip detail-chip--accent">{weaknessSignal}</span>
                </div>
                <div className="question-inspector-rail-card__mastery">
                  <div
                    className="question-inspector-rail-card__mastery-ring"
                    style={{ "--question-mastery-score": `${masteryScore}%` } as CSSProperties}
                  >
                    <strong>{masteryScore}</strong>
                    <span>/100</span>
                  </div>
                  <div className="question-inspector-rail-card__mastery-meta">
                    <article>
                      <span>{isKorean ? "내 평균" : "Your avg"}</span>
                      <strong>{progress?.bestScoreLabel ?? "0"}%</strong>
                    </article>
                    <article>
                      <span>{isKorean ? "상위 구간" : "Top band"}</span>
                      <strong>{masteryScore >= 80 ? "Top 20%" : masteryScore >= 65 ? "Top 35%" : isKorean ? "보강 필요" : "Needs work"}</strong>
                    </article>
                  </div>
                </div>
                <div className="question-inspector-rail-card__score-row">
                  <article>
                    <span>{isKorean ? "현재 최고" : "Best"}</span>
                    <strong>{progress?.bestScoreLabel ?? "0"}/100</strong>
                  </article>
                  <article>
                    <span>{isKorean ? "시도 수" : "Attempts"}</span>
                    <strong>{progress?.attemptsCount ?? 0}</strong>
                  </article>
                  <article>
                    <span>{isKorean ? "후속 가지" : "Follow-ups"}</span>
                    <strong>{recommendedCount}</strong>
                  </article>
                </div>
                <div className="question-inspector-rail-card__group">
                  <div className="question-inspector-rail-card__group-header">
                    <h3>{isKorean ? "최근 시도" : "Last attempts"}</h3>
                    <span>{Math.min(answerHistoryQuery.data?.items.length ?? 0, 3)}</span>
                  </div>
                  <div className="question-inspector-rail-card__attempts">
                    {(answerHistoryQuery.data?.items ?? []).slice(0, 3).map((item, index) => (
                      <article className="question-inspector-rail-card__attempt" key={item.answerAttemptId}>
                        <span>{index + 1}</span>
                        <div>
                          <strong>{item.submittedAtLabel}</strong>
                          <p>{item.totalScoreLabel ?? (isKorean ? "미평가" : "Pending review")}</p>
                        </div>
                      </article>
                    ))}
                    {(answerHistoryQuery.data?.items.length ?? 0) === 0 ? (
                      <article className="question-inspector-rail-card__attempt">
                        <span>1</span>
                        <div>
                          <strong>{isKorean ? "첫 시도 전" : "Before first attempt"}</strong>
                          <p>{isKorean ? "아직 저장된 답변 이력이 없습니다." : "No saved answer attempts yet."}</p>
                        </div>
                      </article>
                    ) : null}
                  </div>
                </div>
                <div className="question-inspector-rail-card__group">
                  <div className="question-inspector-rail-card__group-header">
                    <h3>{isKorean ? "관련 노트" : "Related notes"}</h3>
                    <span>{Math.min(learningMaterials.length, 2)}</span>
                  </div>
                  <div className="question-inspector-rail-card__stack">
                    {learningMaterials.slice(0, 2).map((material) => (
                      <article className="question-inspector-rail-card__item" key={material.id}>
                        <strong>{material.title}</strong>
                        <p>{material.description || material.resourceTypeLabel}</p>
                      </article>
                    ))}
                    {learningMaterials.length === 0 ? (
                      <article className="question-inspector-rail-card__item">
                        <strong>{isKorean ? "노트 없음" : "No notes yet"}</strong>
                        <p>{isKorean ? "이 노드에 연결된 학습 노트나 자료가 아직 없습니다." : "There are no linked study notes for this node yet."}</p>
                      </article>
                    ) : null}
                  </div>
                </div>
                <div className="question-inspector-rail-card__group">
                  <div className="question-inspector-rail-card__group-header">
                    <h3>{isKorean ? "관련 이력서 근거" : "Related resume links"}</h3>
                    <span>{Math.min(referenceAnswers.length, 2)}</span>
                  </div>
                  <div className="question-inspector-rail-card__stack">
                    {referenceAnswers.slice(0, 2).map((answer) => (
                      <article className="question-inspector-rail-card__item" key={answer.id}>
                        <strong>{answer.title}</strong>
                        <p>{answer.answerText.slice(0, 120)}{answer.answerText.length > 120 ? "..." : ""}</p>
                      </article>
                    ))}
                    {referenceAnswers.length === 0 ? (
                      <article className="question-inspector-rail-card__item">
                        <strong>{isKorean ? "근거 없음" : "No linked evidence"}</strong>
                        <p>{isKorean ? "이 질문과 연결된 모범 답변 근거가 아직 없습니다." : "No linked evidence answer is available for this question yet."}</p>
                      </article>
                    ) : null}
                  </div>
                </div>
                <div className="question-inspector-rail-card__actions">
                  <Link className="primary-button" to={routeConfig.answerEditor.buildPath({ questionId })}>
                    {isKorean ? "답변 시작" : "Start answering"}
                  </Link>
                  <Link className="secondary-button" to={routeConfig.practice.buildPath()}>
                    {isKorean ? "빠른 복습" : "Quick review"}
                  </Link>
                  <Link className="secondary-button" to={routeConfig.reviewQueue.buildPath()}>
                    {isKorean ? "리뷰에 추가" : "Add to review"}
                  </Link>
                  <Link className="secondary-button" to={routeConfig.notes.buildPath()}>
                    {isKorean ? "노트로 이동" : "Add to notes"}
                  </Link>
                </div>
              </section>
            );
            const headerSection = (
              <section className="page-card question-inspector-main-card">
                <div className="question-inspector-main-card__breadcrumbs">
                  <span>{isKorean ? "질문 맵" : "Question Map"}</span>
                  <span>›</span>
                  <span>{question.category}</span>
                  <span>›</span>
                  <span>{isKorean ? "질문 인스펙터" : "Question Inspector"}</span>
                </div>
                <div className="question-inspector-main-card__toolbar">
                  <Link className="secondary-button" to={routeConfig.questionTree.buildPath({ questionId })}>
                    {isKorean ? "맵으로 돌아가기" : "Back to map"}
                  </Link>
                  <div className="question-inspector-main-card__nav">
                    <button className="secondary-button secondary-button--static" type="button">
                      {isKorean ? "이전" : "Previous"}
                    </button>
                    <button className="secondary-button secondary-button--static" type="button">
                      {isKorean ? "다음" : "Next"}
                    </button>
                  </div>
                </div>
                <div className="question-inspector-main-card__hero">
                  <div className="question-inspector-main-card__hero-copy">
                    <div className="question-inspector-main-card__hero-topline">
                      <span className="list-item-card__meta-pill">{question.category}</span>
                      <span className="question-status-badge question-status-badge--accent">{question.difficulty}</span>
                    </div>
                    <h2 className="question-inspector-main-card__title">{question.title}</h2>
                    <p className="question-inspector-main-card__body">{question.body}</p>
                    <div className="question-inspector-main-card__metrics">
                      <span className="list-item-card__meta-pill">{isKorean ? `시도 ${progress?.attemptsCount ?? 0}회` : `${progress?.attemptsCount ?? 0} attempts`}</span>
                      <span className="list-item-card__meta-pill">{isKorean ? `보조 ${supportCount}개` : `${supportCount} supports`}</span>
                      <span className="list-item-card__meta-pill">{isKorean ? `후속 ${recommendedCount}개` : `${recommendedCount} follow-ups`}</span>
                    </div>
                  </div>
                  <div className="question-inspector-main-card__hero-aside">
                    <span>{isKorean ? "예상 핵심 개념" : "Expected concepts"}</span>
                    <div className="chip-list">
                      {(question.tags.length > 0 ? question.tags : question.companies).slice(0, 6).map((item) => (
                        <span className="detail-chip" key={item}>
                          {item}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="question-inspector-main-card__prompt">
                  <div className="question-inspector-main-card__prompt-header">
                    <span>{isKorean ? "전체 질문" : "Full prompt"}</span>
                    <button className="secondary-button secondary-button--static" type="button">
                      {isKorean ? "복사" : "Copy"}
                    </button>
                  </div>
                  <p>{question.body}</p>
                </div>
                <div className="question-inspector-main-card__concepts">
                  <span>{isKorean ? "답변 전 체크포인트" : "Before-you-answer checks"}</span>
                  <div className="question-inspector-main-card__checks">
                    <article>
                      <strong>{isKorean ? "질문 밀도" : "Prompt density"}</strong>
                      <p>{isKorean ? `${promptDensity}개 단어 기준으로 설계, 제약, 장애 대응을 함께 답해야 합니다.` : `${promptDensity} prompt words suggest a multi-constraint answer with design, trade-offs, and failure handling.`}</p>
                    </article>
                    <article>
                      <strong>{isKorean ? "필수 근거" : "Required evidence"}</strong>
                      <p>{isKorean ? "이력서 근거와 운영 경험을 최소 1개씩 연결해 말하는 편이 안전합니다." : "Anchor the answer with at least one resume proof point and one operational example."}</p>
                    </article>
                  </div>
                </div>
              </section>
            );
            const desktopProgressSection = bestAttempt ? (
              <section className="page-card question-answer-snapshot-card">
                <div className="section-heading">
                  <div>
                    <p className="section-heading__eyebrow">{isKorean ? "내 최고 답변 스냅샷" : "Your best answer snapshot"}</p>
                    <h2 className="page-card__title">{bestAttempt.evaluationResultLabel ?? (isKorean ? "최근 시도" : "Recent attempt")}</h2>
                  </div>
                  <span className="section-heading__count">{bestAttempt.totalScoreLabel ?? "-"}</span>
                </div>
                <div className="question-answer-snapshot-card__body">
                  <p>{bestAttempt.submittedAtLabel}</p>
                  <p>
                    {bestAttempt.progressStatusLabel
                      ? `${bestAttempt.progressStatusLabel} · `
                      : ""}
                    {isKorean ? "이 스냅샷을 기준으로 다음 답변을 더 짧고 강하게 다듬으세요." : "Use this snapshot to tighten the next answer pass."}
                  </p>
                </div>
                <div className="page-card__actions">
                  <Link className="secondary-button" to={routeConfig.resultAnalysis.buildPath({ answerAttemptId: bestAttempt.answerAttemptId })}>
                    {isKorean ? "전체 답변 보기" : "View full answer"}
                  </Link>
                </div>
              </section>
            ) : progressSection;
            const desktopRecommendedSection = recommendedItems.length > 0 ? (
              <section className="page-card question-branch-children-card">
                <div className="section-heading">
                  <div>
                    <p className="section-heading__eyebrow">{isKorean ? "DFS 자식 가지" : "Children in DFS branch"}</p>
                    <h2 className="page-card__title">{isKorean ? "이어서 들어올 가능성이 큰 후속 질문" : "Likely follow-up branches"}</h2>
                  </div>
                  <span className="section-heading__count">{recommendedItems.length}</span>
                </div>
                <div className="stack-list">
                  {recommendedItems.slice(0, 4).map((item) => (
                    <article className="list-item-card question-branch-children-card__item" key={item.id}>
                      <div className="list-item-card__content">
                        {item.metadataLabel ? <div className="list-item-card__meta"><span>{item.metadataLabel}</span></div> : null}
                        <h3 className="list-item-card__title">{item.title}</h3>
                        {item.reason ? <p className="list-item-card__body">{item.reason}</p> : null}
                      </div>
                      <div className="list-item-card__actions">
                        <Link className="secondary-button" to={routeConfig.questionDetail.buildPath({ questionId: item.id })}>
                          {isKorean ? "열기" : "Open"}
                        </Link>
                      </div>
                    </article>
                  ))}
                </div>
              </section>
            ) : recommendedSection;

            if (!isDesktop) {
              return (
                <QuestionDetailMobileLayout
                  workspaceSummary={workspaceSummary}
                  insightSummary={insightSummary}
                  answerHistorySection={answerHistorySection}
                  headerSection={headerSection}
                  materialsSection={
                    <>
                      {referenceSection}
                      {referenceAnswersQuery.isError && questionDetailQuery.data.referenceAnswers.length > 0 ? (
                        <FeedbackNotice
                          message={isKorean ? "전용 학습 엔드포인트는 실패했지만 질문 상세 응답에 포함된 모범 답변을 대신 표시했습니다." : "Reference answers were shown from the question detail payload while the dedicated study endpoint failed."}
                          tone="info"
                        />
                      ) : null}
                      {materialsSection}
                      {learningMaterialsQuery.isError && questionDetailQuery.data.learningMaterials.length > 0 ? (
                        <FeedbackNotice
                          message={isKorean ? "전용 학습 엔드포인트는 실패했지만 질문 상세 응답에 포함된 학습 자료를 대신 표시했습니다." : "Learning materials were shown from the question detail payload while the dedicated study endpoint failed."}
                          tone="info"
                        />
                      ) : null}
                    </>
                  }
                  metadataSection={<QuestionMetaSection question={question} />}
                  progressSection={progressSection}
                  recommendedSection={recommendedSection}
                />
              );
            }

            return (
              <QuestionDetailDesktopLayout
                workspaceSummary={workspaceSummary}
                insightSummary={insightSummary}
                answerHistorySection={answerHistorySection}
                headerSection={headerSection}
                materialsSection={
                  <>
                    {referenceSection}
                    {referenceAnswersQuery.isError && questionDetailQuery.data.referenceAnswers.length > 0 ? (
                      <FeedbackNotice
                        message={isKorean ? "전용 학습 엔드포인트는 실패했지만 질문 상세 응답에 포함된 모범 답변을 대신 표시했습니다." : "Reference answers were shown from the question detail payload while the dedicated study endpoint failed."}
                        tone="info"
                      />
                    ) : null}
                    {materialsSection}
                    {learningMaterialsQuery.isError && questionDetailQuery.data.learningMaterials.length > 0 ? (
                      <FeedbackNotice
                        message={isKorean ? "전용 학습 엔드포인트는 실패했지만 질문 상세 응답에 포함된 학습 자료를 대신 표시했습니다." : "Learning materials were shown from the question detail payload while the dedicated study endpoint failed."}
                        tone="info"
                      />
                    ) : null}
                  </>
                }
                metadataSection={<QuestionMetaSection question={question} />}
                progressSection={desktopProgressSection}
                recommendedSection={desktopRecommendedSection}
              />
            );
          })()
        : null}
    </PageContainer>
  );
}

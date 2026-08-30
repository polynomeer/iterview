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
            const weaknessSignal =
              progress?.status === "retry"
                ? isKorean ? "재시도 필요" : "Retry required"
                : (answerHistoryQuery.data?.items.length ?? 0) === 0
                  ? isKorean ? "미답변 노드" : "Unanswered node"
                  : supportCount < 3
                    ? isKorean ? "보조 근거 부족" : "Thin support"
                    : isKorean ? "안정된 가지" : "Stable branch";
            const workspaceSummary = (
              <section className="page-card question-detail-workspace-surface">
                <div className="question-detail-workspace-surface__header">
                  <div className="question-detail-workspace-surface__intro">
                    <div className="question-detail-workspace-surface__eyebrow-row">
                      <span className="page-card__label">{isKorean ? "노드 인스펙터" : "Node inspector"}</span>
                      <span className="question-status-badge question-status-badge--accent">{questionDetailQuery.data.difficulty}</span>
                    </div>
                    <p className="question-detail-workspace-surface__breadcrumbs">
                      {isKorean ? "질문 노드" : "Question node"}
                      <span>/</span>
                      {isKorean ? "이력서 근거" : "Resume evidence"}
                      <span>/</span>
                      {isKorean ? "후속 압박" : "Follow-up pressure"}
                    </p>
                    <h2 className="question-detail-workspace-surface__title">
                      {isKorean
                        ? "답변, 학습, 더 깊은 분기 중 무엇을 할지 결정하기 전에 이 노드를 점검하세요"
                        : "Inspect this node before you decide to answer, study, or branch deeper"}
                    </h2>
                    <p className="question-detail-workspace-surface__body">
                      {isKorean
                        ? `${questionDetailQuery.data.title}. 이 질문 문구를 면접 체크포인트처럼 다루세요. 노드를 읽고, 보조 근거가 충분한지 확인한 뒤에만 다음 시도를 사용하세요.`
                        : `${questionDetailQuery.data.title}. Treat the prompt like an interview checkpoint: read the node, check whether the support is strong enough, and only then spend the next attempt.`}
                    </p>
                  </div>
                  <div className="question-detail-workspace-surface__stats">
                    <article className="question-detail-workspace-surface__stat">
                      <span>{isKorean ? "시도 수" : "Attempts"}</span>
                      <strong>{progress?.attemptsCount ?? 0}</strong>
                    </article>
                    <article className="question-detail-workspace-surface__stat">
                      <span>{isKorean ? "최고 점수" : "Best score"}</span>
                      <strong>{progress?.bestScoreLabel ?? (isKorean ? "아직 시작 전" : "Not started")}</strong>
                    </article>
                    <article className="question-detail-workspace-surface__stat">
                      <span>{isKorean ? "재도전 압박" : "Retry pressure"}</span>
                      <strong>{weaknessSignal}</strong>
                    </article>
                    <article className="question-detail-workspace-surface__stat">
                      <span>{isKorean ? "보조 항목" : "Support items"}</span>
                      <strong>{supportCount}</strong>
                    </article>
                  </div>
                </div>
                <div className="question-detail-workspace-surface__guidance" aria-label={isKorean ? "질문 노드 가이드" : "Question node guidance"}>
                  <article className="question-detail-workspace-surface__guidance-card">
                    <span>{isKorean ? "지금 답변" : "Answer now"}</span>
                    <strong>{isKorean ? "핵심 주장이 이미 분명할 때만 다음 시도를 사용하세요." : "Use the next attempt only when the main claim is already obvious."}</strong>
                  </article>
                  <article className="question-detail-workspace-surface__guidance-card">
                    <span>{isKorean ? "먼저 학습" : "Study first"}</span>
                    <strong>{isKorean ? "이력서 기반 근거가 아직 모호하거나 얇다면 여기서 멈추세요." : "Pause here when the resume-backed evidence is still vague or thin."}</strong>
                  </article>
                  <article className="question-detail-workspace-surface__guidance-card">
                    <span>{isKorean ? "트리 열기" : "Open the tree"}</span>
                    <strong>{isKorean ? "다음에 어떤 후속 공격이 들어올지 봐야 한다면 더 깊게 분기하세요." : "Branch deeper when you need to see which follow-up attack lands next."}</strong>
                  </article>
                </div>
                <div className="question-detail-workspace-surface__chips">
                  <span className="detail-chip">{isKorean ? `카테고리 ${questionDetailQuery.data.category}` : `Category ${questionDetailQuery.data.category}`}</span>
                  {questionDetailQuery.data.tags.slice(0, 4).map((tag) => (
                    <span className="detail-chip" key={tag}>
                      {isKorean ? `주제 ${tag}` : `Topic ${tag}`}
                    </span>
                  ))}
                  {questionDetailQuery.data.companies.slice(0, 3).map((company) => (
                    <span className="detail-chip detail-chip--accent" key={company}>
                      {isKorean ? `회사 ${company}` : `Company ${company}`}
                    </span>
                  ))}
                  {progress?.status ? (
                    <span className="detail-chip">{isKorean ? `진행 ${progress.status}` : `Progress ${progress.status}`}</span>
                  ) : null}
                </div>
              </section>
            );
            const insightSummary = (
              <SectionPanel className="question-detail-insight-surface" variant="muted">
                <div className="question-detail-insight-surface__header">
                  <div>
                    <span className="page-card__label">{isKorean ? "판단 읽기" : "Decision read"}</span>
                    <h2 className="page-card__title">
                      {isKorean
                        ? "이 노드에서 더 작업하기 전에 가장 작은 누락 조각부터 읽으세요"
                        : "Read the smallest missing piece before doing more work on this node"}
                    </h2>
                    <p className="page-card__body">
                      {isKorean
                        ? "이 화면은 누락된 작업이 명확성인지, 근거인지, 가지 인식인지를 알려줘야 합니다."
                        : "This surface should tell you whether the missing work is clarity, evidence, or branch awareness."}
                    </p>
                  </div>
                  <span className="detail-chip detail-chip--accent">{weaknessSignal}</span>
                </div>
                <div className="question-detail-insight-surface__stats">
                  <article>
                    <span>{isKorean ? "보조 밀도" : "Support density"}</span>
                    <strong>{supportCount}</strong>
                    <p>{supportCount > 0 ? (isKorean ? "답변 + 자료 + 히스토리" : "answers + materials + history") : (isKorean ? "아직 연결된 보조 자료가 없습니다" : "No support attached yet")}</p>
                  </article>
                  <article>
                    <span>{isKorean ? "다음 후속 질문" : "Next follow-ups"}</span>
                    <strong>{recommendedCount}</strong>
                    <p>{recommendedCount > 0 ? (isKorean ? "후속 공격 후보 가지" : "candidate attack branches") : (isKorean ? "아직 연결된 후속 질문이 없습니다" : "No linked follow-ups yet")}</p>
                  </article>
                  <article>
                    <span>{isKorean ? "질문 문구 길이" : "Prompt size"}</span>
                    <strong>{promptDensity}</strong>
                    <p>{isKorean ? "핵심 질문 문구 단어 수" : "words in the core prompt"}</p>
                  </article>
                </div>
                <div className="question-detail-insight-surface__actions">
                  <div className="question-detail-insight-surface__action">
                    <strong>{isKorean ? "지금 답변" : "Answer now"}</strong>
                    <span>{isKorean ? "주 라인이 이미 분명하고 이 노드에 깔끔한 한 번의 재정리만 더 필요할 때 사용하세요." : "Use this when the main line is already clear and the node just needs another clean pass."}</span>
                  </div>
                  <div className="question-detail-insight-surface__action">
                    <strong>{isKorean ? "먼저 학습" : "Study first"}</strong>
                    <span>{isKorean ? "보조 자료가 얇거나 이력서 기반 근거가 여전히 모호하면 여기서 멈추세요." : "Pause here when support is thin or the resume-backed evidence is still vague."}</span>
                  </div>
                  <div className="question-detail-insight-surface__action">
                    <strong>{isKorean ? "트리 열기" : "Open the tree"}</strong>
                    <span>{isKorean ? "면접관이 다음에 어느 가지를 파고들 가능성이 큰지 이해해야 한다면 맵으로 전환하세요." : "Switch to the map when you need to understand which branch the interviewer is most likely to probe next."}</span>
                  </div>
                </div>
              </SectionPanel>
            );

            if (!isDesktop) {
              return (
                <QuestionDetailMobileLayout
                  workspaceSummary={workspaceSummary}
                  insightSummary={insightSummary}
                  answerHistorySection={answerHistorySection}
                  headerSection={<QuestionHeader question={questionDetailQuery.data} />}
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
                  metadataSection={<QuestionMetaSection question={questionDetailQuery.data} />}
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
                headerSection={<QuestionHeader question={questionDetailQuery.data} />}
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

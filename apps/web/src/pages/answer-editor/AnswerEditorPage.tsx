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
  const { locale, t } = useLocale();
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
  const isKorean = locale === "ko";

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
      description={isKorean
        ? "현재 노드, 이력서 근거, 꼬리질문 압박을 한 작업공간에서 보며 답변 초안을 작성하세요."
        : "Draft the answer with the current node, resume evidence, and follow-up pressure visible in one workspace."}
      eyebrow={isKorean ? "답변 작업공간" : "Answer workspace"}
      title={isKorean ? "다음 꼬리질문이 오기 전에 방어 가능한 답변 하나를 완성하세요" : "Write one defendable answer before the next follow-up lands"}
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
          const promptDensity = questionDetailQuery.data.body.split(/\s+/).filter(Boolean).length;
          const branchSignal =
            trimmedDraft.length === 0
              ? isKorean ? "빈 초안" : "Blank draft"
              : trimmedDraft.length < 180
                ? isKorean ? "얇은 답변" : "Thin answer"
                : supportCount < 2
                  ? isKorean ? "근거 보강 필요" : "Needs support"
                  : isKorean ? "제출 가능" : "Submission-ready";
          const workspaceSummary = (
            <section className="page-card answer-editor-workspace-surface">
              <div className="answer-editor-workspace-surface__header">
                <div className="answer-editor-workspace-surface__intro">
                  <div className="answer-editor-workspace-surface__eyebrow-row">
                    <span className="page-card__label">{isKorean ? "답변 작업공간" : "Answer workspace"}</span>
                    <span className="question-status-badge question-status-badge--accent">
                      {isKorean ? "초안 레인" : "Draft lane"}
                    </span>
                  </div>
                  <p className="answer-editor-workspace-surface__breadcrumbs">
                    {isKorean ? "현재 노드" : "Current node"}
                    <span>/</span>
                    {isKorean ? "이력서 근거" : "Resume evidence"}
                    <span>/</span>
                    {isKorean ? "제출 점검" : "Submission check"}
                  </p>
                  <h2 className="answer-editor-workspace-surface__title">{isKorean ? "다음 꼬리질문이 쉽게 깨지 못할 답변 하나를 쓰세요" : "Write one answer the next follow-up cannot easily break"}</h2>
                  <p className="answer-editor-workspace-surface__body">
                    {isKorean
                      ? "현재 노드, 활성 이력서 맥락, 질문 트리를 가까이 두고 초안이 일반적인 인터뷰 문장으로 흐르지 않게 하세요."
                      : "Keep the current node, the active resume context, and the follow-up tree close enough that the draft stays specific instead of drifting into generic interview language."}
                  </p>
                </div>
                <div className="answer-editor-workspace-surface__stats">
                  <article className="answer-editor-workspace-surface__stat">
                    <span>{isKorean ? "초안 글자 수" : "Draft chars"}</span>
                    <strong>{trimmedDraft.length || 0}</strong>
                  </article>
                  <article className="answer-editor-workspace-surface__stat">
                    <span>{isKorean ? "이력서 연결" : "Resume source"}</span>
                    <strong>{activeResumeVersionId ? (isKorean ? "이력서 연결됨" : "Resume linked") : t("common.optional")}</strong>
                  </article>
                  <article className="answer-editor-workspace-surface__stat">
                    <span>{isKorean ? "트리 노드" : "Tree nodes"}</span>
                    <strong>{treeNodeCount}</strong>
                  </article>
                  <article className="answer-editor-workspace-surface__stat">
                    <span>{isKorean ? "보조 항목" : "Support items"}</span>
                    <strong>{supportCount}</strong>
                  </article>
                  </div>
                </div>
              <div className="answer-editor-workspace-surface__guidance" aria-label={isKorean ? "답변 작성 가이드" : "Answer drafting guidance"}>
                <article className="answer-editor-workspace-surface__guidance-card">
                  <span>{isKorean ? "주장 먼저" : "Claim first"}</span>
                  <strong>{isKorean ? "배경이나 연대기를 붙이기 전에 정확히 이 노드에 답하세요." : "Answer the exact node before adding background or chronology."}</strong>
                </article>
                <article className="answer-editor-workspace-surface__guidance-card">
                  <span>{isKorean ? "근거 다음" : "Evidence second"}</span>
                  <strong>{isKorean ? "실제 업무에서 나온 구체적 사실, 지표, 제약 하나를 붙이세요." : "Attach one concrete fact, metric, or constraint from real work."}</strong>
                </article>
                <article className="answer-editor-workspace-surface__guidance-card">
                  <span>{isKorean ? "제출은 마지막" : "Submit last"}</span>
                  <strong>{isKorean ? "가장 약할 것 같은 꼬리질문에 대한 답변 줄이 이미 준비됐을 때만 제출하세요." : "Only submit when the weakest likely follow-up already has a prepared answer line."}</strong>
                </article>
              </div>
              <div className="answer-editor-workspace-surface__chips">
                <span className="detail-chip">{questionDetailQuery.data.difficulty}</span>
                <span className="detail-chip">{branchSignal}</span>
                {(questionDetailQuery.data.relatedSkills ?? []).slice(0, 3).map((skill) => (
                  <span className="detail-chip detail-chip--accent" key={skill}>
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          );
          const insightSummary = (
            <SectionPanel className="answer-editor-insight-surface" variant="muted">
              <div className="answer-editor-insight-surface__header">
                <div>
                  <span className="page-card__label">{isKorean ? "제출 판독" : "Submission read"}</span>
                  <h2 className="page-card__title">{isKorean ? "이 점검으로 초안이 구조 보강이 필요한지, 근거 보강이 필요한지, 바로 제출 가능한지 결정하세요" : "Use this check to decide whether the draft needs more structure, more evidence, or a clean submit"}</h2>
                  <p className="page-card__body">
                    {isKorean ? "답변은 현재 노드에 좁게 붙어 있어야 합니다. 주장이 아직 모호하면 문장을 늘리기 전에 그 점부터 고치세요." : "The answer should stay narrowly attached to the current node. If the claim is still vague, fix that before adding more words."}
                  </p>
                </div>
                <span className="detail-chip detail-chip--accent">{branchSignal}</span>
              </div>
              <div className="answer-editor-insight-surface__stats">
                <article>
                  <span>{isKorean ? "질문 문구 크기" : "Prompt size"}</span>
                  <strong>{promptDensity}</strong>
                  <p>{isKorean ? "답변 범위를 정하는 질문 본문의 단어 수" : "words in the question body that set the response scope"}</p>
                </article>
                <article>
                  <span>{isKorean ? "보조 깊이" : "Support depth"}</span>
                  <strong>{supportCount}</strong>
                  <p>{isKorean ? "답변을 뒷받침할 수 있는 자료와 스킬 앵커 수" : "materials and skill anchors that can back the answer"}</p>
                </article>
                <article>
                  <span>{isKorean ? "꼬리질문 맵" : "Follow-up map"}</span>
                  <strong>{treeNodeCount}</strong>
                  <p>{isKorean ? "이 답변 직후 바로 갈라질 수 있는 연결 노드 수" : "linked nodes that may branch immediately after this answer"}</p>
                </article>
              </div>
              <div className="answer-editor-insight-surface__lanes">
                <div className="answer-editor-insight-surface__lane">
                  <strong>{isKorean ? "주장을 먼저 쓰기" : "Write the claim first"}</strong>
                  <span>{isKorean ? "이력을 설명하기 전에 결과나 결론부터 여세요." : "Open with the outcome or decision before narrating history."}</span>
                </div>
                <div className="answer-editor-insight-surface__lane">
                  <strong>{isKorean ? "실제 근거 붙이기" : "Attach real evidence"}</strong>
                  <span>{isKorean ? "답변을 구체적으로 만드는 지표, 제약, trade-off 하나를 이력서에서 고르세요." : "Pick one metric, constraint, or trade-off from the resume that makes the answer concrete."}</span>
                </div>
                <div className="answer-editor-insight-surface__lane">
                  <strong>{isKorean ? "다음 가지 준비" : "Prepare the next branch"}</strong>
                  <span>{isKorean ? "질문 트리를 훑고 가장 공격받기 쉬운 빈틈을 닫은 뒤 제출하세요." : "Scan the question tree and close the easiest-to-attack gap before submitting."}</span>
                </div>
              </div>
            </SectionPanel>
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
                <h2 className="page-card__title">{isKorean ? "초안 판단을 바꾸는 보조 맥락만 남기세요" : "Keep only the supporting context that changes the draft decision"}</h2>
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
                  {isKorean ? "이력서 연결, 가지 깊이, 관련 스킬은 현재 답변을 더 선명하게 만드는 경우에만 여기에 두세요." : "Resume linkage, branch depth, and related skills belong here only when they help tighten the current answer."}
                </p>
                <div className="answer-editor-context__rules">
                  <div className="answer-editor-context__rule">
                    <strong>{isKorean ? "1. 주장" : "1. Claim"}</strong>
                    <span>{isKorean ? "배경을 늘리기 전에 정확한 질문 문구에 먼저 답하세요." : "Answer the exact prompt before expanding into background."}</span>
                  </div>
                  <div className="answer-editor-context__rule">
                    <strong>{isKorean ? "2. 근거" : "2. Evidence"}</strong>
                    <span>{isKorean ? "실제 업무에서 나온 구체적 사실, 수치, 제약을 최소 하나 앵커로 두세요." : "Anchor at least one concrete fact, number, or constraint from your real work."}</span>
                  </div>
                  <div className="answer-editor-context__rule">
                    <strong>{isKorean ? "3. 다음 가지" : "3. Next branch"}</strong>
                    <span>{isKorean ? "다음 꼬리질문이 가장 약한 무근거 문장을 검증할 것처럼 쓰세요." : "Write as if the next follow-up will test the weakest unsupported line."}</span>
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
                insightSummary={insightSummary}
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
              insightSummary={insightSummary}
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

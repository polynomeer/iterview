import { useMemo, useState } from "react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { useCreateResumeQuestionHeatmapLinkMutation } from "../../features/resume-heatmap/api/useCreateResumeQuestionHeatmapLinkMutation";
import { useResumeQuestionHeatmapOverlayTargetsQuery } from "../../features/resume-heatmap/api/useResumeQuestionHeatmapOverlayTargetsQuery";
import { useResumeQuestionHeatmapQuery } from "../../features/resume-heatmap/api/useResumeQuestionHeatmapQuery";
import { useUpdateResumeQuestionHeatmapLinkMutation } from "../../features/resume-heatmap/api/useUpdateResumeQuestionHeatmapLinkMutation";
import { useResumeVersionDetailQuery } from "../../features/resume/api/useResumeVersionDetailQuery";
import { useResumeVersionSnapshotsQuery } from "../../features/resume/api/useResumeVersionSnapshotsQuery";
import { getErrorDetails } from "../../shared/api/errors";
import { routeConfig } from "../../shared/config/routes";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { FeedbackNotice } from "../../shared/ui/FeedbackNotice";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { useLocale } from "../../shared/i18n";
import { PageContainer } from "../../shared/ui/PageContainer";
import {
  buildAnchorId,
  buildAnchorOptions,
  getAnchorPreview,
  readFiltersFromSearchParams,
  sortOverlayTargetsForDisplay,
  splitDocumentBlocks,
} from "./heatmapUtils";

type RemapDraft = {
  anchorType: string;
  anchorRecordId: string | null;
  anchorKey: string | null;
  overlayTargetType: string | null;
  overlayFieldPath: string | null;
  overlaySentenceIndex: string;
  overlayTextSnippet: string | null;
  confidenceScore: string;
};

function localizeAnchorLabel(value: string | null | undefined, isKorean: boolean) {
  if (!value || !isKorean) {
    return value ?? "";
  }

  const normalized = value.trim();
  const dictionary: Record<string, string> = {
    Project: "프로젝트",
    Sentence: "문장",
    "System Design": "시스템 설계",
    summary: "요약",
    project: "프로젝트",
    experience: "경력",
    skill: "스킬",
    competency: "역량",
  };

  return dictionary[normalized] ?? value;
}

export function ResumeHeatmapAnchorPage() {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const { versionId, anchorType, anchorId } = useParams<{
    versionId: string;
    anchorType: string;
    anchorId: string;
  }>();
  const safeVersionId = versionId ?? "";
  const [searchParams, setSearchParams] = useSearchParams();
  const filters = useMemo(() => readFiltersFromSearchParams(searchParams), [searchParams]);
  const selectedTargetKey = searchParams.get("selectedTargetKey");
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);
  const [drafts, setDrafts] = useState<Record<string, RemapDraft>>({});
  const [manualLinkIds, setManualLinkIds] = useState<Record<string, string>>({});
  const versionQuery = useResumeVersionDetailQuery(versionId ?? null);
  const snapshotsQuery = useResumeVersionSnapshotsQuery(versionId ?? null);
  const heatmapQuery = useResumeQuestionHeatmapQuery(versionId ?? null, filters);
  const overlayTargetsQuery = useResumeQuestionHeatmapOverlayTargetsQuery(versionId ?? null, filters);
  const createLinkMutation = useCreateResumeQuestionHeatmapLinkMutation(versionId ?? null);
  const updateLinkMutation = useUpdateResumeQuestionHeatmapLinkMutation(versionId ?? null);

  const selectedAnchor = useMemo(() => {
    if (!heatmapQuery.data || !anchorType || !anchorId) {
      return null;
    }

    return (
      heatmapQuery.data.items.find((item) => {
        const itemId = item.anchorRecordId ?? item.anchorKey ?? item.id;
        return item.anchorType === anchorType && itemId === anchorId;
      }) ?? null
    );
  }, [anchorId, anchorType, heatmapQuery.data]);

  const anchorPreview = selectedAnchor
    ? getAnchorPreview(
        selectedAnchor.anchorType,
        selectedAnchor.anchorRecordId,
        selectedAnchor.anchorKey,
        snapshotsQuery.data,
      )
    : null;
  const anchorOptions = useMemo(
    () => (snapshotsQuery.data ? buildAnchorOptions(snapshotsQuery.data) : []),
    [snapshotsQuery.data],
  );
  const overlayTargets = useMemo(() => {
    if (!selectedAnchor || !overlayTargetsQuery.data) {
      return [];
    }

    return sortOverlayTargetsForDisplay(
      overlayTargetsQuery.data.items.filter(
        (item) =>
          item.anchorType === selectedAnchor.anchorType &&
          item.anchorRecordId === selectedAnchor.anchorRecordId &&
          item.anchorKey === selectedAnchor.anchorKey,
      ),
    );
  }, [overlayTargetsQuery.data, selectedAnchor]);

  const selectedOverlayTarget =
    overlayTargets.find((item) => item.targetKey === selectedTargetKey) ?? null;
  const displayedQuestions =
    selectedOverlayTarget?.linkedQuestions ?? selectedAnchor?.linkedQuestions ?? [];
  const editingQuestion =
    displayedQuestions.find((item) => item.interviewRecordQuestionId === editingQuestionId) ?? null;

  function toggleSelectedTarget(targetKey: string) {
    const next = new URLSearchParams(searchParams);
    if (selectedTargetKey === targetKey) {
      next.delete("selectedTargetKey");
    } else {
      next.set("selectedTargetKey", targetKey);
    }
    setSearchParams(next);
  }

  function openRemapEditor(questionId: string) {
    if (!selectedAnchor) {
      return;
    }

    const sourceQuestion =
      displayedQuestions.find((item) => item.interviewRecordQuestionId === questionId) ?? null;
    setEditingQuestionId(questionId);
    setDrafts((current) => ({
      ...current,
      [questionId]:
        current[questionId] ?? {
          anchorType: selectedAnchor.anchorType,
          anchorRecordId: selectedAnchor.anchorRecordId,
          anchorKey: selectedAnchor.anchorKey,
          overlayTargetType: selectedOverlayTarget?.targetType ?? null,
          overlayFieldPath: selectedOverlayTarget?.fieldPath ?? null,
          overlaySentenceIndex: selectedOverlayTarget?.sentenceIndex?.toString() ?? "",
          overlayTextSnippet: selectedOverlayTarget?.textSnippet ?? null,
          confidenceScore: sourceQuestion?.confidenceScore?.toString() ?? "",
        },
    }));
  }

  async function handleSaveRemap(questionId: string) {
    const draft = drafts[questionId];
    if (!draft) {
      return;
    }

    const nextLink = await createLinkMutation.mutateAsync({
      interviewRecordQuestionId: questionId,
      anchorType: draft.anchorType,
      anchorRecordId: draft.anchorRecordId,
      anchorKey: draft.anchorKey,
      overlayTargetType: draft.overlayTargetType,
      overlayFieldPath: draft.overlayFieldPath,
      overlaySentenceIndex: draft.overlaySentenceIndex ? Number(draft.overlaySentenceIndex) : null,
      overlayTextSnippet: draft.overlayTextSnippet,
      confidenceScore: draft.confidenceScore ? Number(draft.confidenceScore) : null,
    });

    setManualLinkIds((current) => ({ ...current, [questionId]: nextLink.id }));
    setEditingQuestionId(null);
    await Promise.all([heatmapQuery.refetch(), overlayTargetsQuery.refetch()]);
  }

  async function handleDeactivateManualLink(questionId: string) {
    const linkId = manualLinkIds[questionId];
    if (!linkId) {
      return;
    }

    await updateLinkMutation.mutateAsync({
      linkId,
      payload: {
        active: false,
      },
    });

    setManualLinkIds((current) => {
      const next = { ...current };
      delete next[questionId];
      return next;
    });
    await Promise.all([heatmapQuery.refetch(), overlayTargetsQuery.refetch()]);
  }

  if (
    versionQuery.isLoading ||
    heatmapQuery.isLoading ||
    overlayTargetsQuery.isLoading ||
    snapshotsQuery.isLoading
  ) {
    return (
      <PageContainer
        description={isKorean ? "선택한 이력서 앵커와 연결된 면접 질문을 불러오는 중입니다." : "Loading the selected resume anchor and its linked interview questions."}
        eyebrow={isKorean ? "이력서 히트맵" : "Resume Heatmap"}
        title={isKorean ? "앵커 상세 준비 중" : "Preparing anchor detail"}
      >
        <LoadingStateCard
          body={isKorean ? "이 이력서 앵커에 연결된 면접 질문 링크를 불러오는 중입니다." : "Loading routed interview question links for this resume anchor."}
          title={isKorean ? "앵커 상세 준비 중" : "Preparing anchor detail"}
        />
      </PageContainer>
    );
  }

  if (
    versionQuery.isError ||
    heatmapQuery.isError ||
    overlayTargetsQuery.isError ||
    snapshotsQuery.isError ||
    !versionQuery.data ||
    !heatmapQuery.data ||
    !overlayTargetsQuery.data ||
    !selectedAnchor
  ) {
    const error =
      versionQuery.error ??
      heatmapQuery.error ??
      overlayTargetsQuery.error ??
      snapshotsQuery.error;

    return (
      <PageContainer
        description={isKorean ? "이 상세 히트맵 앵커 화면을 불러오지 못했습니다." : "This detailed heatmap anchor view could not be loaded."}
        eyebrow={isKorean ? "이력서 히트맵" : "Resume Heatmap"}
        title={isKorean ? "앵커를 열 수 없습니다" : "Anchor unavailable"}
      >
        <ErrorStateCard
          body={
            error instanceof Error
              ? error.message
              : isKorean
                ? "선택한 이력서 앵커를 불러오지 못했습니다."
                : "The selected resume anchor could not be loaded."
          }
          details={getErrorDetails(error)}
          onAction={() => {
            void Promise.all([
              versionQuery.refetch(),
              heatmapQuery.refetch(),
              overlayTargetsQuery.refetch(),
              snapshotsQuery.refetch(),
            ]);
          }}
          title={isKorean ? "앵커 상세를 불러올 수 없습니다" : "Unable to load anchor detail"}
        />
      </PageContainer>
    );
  }

  return (
    <PageContainer
      actions={
        <>
          <Link
            className="secondary-button"
            to={routeConfig.resumeHeatmap.buildPath({ versionId: safeVersionId })}
          >
            {isKorean ? "히트맵으로 돌아가기" : "Back to heatmap"}
          </Link>
          <Link className="secondary-button" to={routeConfig.resume.buildPath()}>
            {isKorean ? "이력서로 돌아가기" : "Back to resumes"}
          </Link>
        </>
      }
      description={isKorean ? "메인 이력서 읽기 화면을 어지럽히지 않고, 이 상세 화면에서 더 깊은 분석과 링크 보정을 진행하세요." : "Use this detail view for deeper analysis and link correction without cluttering the main resume reading surface."}
      eyebrow={isKorean ? "이력서 히트맵" : "Resume Heatmap"}
      title={selectedAnchor.label}
    >
      <div className="page-stack resume-heatmap-anchor-workspace">
        {createLinkMutation.error instanceof Error ? (
          <FeedbackNotice
            details={getErrorDetails(createLinkMutation.error)}
            message={createLinkMutation.error.message}
            tone="error"
          />
        ) : null}
        {updateLinkMutation.error instanceof Error ? (
          <FeedbackNotice
            details={getErrorDetails(updateLinkMutation.error)}
            message={updateLinkMutation.error.message}
            tone="error"
          />
        ) : null}

        <section className="resume-heatmap-anchor-workspace-surface">
          <div className="resume-heatmap-anchor-workspace-surface__header">
            <div className="resume-heatmap-anchor-workspace-surface__intro">
              <div className="resume-heatmap-anchor-workspace-surface__eyebrow-row">
                <p className="resume-heatmap-anchor-workspace-surface__breadcrumbs">
                  <span>{isKorean ? "이력서 히트맵" : "Resume heatmap"}</span>
                  <span>/</span>
                  <span>{localizeAnchorLabel(selectedAnchor.anchorTypeLabel, isKorean)}</span>
                  <span>/</span>
                  <span>{isKorean ? "보강 워크스페이스" : "Repair workspace"}</span>
                </p>
                <span className="question-status-badge question-status-badge--neutral">
                  {isKorean ? "열도" : "Heat"} {selectedAnchor.heatScoreLabel}
                </span>
              </div>
              <h2 className="resume-heatmap-anchor-workspace-surface__title">
                {anchorPreview?.title ?? selectedAnchor.label}
              </h2>
              <p className="resume-heatmap-anchor-workspace-surface__body">
                {isKorean
                  ? "상세 앵커 리뷰는 하나의 이력서 주장을 라우팅 하이라이트, 연결된 질문, 수동 재매핑으로 분해해 DFS 방식 꼬리질문을 버틸 만큼 source of truth를 정밀하게 만드는 곳입니다."
                  : "Detailed anchor review is where one resume claim is decomposed into routed highlights, linked questions, and manual remaps until the source-of-truth is precise enough to survive DFS-style follow-up questioning."}
              </p>
            </div>
            <div className="resume-heatmap-anchor-workspace-surface__stats">
              <article className="resume-heatmap-anchor-workspace-surface__stat">
                <span>{isKorean ? "질문" : "Questions"}</span>
                <strong>{selectedAnchor.directQuestionCount}</strong>
              </article>
              <article className="resume-heatmap-anchor-workspace-surface__stat">
                <span>{isKorean ? "꼬리질문" : "Follow-ups"}</span>
                <strong>{selectedAnchor.followUpCount}</strong>
              </article>
              <article className="resume-heatmap-anchor-workspace-surface__stat">
                <span>{isKorean ? "약한 답변" : "Weak answers"}</span>
                <strong>{selectedAnchor.weaknessCount}</strong>
              </article>
              <article className="resume-heatmap-anchor-workspace-surface__stat">
                <span>{isKorean ? "하이라이트" : "Highlights"}</span>
                <strong>{overlayTargets.length}</strong>
              </article>
            </div>
          </div>
          <div className="resume-heatmap-anchor-workspace-surface__chips">
            <span className="detail-chip">{localizeAnchorLabel(selectedAnchor.anchorTypeLabel, isKorean)}</span>
            <span className="detail-chip">
              {selectedOverlayTarget
                ? isKorean
                  ? `집중 대상: ${localizeAnchorLabel(selectedOverlayTarget.targetTypeLabel, true)}`
                  : `Focused target: ${selectedOverlayTarget.targetTypeLabel}`
                : isKorean
                  ? "집중 대상: 앵커 레벨 리뷰"
                  : "Focused target: anchor-level review"}
            </span>
            <span className="detail-chip">
              {isKorean
                ? `현재 범위의 연결된 질문 ${displayedQuestions.length}개`
                : `${displayedQuestions.length} linked questions in current scope`}
            </span>
          </div>
        </section>

        <section className="resume-heatmap-anchor-plan">
          <article className="page-card page-card--muted">
            <span className="page-card__label">{isKorean ? "상세 앵커 리뷰" : "Detailed anchor review"}</span>
            <h2 className="page-card__title">{anchorPreview?.title ?? selectedAnchor.label}</h2>
            {anchorPreview?.description ? (
              <div className="resume-heatmap-document__body">
                {splitDocumentBlocks(anchorPreview.description).map((block, index) => (
                  <p
                    className="resume-heatmap-document__paragraph"
                    key={`${selectedAnchor.id}-${index}`}
                  >
                    {block}
                  </p>
                ))}
              </div>
            ) : null}
            <div className="resume-heatmap-inline-summary">
              <span className="detail-chip">{localizeAnchorLabel(selectedAnchor.anchorTypeLabel, isKorean)}</span>
              <span className="detail-chip">{isKorean ? "열도" : "Heat"} {selectedAnchor.heatScoreLabel}</span>
              <span className="detail-chip">{isKorean ? "질문" : "Questions"} {selectedAnchor.directQuestionCount}</span>
              <span className="detail-chip">{isKorean ? "꼬리질문" : "Follow-ups"} {selectedAnchor.followUpCount}</span>
              <span className="detail-chip">{isKorean ? "약함" : "Weak"} {selectedAnchor.weaknessCount}</span>
            </div>
          </article>

          <article className="page-card resume-heatmap-anchor-plan__signals">
            <div className="section-heading">
              <div>
                <p className="section-heading__eyebrow">{isKorean ? "보강 계획" : "Repair plan"}</p>
                <h2 className="page-card__title">{isKorean ? "이 앵커에서 무엇을 고칠지" : "What to fix on this anchor"}</h2>
              </div>
            </div>
            <div className="resume-heatmap-signal-list">
              <div className="resume-heatmap-signal-list__item">
                <span>{isKorean ? "주요 리스크" : "Primary risk"}</span>
                <strong>
                  {selectedAnchor.weaknessCount > 0
                    ? isKorean
                      ? "약한 답변은 현재 source of truth가 아직 충분히 구체적이지 않다는 뜻입니다."
                      : "Weak answers indicate the current source-of-truth is not specific enough."
                    : isKorean
                      ? "이 구간에는 약한 답변이 없으니, 대신 커버리지와 일관성을 점검하세요."
                      : "No weak answers in this slice, so verify breadth and consistency instead."}
                </strong>
              </div>
              <div className="resume-heatmap-signal-list__item">
                <span>{isKorean ? "꼬리질문 깊이" : "Follow-up depth"}</span>
                <strong>
                  {isKorean
                    ? `이 주장에서는 이미 ${selectedAnchor.followUpCount}개의 연쇄 꼬리질문이 관찰되었습니다.`
                    : `${selectedAnchor.followUpCount} chained follow-ups were already observed on this claim.`}
                </strong>
              </div>
              <div className="resume-heatmap-signal-list__item">
                <span>{isKorean ? "현재 초점" : "Current focus"}</span>
                <strong>
                  {selectedOverlayTarget
                    ? selectedOverlayTarget.textSnippet ?? selectedOverlayTarget.fieldPath ?? (isKorean ? "선택된 하이라이트" : "Selected highlight")
                    : isKorean
                      ? "라우팅된 하이라이트를 선택해 주장을 문장 또는 키워드 수준으로 좁히세요."
                      : "Select a routed highlight to narrow the claim to sentence or keyword level."}
                </strong>
              </div>
            </div>
          </article>
        </section>

        {overlayTargets.length > 0 ? (
          <section className="page-card">
            <span className="page-card__label">{isKorean ? "오버레이 타깃" : "Overlay targets"}</span>
            <h2 className="page-card__title">{isKorean ? "구체적인 라우팅 하이라이트를 선택하세요" : "Choose a specific routed highlight"}</h2>
            <div className="resume-heatmap-document__overlay-flow">
              {overlayTargets.map((target) => (
                <button
                  aria-pressed={selectedTargetKey === target.targetKey}
                  className={`resume-heatmap-document__overlay resume-heatmap-document__overlay--${target.heatTone} ${selectedTargetKey === target.targetKey ? "resume-heatmap-document__overlay--selected" : ""}`}
                  key={target.targetKey}
                  onClick={() => toggleSelectedTarget(target.targetKey)}
                  type="button"
                >
                  <span className="resume-heatmap-document__overlay-label">{localizeAnchorLabel(target.targetTypeLabel, isKorean)}</span>
                  <strong>{target.textSnippet ?? target.fieldPath ?? target.targetKey}</strong>
                  <span className="resume-heatmap-document__overlay-meta">
                    {target.questionCount} {isKorean ? "질문" : "questions"}
                    {target.followUpCount > 0 ? ` · ${target.followUpCount} ${isKorean ? "꼬리질문" : "follow-ups"}` : ""}
                    {target.weaknessCount > 0 ? ` · ${isKorean ? "약함" : "weak"} ${target.weaknessCount}` : ""}
                  </span>
                </button>
              ))}
            </div>
          </section>
        ) : null}

        <section className="page-card">
          <span className="page-card__label">{isKorean ? "연결된 질문" : "Linked questions"}</span>
          <h2 className="page-card__title">
            {selectedOverlayTarget
              ? isKorean
                ? `${localizeAnchorLabel(selectedOverlayTarget.targetTypeLabel, true)} 타깃에 연결된 질문`
                : `Questions linked to ${selectedOverlayTarget.targetTypeLabel.toLowerCase()} target`
              : isKorean
                ? "이 앵커에 연결된 질문"
                : "Questions linked to this anchor"}
          </h2>
          {displayedQuestions.length === 0 ? (
            <EmptyStateCard
              body={isKorean ? "현재 필터에서는 이 앵커에 연결된 질문이 없습니다." : "No linked questions are available for this anchor under the current filter set."}
              title={isKorean ? "연결된 질문이 없습니다" : "No linked questions"}
            />
          ) : (
            <div className="page-stack">
              {displayedQuestions.map((question) => (
                <article className="page-card page-card--muted" key={question.id}>
                  <div className="section-heading">
                    <div>
                      <p className="section-heading__eyebrow">{question.questionTypeLabel}</p>
                      <h3 className="page-card__title">{question.text}</h3>
                    </div>
                    <div className="resume-status-badges">
                      {question.isFollowUp ? (
                        <span className="question-status-badge question-status-badge--accent">
                          {isKorean ? "꼬리질문" : "Follow-up"}
                        </span>
                      ) : null}
                      {question.pressureQuestion ? (
                        <span className="question-status-badge question-status-badge--warning">
                          {isKorean ? "압박" : "Pressure"}
                        </span>
                      ) : null}
                      {question.weakAnswer ? (
                        <span className="question-status-badge question-status-badge--warning">
                          {isKorean ? "약한 답변" : "Weak answer"}
                        </span>
                      ) : null}
                    </div>
                  </div>
                  <p className="resume-tailor-muted">
                    {question.interviewDateLabel ?? (isKorean ? "면접 일자 없음" : "Interview date unavailable")}
                    {question.confidenceLabel ? ` · ${isKorean ? "신뢰도" : "Confidence"} ${question.confidenceLabel}` : ""}
                  </p>
                  {question.weaknessTags.length > 0 ? (
                    <div className="filter-chip-row">
                      {question.weaknessTags.map((tag) => (
                        <span className="detail-chip" key={`${question.id}-${tag}`}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <div className="page-card__actions">
                    <Link
                      className="secondary-button"
                      to={routeConfig.practicalInterviewQuestion.buildPath({
                        recordId: question.sourceInterviewRecordId,
                        questionId: question.interviewRecordQuestionId,
                      })}
                    >
                      {isKorean ? "면접 리뷰 열기" : "Open interview review"}
                    </Link>
                    {question.linkedQuestionId ? (
                      <Link
                        className="secondary-button"
                        to={routeConfig.questionDetail.buildPath({
                          questionId: question.linkedQuestionId,
                        })}
                      >
                        {isKorean ? "학습 질문 열기" : "Open study question"}
                      </Link>
                    ) : null}
                    <button
                      className="secondary-button"
                      onClick={() => openRemapEditor(question.interviewRecordQuestionId)}
                      type="button"
                    >
                      {isKorean ? "링크 수정" : "Fix link"}
                    </button>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {editingQuestion ? (
          <section className="page-card">
            <span className="page-card__label">{isKorean ? "링크 수정" : "Fix link"}</span>
            <h2 className="page-card__title">{isKorean ? "이 질문 매핑을 수정하세요" : "Correct this question mapping"}</h2>
            {(() => {
              const question = editingQuestion;
              const draft = drafts[question.interviewRecordQuestionId];
              const activeOptions = anchorOptions.filter(
                (option) => option.anchorType === (draft?.anchorType ?? selectedAnchor.anchorType),
              );
              const overlayOptions = overlayTargetsQuery.data.items.filter(
                (item) =>
                  item.anchorType === (draft?.anchorType ?? selectedAnchor.anchorType) &&
                  item.anchorRecordId === (draft?.anchorRecordId ?? selectedAnchor.anchorRecordId) &&
                  item.anchorKey === (draft?.anchorKey ?? selectedAnchor.anchorKey),
              );

              return (
                <article className="page-card page-card--muted">
                  <div className="section-heading">
                    <div>
                      <p className="section-heading__eyebrow">{question.questionTypeLabel}</p>
                      <h3 className="page-card__title">{question.text}</h3>
                    </div>
                  </div>
                  <div className="resume-heatmap-remap">
                    <label className="form-field">
                      <span className="form-field__label">{isKorean ? "앵커 유형" : "Anchor type"}</span>
                      <select
                        className="form-field__input"
                        onChange={(event) => {
                          const nextType = event.target.value;
                          const fallbackOption =
                            anchorOptions.find((option) => option.anchorType === nextType) ?? null;
                          setDrafts((current) => ({
                            ...current,
                            [question.interviewRecordQuestionId]: {
                              ...current[question.interviewRecordQuestionId],
                              anchorType: nextType,
                              anchorRecordId: fallbackOption?.anchorRecordId ?? null,
                              anchorKey: fallbackOption?.anchorKey ?? null,
                              overlayTargetType: null,
                              overlayFieldPath: null,
                              overlaySentenceIndex: "",
                              overlayTextSnippet: null,
                            },
                          }));
                        }}
                        value={draft?.anchorType ?? selectedAnchor.anchorType}
                      >
                        {["summary", "project", "experience", "skill", "competency"].map((value) => (
                          <option key={value} value={value}>
                            {localizeAnchorLabel(value, isKorean)}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="form-field">
                      <span className="form-field__label">{isKorean ? "이력서 앵커" : "Resume anchor"}</span>
                      <select
                        className="form-field__input"
                        onChange={(event) => {
                          const selectedOption =
                            activeOptions.find((option) => option.id === event.target.value) ?? null;
                          setDrafts((current) => ({
                            ...current,
                            [question.interviewRecordQuestionId]: {
                              ...current[question.interviewRecordQuestionId],
                              anchorRecordId: selectedOption?.anchorRecordId ?? null,
                              anchorKey: selectedOption?.anchorKey ?? null,
                              overlayTargetType: null,
                              overlayFieldPath: null,
                              overlaySentenceIndex: "",
                              overlayTextSnippet: null,
                            },
                          }));
                        }}
                        value={buildAnchorId(
                          draft?.anchorType ?? selectedAnchor.anchorType,
                          draft?.anchorRecordId ?? selectedAnchor.anchorRecordId,
                          draft?.anchorKey ?? selectedAnchor.anchorKey,
                        )}
                      >
                        {activeOptions.map((option) => (
                          <option key={option.id} value={option.id}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="form-field">
                      <span className="form-field__label">{isKorean ? "오버레이 타깃" : "Overlay target"}</span>
                      <select
                        className="form-field__input"
                        onChange={(event) => {
                          const value = event.target.value;
                          const selectedOption =
                            overlayOptions.find((option) => option.targetKey === value) ?? null;
                          setDrafts((current) => ({
                            ...current,
                            [question.interviewRecordQuestionId]: {
                              ...current[question.interviewRecordQuestionId],
                              overlayTargetType: selectedOption?.targetType ?? null,
                              overlayFieldPath: selectedOption?.fieldPath ?? null,
                              overlaySentenceIndex: selectedOption?.sentenceIndex?.toString() ?? "",
                              overlayTextSnippet: selectedOption?.textSnippet ?? null,
                            },
                          }));
                        }}
                        value={
                          overlayOptions.find(
                            (option) =>
                              option.targetType === draft?.overlayTargetType &&
                              option.fieldPath === draft?.overlayFieldPath &&
                              (option.sentenceIndex?.toString() ?? "") ===
                                (draft?.overlaySentenceIndex ?? "") &&
                              (option.textSnippet ?? null) === (draft?.overlayTextSnippet ?? null),
                          )?.targetKey ?? ""
                        }
                      >
                        <option value="">{isKorean ? "앵커만" : "Anchor only"}</option>
                        {overlayOptions.map((option) => (
                          <option key={option.targetKey} value={option.targetKey}>
                            {localizeAnchorLabel(option.targetTypeLabel, isKorean)}: {option.textSnippet ?? option.fieldPath ?? option.targetKey}
                          </option>
                        ))}
                      </select>
                    </label>

                    <label className="form-field">
                      <span className="form-field__label">{isKorean ? "신뢰도 점수" : "Confidence score"}</span>
                      <input
                        className="form-field__input"
                        max="1"
                        min="0"
                        onChange={(event) => {
                          setDrafts((current) => ({
                            ...current,
                            [question.interviewRecordQuestionId]: {
                              ...current[question.interviewRecordQuestionId],
                              confidenceScore: event.target.value,
                            },
                          }));
                        }}
                        step="0.01"
                        type="number"
                        value={draft?.confidenceScore ?? ""}
                      />
                    </label>

                    <div className="page-card__actions">
                      <button
                        className="primary-button"
                        disabled={createLinkMutation.isPending}
                        onClick={() => {
                          void handleSaveRemap(question.interviewRecordQuestionId);
                        }}
                        type="button"
                      >
                        {createLinkMutation.isPending ? (isKorean ? "저장 중..." : "Saving...") : isKorean ? "수동 재매핑 저장" : "Save manual remap"}
                      </button>
                      <button
                        className="secondary-button"
                        onClick={() => setEditingQuestionId(null)}
                        type="button"
                      >
                        {isKorean ? "편집기 닫기" : "Close editor"}
                      </button>
                      {question.linkSource === "manual" && manualLinkIds[question.interviewRecordQuestionId] ? (
                        <button
                          className="secondary-button"
                          disabled={updateLinkMutation.isPending}
                          onClick={() => {
                            void handleDeactivateManualLink(question.interviewRecordQuestionId);
                          }}
                          type="button"
                        >
                          {isKorean ? "수동 오버라이드 비활성화" : "Deactivate manual override"}
                        </button>
                      ) : null}
                    </div>
                  </div>
                </article>
              );
            })()}
          </section>
        ) : null}
      </div>
    </PageContainer>
  );
}

import { useState, type CSSProperties } from "react";
import { Link } from "react-router-dom";
import { useReviewQueueActionMutation } from "../../features/review-queue/api/useReviewQueueActionMutation";
import { useReviewQueueQuery } from "../../features/review-queue/api/useReviewQueueQuery";
import { routeConfig } from "../../shared/config/routes";
import { getErrorDetails } from "../../shared/api/errors";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { FeedbackNotice } from "../../shared/ui/FeedbackNotice";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { useLocale } from "../../shared/i18n";
import { PageContainer } from "../../shared/ui/PageContainer";
import { SectionPanel, useLayoutMode } from "../../shared/ui/layout";
import { WorkspaceContinuityRail } from "../../shared/ui/WorkspaceContinuityRail";
import { ReviewQueueDesktopLayout, ReviewQueueMobileLayout } from "./ReviewQueueLayouts";
import { ReviewQueueList } from "../../widgets/review-queue";

function getPriorityWeight(priorityLabel: string | null) {
  const match = priorityLabel?.match(/\d+/)?.[0];
  return match ? Number(match) : 3;
}

function getMasteryScore(priorityLabel: string | null, reasonTypeLabel: string) {
  const weight = getPriorityWeight(priorityLabel);
  const reason = reasonTypeLabel.toLowerCase();
  const penalty =
    reason.includes("depth") ||
    reason.includes("깊이") ||
    reason.includes("skill") ||
    reason.includes("스킬")
      ? 8
      : reason.includes("low") || reason.includes("낮음")
        ? 12
        : 4;
  return Math.max(42, 82 - weight * 6 - penalty);
}

export function ReviewQueuePage() {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const reviewQueueQuery = useReviewQueueQuery();
  const { isDesktop } = useLayoutMode();
  const skipMutation = useReviewQueueActionMutation("skip");
  const doneMutation = useReviewQueueActionMutation("done");
  const [pendingItemId, setPendingItemId] = useState<string | null>(null);
  const [pendingAction, setPendingAction] = useState<"skip" | "done" | null>(null);
  const [actionStatus, setActionStatus] = useState<string | null>(null);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const queueItems = reviewQueueQuery.data?.items ?? [];
  const highPriorityCount = queueItems.filter((item) =>
    (item.priorityLabel ?? "").toLowerCase().includes("high"),
  ).length;
  const scheduledTodayCount = queueItems.filter((item) =>
    (item.scheduledLabel ?? "").toLowerCase().includes("today"),
  ).length;
  const itemsWithResultCount = queueItems.filter((item) => Boolean(item.sourceAnswerAttemptId)).length;
  const depthRepairCount = queueItems.filter((item) =>
    item.reasonTypeLabel.toLowerCase().includes("depth") ||
    item.reasonTypeLabel.toLowerCase().includes("skill") ||
    item.reasonTypeLabel.toLowerCase().includes("깊이") ||
    item.reasonTypeLabel.toLowerCase().includes("스킬"),
  ).length;
  const freshRetryCount = queueItems.filter((item) =>
    item.reasonTypeLabel.toLowerCase().includes("fresh") ||
    item.reasonTypeLabel.toLowerCase().includes("scheduled"),
  ).length;
  const executionMode =
    highPriorityCount > 0
      ? isKorean
        ? "우선순위 우선 패스"
        : "Priority-first pass"
      : scheduledTodayCount > 0
        ? isKorean
          ? "오늘 기한 정리"
          : "Due-today cleanup"
        : isKorean
          ? "안정적 큐 유지"
          : "Steady queue maintenance";
  const selectedItem = queueItems.find((item) => item.id === selectedItemId) ?? queueItems[0] ?? null;
  const selectedScore = selectedItem ? getMasteryScore(selectedItem.priorityLabel, selectedItem.reasonTypeLabel) : 0;
  const selectedAttemptCount = selectedItem?.sourceAnswerAttemptId ? 3 : 1;
  const selectedWeakDimensions = selectedItem
    ? [
        { label: isKorean ? "깊이 방어" : "Depth defense", score: Math.max(30, selectedScore - 18) },
        { label: isKorean ? "구현 디테일" : "Implementation detail", score: Math.max(34, selectedScore - 10) },
        { label: isKorean ? "반례 대응" : "Counter-cases", score: Math.max(38, selectedScore - 6) },
      ]
    : [];
  const selectedRelatedTopics =
    selectedItem?.relatedSkillLabels.length
      ? selectedItem.relatedSkillLabels
      : [
          isKorean ? "핵심 개념" : "Core concepts",
          isKorean ? "이력서 근거" : "Resume evidence",
          isKorean ? "재도전 목표" : "Retry target",
        ];

  async function handleSkip(queueItemId: string) {
    setActionStatus(null);
    setPendingItemId(queueItemId);
    setPendingAction("skip");
    try {
      await skipMutation.mutateAsync(queueItemId);
      setActionStatus(isKorean ? "큐 항목을 나중으로 미뤘습니다." : "Queue item skipped for later.");
    } finally {
      setPendingItemId(null);
      setPendingAction(null);
    }
  }

  async function handleDone(queueItemId: string) {
    setActionStatus(null);
    setPendingItemId(queueItemId);
    setPendingAction("done");
    try {
      await doneMutation.mutateAsync(queueItemId);
      setActionStatus(isKorean ? "큐 항목을 완료 처리했습니다." : "Queue item marked done.");
    } finally {
      setPendingItemId(null);
      setPendingAction(null);
    }
  }

  const actionError =
    skipMutation.error instanceof Error
      ? skipMutation.error.message
      : doneMutation.error instanceof Error
        ? doneMutation.error.message
        : null;
  const actionErrorContent = actionError ? (
    <ErrorStateCard
      body={actionError}
      details={
        skipMutation.error instanceof Error
          ? getErrorDetails(skipMutation.error)
          : doneMutation.error instanceof Error
            ? getErrorDetails(doneMutation.error)
            : []
      }
      title={isKorean ? "큐 작업을 완료할 수 없습니다" : "Queue action failed"}
    />
  ) : null;

  const mobileListContent =
    !reviewQueueQuery.isLoading && !reviewQueueQuery.isError && reviewQueueQuery.data && reviewQueueQuery.data.items.length > 0 ? (
      <ReviewQueueList
        items={reviewQueueQuery.data.items}
        layout="stack"
        onDone={(queueItemId) => {
          void handleDone(queueItemId);
        }}
        onSkip={(queueItemId) => {
          void handleSkip(queueItemId);
        }}
        pendingAction={pendingAction}
        pendingItemId={pendingItemId}
      />
    ) : null;

  const supportRail = (
    <>
      <SectionPanel className="review-queue-note-card review-queue-browser-note" variant="muted">
        <div className="review-queue-note-card__header">
          <span className="page-card__label">{isKorean ? "그래프 포커스" : "Graph focus"}</span>
          <span className="detail-chip detail-chip--accent">{isKorean ? "약한 영역" : "Weak areas"}</span>
        </div>
        <div className="review-queue-browser-note__graph" aria-hidden="true">
          <div className="review-queue-browser-note__graph-line review-queue-browser-note__graph-line--active" />
          <div className="review-queue-browser-note__graph-line" />
          <div className="review-queue-browser-note__graph-node review-queue-browser-note__graph-node--active" />
          <div className="review-queue-browser-note__graph-node review-queue-browser-note__graph-node--warning" />
          <div className="review-queue-browser-note__graph-node review-queue-browser-note__graph-node--muted" />
        </div>
        <p className="page-card__body">
          {isKorean
            ? "메인 경로를 유지하면서 취약한 재도전 브랜치만 짧게 정리하는 복구 전용 레인입니다."
            : "A recovery lane for clearing only weak retry branches without breaking the main path."}
        </p>
      </SectionPanel>
      <SectionPanel className="review-queue-insight-surface" variant="muted">
        <div className="review-queue-insight-surface__header">
          <div>
            <span className="page-card__label">{isKorean ? "큐 전략" : "Queue strategy"}</span>
            <h2 className="page-card__title">
              {isKorean
                ? "지금 답할 수 있는 재시도와 아직 학습이 필요한 브랜치를 분리하세요"
                : "Separate answerable retries from branches that still need study"}
            </h2>
            <p className="page-card__body">
              {isKorean
                ? "큐를 보고 다음 행동이 답변, 학습, 보류 중 무엇인지 결정하세요."
                : "Use the queue to decide whether the next move is answer, study, or defer."}
            </p>
          </div>
          <span className="detail-chip detail-chip--accent">{executionMode}</span>
        </div>
        <div className="review-queue-insight-surface__stats">
          <article>
            <span>{isKorean ? "결과 근거 있음" : "Result-backed"}</span>
            <strong>{itemsWithResultCount}</strong>
            <p>
              {isKorean
                ? "이전 답변 컨텍스트가 있어 바로 다듬을 수 있는 항목 수"
                : "Items with previous answer context that can be tightened immediately"}
            </p>
          </article>
          <article>
            <span>{isKorean ? "깊이 보강" : "Depth repair"}</span>
            <strong>{depthRepairCount}</strong>
            <p>
              {isKorean
                ? "더 구체적인 꼬리질문 설명이 필요한 브랜치 수"
                : "Branches that likely need a more concrete follow-up explanation"}
            </p>
          </article>
        </div>
        <div className="review-queue-insight-surface__lanes">
          <div className="review-queue-insight-surface__lane">
            <strong>{isKorean ? "지금 답변" : "Answer now"}</strong>
            <span>
              {isKorean
                ? "이미 결과 컨텍스트가 있거나 재시도 목표가 또렷한 항목을 우선하세요."
                : "Prefer items that already have result context or a sharply defined retry target."}
            </span>
          </div>
          <div className="review-queue-insight-surface__lane">
            <strong>{isKorean ? "재시도 전 학습" : "Study before retry"}</strong>
            <span>
              {isKorean
                ? "설명이 아직 추상적인 약한 스킬 또는 얕은 깊이 항목은 이 레인으로 보내세요."
                : "Use this lane for weak skill or shallow depth items where the explanation is still abstract."}
            </span>
          </div>
        </div>
      </SectionPanel>
    </>
  );

  const desktopMainContent =
    !reviewQueueQuery.isLoading && !reviewQueueQuery.isError && reviewQueueQuery.data && reviewQueueQuery.data.items.length > 0 ? (
      <section className="page-card review-queue-browser">
        <div className="review-queue-browser__tabs">
          <button className="review-queue-browser__tab review-queue-browser__tab--active" type="button">
            {isKorean ? `재도전 큐 ${queueItems.length}` : `Review queue ${queueItems.length}`}
          </button>
          <button className="review-queue-browser__tab" type="button">
            {isKorean ? "완료됨" : "Reviewed"}
          </button>
          <button className="review-queue-browser__tab" type="button">
            {isKorean ? "건너뜀" : "Skipped"}
          </button>
          <button className="review-queue-browser__tab" type="button">
            {isKorean ? "전체 기록" : "All review history"}
          </button>
        </div>
        <div className="review-queue-browser__focus">
          <div>
            <p className="page-card__label">{isKorean ? "재도전 큐" : "Retry queue"}</p>
            <h2 className="page-card__title">
              {isKorean ? "메인 흐름을 끊지 않고 재도전만 정리하세요" : "Clear retries without breaking the main flow"}
            </h2>
            <p className="page-card__body">
              {isKorean
                ? "복구가 쉬운 항목부터 정리하되, 학습이 먼저 필요한 약한 브랜치는 우측 상세 레일에서 구분합니다."
                : "Start with the easiest recoverable items and separate branches that still need study from the right detail rail."}
            </p>
          </div>
          <span className="detail-chip detail-chip--accent">{executionMode}</span>
        </div>
        <div className="review-queue-browser__table">
          <div className="review-queue-browser__table-head">
            <span>{isKorean ? "질문" : "Question"}</span>
            <span>{isKorean ? "이유" : "Reason"}</span>
            <span>{isKorean ? "다음 시점" : "Last attempt"}</span>
            <span>{isKorean ? "마스터리" : "Mastery"}</span>
            <span>{isKorean ? "실행" : "Action"}</span>
          </div>
          <div className="review-queue-browser__rows">
            {queueItems.map((item) => {
              const mastery = getMasteryScore(item.priorityLabel, item.reasonTypeLabel);
              return (
                <button
                  className={`review-queue-browser__row ${selectedItem?.id === item.id ? "review-queue-browser__row--active" : ""}`}
                  key={item.id}
                  onClick={() => {
                    setSelectedItemId(item.id);
                  }}
                  type="button"
                >
                  <span className="review-queue-browser__row-question">
                    <strong>{item.questionTitle}</strong>
                    <small>{item.priorityLabel ?? (isKorean ? "우선순위 없음" : "No priority")}</small>
                  </span>
                  <span>
                    <span className={`detail-chip ${item.reasonTypeLabel.includes("낮음") || item.reasonTypeLabel.toLowerCase().includes("low") ? "detail-chip--accent" : ""}`}>
                      {item.reasonTypeLabel}
                    </span>
                  </span>
                  <span>{item.scheduledLabel ?? (isKorean ? "일정 없음" : "No schedule")}</span>
                  <span className="review-queue-browser__row-score">
                    <i style={{ "--review-queue-score": `${mastery}%` } as CSSProperties} />
                    <strong>{mastery}/100</strong>
                  </span>
                  <span className="review-queue-browser__row-action">
                    {item.sourceAnswerAttemptId ? (isKorean ? "결과 있음" : "Result-backed") : isKorean ? "재시도" : "Retry"}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </section>
    ) : null;

  const inspectorRail = selectedItem ? (
    <SectionPanel className="review-queue-detail-rail" variant="muted">
      <div className="review-queue-detail-rail__header">
        <div>
          <span className="page-card__label">{isKorean ? "질문 상세" : "Question details"}</span>
          <h2 className="page-card__title">{selectedItem.questionTitle}</h2>
        </div>
        <span className="detail-chip detail-chip--accent">{selectedItem.reasonTypeLabel}</span>
      </div>
      <div className="review-queue-detail-rail__chips">
        <span className="detail-chip">{selectedItem.priorityLabel ?? (isKorean ? "우선순위 없음" : "No priority")}</span>
        <span className="detail-chip">{selectedItem.statusLabel}</span>
        <span className="detail-chip">{selectedItem.sourceAnswerAttemptId ? (isKorean ? "결과 기반" : "Result-backed") : (isKorean ? "새 재도전" : "Fresh retry")}</span>
      </div>
      <div className="review-queue-detail-rail__stats">
        <article>
          <span>{isKorean ? "마스터리 점수" : "Mastery score"}</span>
          <strong>{selectedScore}/100</strong>
        </article>
        <article>
          <span>{isKorean ? "시도 횟수" : "Attempts"}</span>
          <strong>{selectedAttemptCount}</strong>
        </article>
        <article>
          <span>{isKorean ? "최근 시점" : "Last attempt"}</span>
          <strong>{selectedItem.scheduledLabel ?? (isKorean ? "일정 없음" : "No schedule")}</strong>
        </article>
      </div>
      <div className="review-queue-detail-rail__panel">
        <span>{isKorean ? "최근 피드백 요약" : "Last feedback summary"}</span>
        <p>{selectedItem.reasonDetail}</p>
      </div>
      <div className="review-queue-detail-rail__panel">
        <span>{isKorean ? "약한 차원" : "Weak dimensions"}</span>
        <div className="review-queue-detail-rail__dimension-list">
          {selectedWeakDimensions.map((dimension) => (
            <article className="review-queue-detail-rail__dimension" key={dimension.label}>
              <div>
                <strong>{dimension.label}</strong>
                <small>{dimension.score}/100</small>
              </div>
              <i style={{ "--review-queue-score": `${dimension.score}%` } as CSSProperties} />
            </article>
          ))}
        </div>
      </div>
      <div className="review-queue-detail-rail__panel">
        <span>{isKorean ? "관련 주제" : "Related"}</span>
        <div className="chip-list">
          {selectedRelatedTopics.map((topic) => (
            <span className="detail-chip" key={topic}>
              {topic}
            </span>
          ))}
        </div>
      </div>
      <div className="review-queue-detail-rail__actions">
        <Link className="primary-button" to={routeConfig.answerEditor.buildPath({ questionId: selectedItem.questionId })}>
          {isKorean ? "지금 재도전" : "Retry now"}
        </Link>
        <div className="page-card__actions">
          <button
            className="secondary-button"
            onClick={() => {
              void handleSkip(selectedItem.id);
            }}
            type="button"
          >
            {pendingItemId === selectedItem.id && pendingAction === "skip"
              ? isKorean
                ? "보류 중..."
                : "Skipping..."
              : isKorean
                ? "건너뛰기"
                : "Skip"}
          </button>
          <button
            className="secondary-button"
            onClick={() => {
              void handleDone(selectedItem.id);
            }}
            type="button"
          >
            {pendingItemId === selectedItem.id && pendingAction === "done"
              ? isKorean
                ? "완료 중..."
                : "Saving..."
              : isKorean
                ? "완료"
                : "Done"}
          </button>
        </div>
      </div>
    </SectionPanel>
  ) : null;

  return (
    <PageContainer
      actions={
        <>
          <Link className="secondary-button" to={routeConfig.weakNodes.buildPath()}>
            {isKorean ? "약한 노드 열기" : "Open weak nodes"}
          </Link>
          <Link className="secondary-button" to={routeConfig.scheduledReviews.buildPath()}>
            {isKorean ? "예정된 복습 열기" : "Open scheduled reviews"}
          </Link>
        </>
      }
      description={
        isKorean
          ? "가장 신호가 강한 재시도부터 해결하고, 열린 약한 브랜치를 줄인 뒤 새로운 연습으로 돌아가세요."
          : "Resolve the highest-signal retry first, then return to fresh practice with fewer weak branches still open."
      }
      eyebrow={isKorean ? "복구 루프" : "Recovery loop"}
      introVariant="minimal"
      title={isKorean ? "큐에 쌓인 재시도 브랜치 해결" : "Resolve queued retry branches"}
    >
      <WorkspaceContinuityRail
        current={{
          title: isKorean ? "큐 재시도 실행" : "Queued retry execution",
          description: isKorean ? "큐를 보고 다음 행동이 답변, 학습, 보류 중 무엇인지 결정하세요." : "Use the queue to decide whether the next move is answer, study, or defer.",
        }}
        downstream={[
          {
            title: isKorean ? "약한 노드" : "Weak nodes",
            description: isKorean ? "큐가 약하다고는 말하지만 이유가 보이지 않을 때 보강 그래프를 여세요." : "Open the remediation graph when the queue says something is weak but not why.",
            to: routeConfig.weakNodes.buildPath(),
          },
          {
            title: isKorean ? "예정된 복습" : "Scheduled reviews",
            description: isKorean ? "즉시 처리할 큐가 정리되면 다가오는 재시도 블록의 균형을 다시 맞추세요." : "Rebalance upcoming retry blocks once the immediate queue is under control.",
            to: routeConfig.scheduledReviews.buildPath(),
          },
        ]}
        upstream={[
          {
            title: isKorean ? "연습" : "Practice",
            description: isKorean ? "새 연습 화면은 보통 다음 재시도 결정을 이 큐로 밀어 넣습니다." : "Fresh practice surfaces usually feed the next retry decision into this queue.",
            to: routeConfig.practice.buildPath(),
          },
          {
            title: isKorean ? "면접 실행기" : "Interview launcher",
            description: isKorean ? "전체 세션 복구 결정은 넓은 연습을 다시 열기 전에 여기로 모여야 합니다." : "Full-session recovery decisions should land here before broad practice opens again.",
            to: routeConfig.interview.buildPath(),
          },
        ]}
      />
      <section className="page-card review-queue-workspace-surface">
        <div className="review-queue-workspace-surface__header">
          <div className="review-queue-workspace-surface__intro">
            <div className="review-queue-workspace-surface__eyebrow-row">
              <span className="page-card__label">{isKorean ? "큐 작업공간" : "Queue workspace"}</span>
              <span className="question-status-badge question-status-badge--accent">{isKorean ? "복구 실행" : "Recovery execution"}</span>
            </div>
            <p className="review-queue-workspace-surface__breadcrumbs">
              {isKorean ? "재시도 신호" : "Retry signal"}
              <span>/</span>
              {isKorean ? "브랜치 보강" : "Branch repair"}
              <span>/</span>
              {isKorean ? "연습으로 복귀" : "Return to practice"}
            </p>
            <h2 className="review-queue-workspace-surface__title">
              {isKorean ? "가장 작지만 신호가 강한 재시도부터 정리하세요" : "Clear the smallest high-signal retry first"}
            </h2>
            <p className="review-queue-workspace-surface__body">
              {isKorean
                ? "다음 브랜치를 열어 주는 재시도를 먼저 끝내고, 모호한 약점을 줄인 상태로 열린 연습으로 돌아가세요."
                : "Finish the retries that unblock the next branch, then return to open practice with fewer vague weak points."}
            </p>
          </div>
          <div className="review-queue-workspace-surface__stats">
            <article className="review-queue-workspace-surface__stat">
              <span>{isKorean ? "큐 항목" : "Queued items"}</span>
              <strong>{queueItems.length}</strong>
            </article>
            <article className="review-queue-workspace-surface__stat">
              <span>{isKorean ? "높은 우선순위" : "High priority"}</span>
              <strong>{highPriorityCount}</strong>
            </article>
            <article className="review-queue-workspace-surface__stat">
              <span>{isKorean ? "오늘 기한" : "Due today"}</span>
              <strong>{scheduledTodayCount}</strong>
            </article>
          </div>
        </div>
        <div className="review-queue-workspace-surface__guidance">
          <article className="review-queue-workspace-surface__guidance-card">
            <span>{isKorean ? "실행 원칙" : "Execution rule"}</span>
            <strong>{isKorean ? "가장 작지만 신호가 강한 재시도부터 정리하세요." : "Clear the smallest high-signal retry first."}</strong>
          </article>
          <article className="review-queue-workspace-surface__guidance-card">
            <span>{isKorean ? "이탈 원칙" : "Exit rule"}</span>
            <strong>{isKorean ? "약한 브랜치가 덜 모호해진 뒤에만 새 연습으로 돌아가세요." : "Return to fresh practice only after the weak branch is less vague."}</strong>
          </article>
        </div>
        <div className="review-queue-workspace-surface__chips">
          <span className="detail-chip detail-chip--accent">{executionMode}</span>
          {highPriorityCount > 0 ? <span className="detail-chip detail-chip--accent">{isKorean ? "높은 우선순위 항목" : "High-priority items"}</span> : null}
          {scheduledTodayCount > 0 ? <span className="detail-chip">{isKorean ? "현재 사이클 기한" : "Due in current cycle"}</span> : null}
          {itemsWithResultCount > 0 ? <span className="detail-chip">{isKorean ? "결과 컨텍스트 있음" : "Result context available"}</span> : null}
          {freshRetryCount > 0 ? <span className="detail-chip">{isKorean ? "새 재도전 포함" : "Fresh retries included"}</span> : null}
        </div>
      </section>
      {actionStatus ? <FeedbackNotice message={actionStatus} tone="success" /> : null}

      {reviewQueueQuery.isLoading ? (
        <LoadingStateCard
          body={isKorean ? "큐에 쌓인 복습 항목을 불러오는 중입니다." : "Loading the queued review items."}
          title={isKorean ? "복습 큐 준비 중" : "Preparing review queue"}
        />
      ) : null}

      {reviewQueueQuery.isError ? (
        <ErrorStateCard
          body={
            reviewQueueQuery.error instanceof Error
              ? reviewQueueQuery.error.message
              : isKorean
                ? "복습 큐를 불러오지 못했습니다."
                : "The review queue could not be loaded."
          }
          details={getErrorDetails(reviewQueueQuery.error)}
          onAction={() => {
            void reviewQueueQuery.refetch();
          }}
          title={isKorean ? "복습 큐를 불러올 수 없습니다" : "Unable to load review queue"}
        />
      ) : null}

      {actionErrorContent}

      {!reviewQueueQuery.isLoading && !reviewQueueQuery.isError && reviewQueueQuery.data && reviewQueueQuery.data.items.length === 0 ? (
        <EmptyStateCard
          action={{
            label: isKorean ? "홈으로" : "Back to home",
            to: routeConfig.home.buildPath(),
          }}
          body={isKorean ? "지금은 큐에 쌓인 복습 항목이 없습니다." : "There are no queued review items right now."}
          title={isKorean ? "큐가 비어 있습니다" : "Queue is empty"}
        />
      ) : null}

      {(isDesktop ? desktopMainContent : mobileListContent)
        ? isDesktop
          ? <ReviewQueueDesktopLayout actionError={null} inspectorRail={inspectorRail} mainContent={desktopMainContent} supportRail={supportRail} />
          : <ReviewQueueMobileLayout actionError={null} mainContent={mobileListContent} supportRail={supportRail} />
        : null}
    </PageContainer>
  );
}

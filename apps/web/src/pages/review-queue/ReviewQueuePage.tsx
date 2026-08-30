import { useState } from "react";
import { Link } from "react-router-dom";
import { routeConfig } from "../../shared/config/routes";
import { getErrorDetails } from "../../shared/api/errors";
import { EmptyStateCard } from "../../shared/ui/EmptyStateCard";
import { ErrorStateCard } from "../../shared/ui/ErrorStateCard";
import { FeedbackNotice } from "../../shared/ui/FeedbackNotice";
import { LoadingStateCard } from "../../shared/ui/LoadingStateCard";
import { useLocale } from "../../shared/i18n";
import { SectionPanel, useLayoutMode } from "../../shared/ui/layout";
import { PageContainer } from "../../shared/ui/PageContainer";
import { WorkspaceContinuityRail } from "../../shared/ui/WorkspaceContinuityRail";
import { useReviewQueueActionMutation } from "../../features/review-queue/api/useReviewQueueActionMutation";
import { useReviewQueueQuery } from "../../features/review-queue/api/useReviewQueueQuery";
import { ReviewQueueDesktopLayout, ReviewQueueMobileLayout } from "./ReviewQueueLayouts";
import { ReviewQueueList } from "../../widgets/review-queue";

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
    item.reasonTypeLabel.toLowerCase().includes("skill"),
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
  const listContent = !reviewQueueQuery.isLoading && !reviewQueueQuery.isError && reviewQueueQuery.data && reviewQueueQuery.data.items.length > 0 ? (
    <ReviewQueueList
      items={reviewQueueQuery.data.items}
      layout={isDesktop ? "grid" : "stack"}
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
  const decisionSupport = (
    <SectionPanel className="review-queue-insight-surface" variant="muted">
      <div className="review-queue-insight-surface__header">
        <div>
          <span className="page-card__label">{isKorean ? "큐 전략" : "Queue strategy"}</span>
          <h2 className="page-card__title">{isKorean ? "지금 답할 수 있는 재시도와 아직 학습이 필요한 브랜치를 분리하세요" : "Separate answerable retries from branches that still need study"}</h2>
          <p className="page-card__body">
            {isKorean ? "큐를 보고 다음 행동이 답변, 학습, 보류 중 무엇인지 결정하세요." : "Use the queue to decide whether the next move is answer, study, or defer."}
          </p>
        </div>
        <span className="detail-chip detail-chip--accent">{executionMode}</span>
      </div>
      <div className="review-queue-insight-surface__stats">
        <article>
          <span>{isKorean ? "결과 근거 있음" : "Result-backed"}</span>
          <strong>{itemsWithResultCount}</strong>
          <p>{isKorean ? "이전 답변 컨텍스트가 있어 바로 다듬을 수 있는 항목 수" : "items with previous answer context to tighten immediately"}</p>
        </article>
        <article>
          <span>{isKorean ? "깊이 보강" : "Depth repair"}</span>
          <strong>{depthRepairCount}</strong>
          <p>{isKorean ? "더 구체적인 꼬리질문 설명이 필요한 브랜치 수" : "branches that likely need a more concrete follow-up explanation"}</p>
        </article>
      </div>
      <div className="review-queue-insight-surface__lanes">
        <div className="review-queue-insight-surface__lane">
          <strong>{isKorean ? "지금 답변" : "Answer now"}</strong>
          <span>{isKorean ? "이미 결과 컨텍스트가 있거나 재시도 목표가 또렷한 항목을 우선하세요." : "Prefer items that already have result context or a sharply defined retry target."}</span>
        </div>
        <div className="review-queue-insight-surface__lane">
          <strong>{isKorean ? "재시도 전 학습" : "Study before retry"}</strong>
          <span>{isKorean ? "설명이 아직 추상적인 약한 스킬 또는 얕은 깊이 항목은 이 레인으로 보내세요." : "Use this lane for weak skill or shallow depth items where the explanation is still abstract."}</span>
        </div>
      </div>
    </SectionPanel>
  );

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
      description={isKorean ? "가장 신호가 강한 재시도부터 해결하고, 열린 약한 브랜치를 줄인 뒤 새로운 연습으로 돌아가세요." : "Resolve the highest-signal retry first, then return to fresh practice with fewer weak branches still open."}
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
            <h2 className="review-queue-workspace-surface__title">{isKorean ? "가장 작지만 신호가 강한 재시도부터 정리하세요" : "Clear the smallest high-signal retry first"}</h2>
            <p className="review-queue-workspace-surface__body">
              {isKorean ? "다음 브랜치를 열어 주는 재시도를 먼저 끝내고, 모호한 약점을 줄인 상태로 열린 연습으로 돌아가세요." : "Finish the retries that unblock the next branch, then return to open practice with fewer vague weak points."}
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

      {listContent
        ? isDesktop
          ? <ReviewQueueDesktopLayout actionError={null} decisionSupport={decisionSupport} listContent={listContent} />
          : <ReviewQueueMobileLayout actionError={null} decisionSupport={decisionSupport} listContent={listContent} />
        : null}
    </PageContainer>
  );
}

import type { useCreateInterviewSessionMutation } from "../../../../features/interview/api/useCreateInterviewSessionMutation";
import type { useConfirmInterviewRecordMutation } from "../../../../features/practical-interview/api/useConfirmInterviewRecordMutation";
import type { useUpdateInterviewReviewMutation } from "../../../../features/practical-interview/api/useUpdateInterviewReviewMutation";
import { getErrorDetails, userFacingErrorMessage } from "../../../../shared/api/errors";
import { useLocale } from "../../../../shared/i18n";
import { ErrorStateCard } from "../../../../shared/ui/ErrorStateCard";
import { FeedbackNotice } from "../../../../shared/ui/FeedbackNotice";
import { SectionPanel } from "../../../../shared/ui/layout";
import {
  deriveReviewSignals,
  localizeReviewPayloadText,
  type ReplayPresetModel,
  type ReviewModel,
  type ReviewRecordDetail,
} from "../reviewModel";

/** Review overview surface plus the review insight panel at the top of the workspace. */
export function ReviewOverview({
  detail,
  review,
  dirtyEditCount,
  updateReviewMutation,
  confirmMutation,
  createReplayMutation,
  applyTarget,
  handleConfirm,
  openReplayLauncher,
}: {
  detail: ReviewRecordDetail;
  review: ReviewModel;
  dirtyEditCount: number;
  updateReviewMutation: ReturnType<typeof useUpdateInterviewReviewMutation>;
  confirmMutation: ReturnType<typeof useConfirmInterviewRecordMutation>;
  createReplayMutation: ReturnType<typeof useCreateInterviewSessionMutation>;
  applyTarget: (target?: string | null, payload?: Record<string, string>) => void;
  handleConfirm: () => Promise<void>;
  openReplayLauncher: (preset: ReplayPresetModel) => void;
}) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const { laneNeedsReviewTotal, primaryReviewLane, replayBlockerCount, reviewSignal } =
    deriveReviewSignals(review, isKorean);

  return (
    <>
      <section className="practical-review-workspace-surface practical-review-layout__overview">
        <div className="practical-review-workspace-surface__header">
          <div className="practical-review-workspace-surface__intro">
            <div className="practical-review-workspace-surface__eyebrow-row">
              <p className="practical-review-workspace-surface__breadcrumbs">
                <span>{isKorean ? "가져온 면접" : "Imported interview"}</span>
                <span>/</span>
                <span>{isKorean ? "복구 레인" : "Recovery lanes"}</span>
                <span>/</span>
                <span>{isKorean ? "리플레이 준비 상태" : "Replay readiness"}</span>
              </p>
            <span className="detail-chip">{isKorean ? "리뷰 단계" : "Review stage"}</span>
            <span className="question-status-badge question-status-badge--accent">
                {localizeReviewPayloadText(detail.structuringStageLabel, isKorean)}
            </span>
            </div>
            <span className="page-card__label">{isKorean ? "리뷰 개요" : "Review overview"}</span>
            <h2 className="practical-review-workspace-surface__title">
              {review.overallSummary ?? detail.overallSummary ?? detail.title}
            </h2>
            <p className="practical-review-workspace-surface__body">
              {detail.aiEnrichedSummary ??
                detail.deterministicSummary ??
                (isKorean
                  ? "아래 레인 대시보드를 사용해 전사 품질, 구조화 질문, 리플레이 준비 상태를 보완한 뒤 다음 시도를 진행하세요."
                  : "Use the lane dashboard below to repair transcript quality, structured questions, and replay readiness before another attempt.")}
            </p>
          </div>
          <div className="practical-review-workspace-surface__stats">
            <article className="practical-review-workspace-surface__stat">
              <span>{isKorean ? "세그먼트" : "Segments"}</span>
              <strong>{review.totalSegmentCount}</strong>
            </article>
            <article className="practical-review-workspace-surface__stat">
              <span>{isKorean ? "질문" : "Questions"}</span>
              <strong>{review.totalQuestionCount}</strong>
            </article>
            <article className="practical-review-workspace-surface__stat">
              <span>{isKorean ? "리뷰 필요 레인" : "Lanes needing review"}</span>
              <strong>{laneNeedsReviewTotal}</strong>
            </article>
            <article className="practical-review-workspace-surface__stat">
              <span>{isKorean ? "약한 답변" : "Weak answers"}</span>
              <strong>{review.weakAnswerCount}</strong>
            </article>
          </div>
        </div>
        <div className="practical-review-workspace-surface__chips">
          <span
            className={`question-status-badge ${
              review.requiresConfirmation
                ? "question-status-badge--warning"
                : "question-status-badge--positive"
            }`}
          >
            {review.requiresConfirmation
              ? isKorean
                ? "확인 필요"
                : "Confirmation required"
              : isKorean
                ? "확인 가능"
                : "Ready to confirm"}
          </span>
          <span className="detail-chip">{isKorean ? `변경된 질문 ${review.changedQuestionCount}` : `Changed questions ${review.changedQuestionCount}`}</span>
          <span className="detail-chip">{isKorean ? `꼬리질문 ${review.followUpQuestionCount}` : `Follow-ups ${review.followUpQuestionCount}`}</span>
          {detail.confirmedAtLabel ? (
            <span className="question-status-badge question-status-badge--neutral">
              {isKorean ? `확인됨 ${detail.confirmedAtLabel}` : `Confirmed ${detail.confirmedAtLabel}`}
            </span>
          ) : null}
        </div>
        <div className="practical-review-workspace-surface__guidance">
          <article className="practical-review-workspace-surface__guidance-card">
            <span>{isKorean ? "리뷰 원칙" : "Review rule"}</span>
            <strong>
              {isKorean
                ? "질문이나 스레드로 넓히기 전에 이후 해석 전체를 왜곡할 수 있는 레인을 먼저 안정화하세요."
                : "Stabilize the lane that can distort all downstream interpretation before you broaden into questions or threads."}
            </strong>
          </article>
          <article className="practical-review-workspace-surface__guidance-card">
            <span>{isKorean ? "다음 복구" : "Next recovery"}</span>
            <strong>
              {primaryReviewLane
                ? isKorean
                  ? `${localizeReviewPayloadText(primaryReviewLane.badgeText, true)}을 먼저 복구하세요. 이유: ${localizeReviewPayloadText(primaryReviewLane.whyItMatters, true)}`
                  : `${primaryReviewLane.badgeText} is the first recovery surface because ${primaryReviewLane.whyItMatters.toLowerCase()}`
                : isKorean
                  ? "가장 불안정한 레인을 먼저 열고, 그다음 리플레이 준비 상태를 확인하세요."
                  : "Open the most unstable lane first, then verify replay readiness."}
            </strong>
          </article>
          <article className="practical-review-workspace-surface__guidance-card">
            <span>{isKorean ? "이탈 조건" : "Exit rule"}</span>
            <strong>{isKorean ? "약한 답변 하나 또는 꼬리질문 체인 하나에 명확한 교정 경로가 생겼을 때만 이 리뷰를 벗어나세요." : "Leave this review only when one weak answer or follow-up chain has a clear correction path."}</strong>
          </article>
        </div>
        {(updateReviewMutation.isSuccess || confirmMutation.isSuccess) && (
          <FeedbackNotice
            message={
              confirmMutation.isSuccess
                ? isKorean
                  ? "실전 면접 리뷰를 확정했습니다."
                  : "The practical interview review was confirmed."
                : isKorean
                  ? "전사 수정 사항이 실전 면접 리뷰에 반영되었습니다."
                  : "Transcript edits were applied to the practical interview review."
            }
            tone="success"
          />
        )}
        {(updateReviewMutation.isError || confirmMutation.isError || createReplayMutation.isError) && (
          <ErrorStateCard
            body={
              userFacingErrorMessage(
                updateReviewMutation.error ?? confirmMutation.error ?? createReplayMutation.error,
                isKorean ? "요청한 리뷰 동작에 실패했습니다." : "The requested review action failed.",
              )
            }
            details={getErrorDetails(
              updateReviewMutation.error ?? confirmMutation.error ?? createReplayMutation.error,
            )}
            title={isKorean ? "리뷰 동작을 완료할 수 없습니다" : "Unable to complete the review action"}
          />
        )}
        <div className="page-card__actions">
          <button
            className="primary-button"
            onClick={() =>
              applyTarget(
                review.actionRecommendations.primaryActionTarget,
                review.actionRecommendations.primaryActionTargetPayload,
              )
            }
            type="button"
          >
            {review.actionRecommendations.primaryActionLabel
              ? localizeReviewPayloadText(review.actionRecommendations.primaryActionLabel, isKorean)
              : isKorean
                ? "리뷰 계속"
                : "Continue review"}
          </button>
          <button
            className="secondary-button"
            disabled={
              dirtyEditCount > 0 ||
              !review.actionRecommendations.canConfirm ||
              confirmMutation.isPending
            }
            onClick={() => {
              void handleConfirm();
            }}
            type="button"
          >
            {confirmMutation.isPending ? (isKorean ? "확정 중..." : "Confirming...") : isKorean ? "리뷰 확정" : "Confirm review"}
          </button>
          {review.actionRecommendations.canReplay && review.replayLaunchPreset ? (
            <button
              className="secondary-button"
              onClick={() => openReplayLauncher(review.replayLaunchPreset)}
              type="button"
            >
              {localizeReviewPayloadText(review.replayLaunchPreset.launchButtonLabel, isKorean)}
            </button>
          ) : null}
        </div>
        {!review.actionRecommendations.canConfirm ? (
          <div className="stack-list">
            {review.actionRecommendations.blockingReasonDetails.map((detail) => (
              <article className="list-item-card" key={detail.id}>
                <div className="list-item-card__content">
                  <div className="list-item-card__meta">
                    <span>{localizeReviewPayloadText(detail.label, isKorean)}</span>
                    <span>{localizeReviewPayloadText(detail.severity, isKorean)}</span>
                  </div>
                  <p className="list-item-card__body">{detail.description}</p>
                </div>
              </article>
            ))}
          </div>
        ) : null}
      </section>

      <SectionPanel className="practical-review-insight-surface" variant="muted">
        <div className="practical-review-insight-surface__header">
          <div>
            <span className="page-card__label">{isKorean ? "리뷰 인사이트" : "Review insight"}</span>
            <h2 className="page-card__title">{isKorean ? "리뷰 범위를 넓히기 전에 리플레이와 질문 구조를 왜곡하는 레인을 먼저 해결하세요" : "Resolve the lane that distorts replay and question structure before widening the review"}</h2>
            <p className="page-card__body">
              {isKorean
                ? "이 레이어는 무엇을 먼저 안정화해야 하는지 알려줘야 합니다. 전사 정확도, 구조화 질문, 꼬리질문 스레드 무결성, 리플레이 준비 상태 중 무엇이 먼저인지 결정한 뒤 아래 작업을 전술적으로 진행하세요."
                : "This layer should tell you what to stabilize first: transcript fidelity, structured questions, follow-up thread integrity, or replay readiness. Treat everything below as tactical work after that decision."}
            </p>
          </div>
          <span className="detail-chip detail-chip--accent">{reviewSignal}</span>
        </div>
        <div className="practical-review-insight-surface__stats">
          <article>
            <span>{isKorean ? "주요 레인" : "Primary lane"}</span>
            <strong>{primaryReviewLane ? localizeReviewPayloadText(primaryReviewLane.badgeText, isKorean) : isKorean ? "레인 없음" : "No lane"}</strong>
            <p>
              {primaryReviewLane
                ? isKorean
                  ? `이 레인에는 ${primaryReviewLane.needsReviewCount}개의 리뷰 대상이 있습니다.`
                  : `${primaryReviewLane.needsReviewCount} item${primaryReviewLane.needsReviewCount === 1 ? "" : "s"} need review in this lane.`
                : isKorean
                  ? "서버가 우선순위를 준 레인이 없습니다."
                  : "No server-prioritized lane is available."}
            </p>
          </article>
          <article>
            <span>{isKorean ? "리플레이 상태" : "Replay state"}</span>
            <strong>{replayBlockerCount > 0 ? localizeReviewPayloadText(review.replayReadiness.statusBadgeText, isKorean) : isKorean ? "리플레이 가능" : "Replay clear"}</strong>
            <p>{replayBlockerCount > 0 ? (isKorean ? `${replayBlockerCount}개의 차단 요인이 아직 리플레이 시작을 막고 있습니다.` : `${replayBlockerCount} blocker${replayBlockerCount === 1 ? "" : "s"} still gate replay launch.`) : isKorean ? "선택한 레인이 안정화되면 리플레이를 시작할 수 있습니다." : "Replay can start once the selected lane is stable."}</p>
          </article>
          <article>
            <span>{isKorean ? "약한 답변 부하" : "Weak answer load"}</span>
            <strong>{review.weakAnswerCount}</strong>
            <p>{isKorean ? "복구 지향 리플레이나 스레드 점검이 더 필요한 답변 수입니다." : "answers that still need recovery-oriented replay or thread inspection"}</p>
          </article>
        </div>
        <div className="practical-review-insight-surface__lanes">
          <div className="practical-review-insight-surface__lane">
            <strong>{isKorean ? "해석 안정화" : "Stabilize interpretation"}</strong>
            <span>{isKorean ? "이후의 모든 질문과 스레드 해석을 불안정하게 만드는 레인을 먼저 고치세요." : "Fix the lane that can make every downstream question or thread read unreliable."}</span>
          </div>
          <div className="practical-review-insight-surface__lane">
            <strong>{isKorean ? "리플레이 가능성 재점검" : "Recheck replayability"}</strong>
            <span>{isKorean ? "리플레이 모의면접이나 스레드 기반 재시뮬레이션을 열기 전에 차단 요인을 제거하세요." : "Clear blockers before opening replay mock flows or thread-based re-simulation."}</span>
          </div>
          <div className="practical-review-insight-surface__lane">
            <strong>{isKorean ? "가장 약한 답변 복구" : "Recover the weakest answer"}</strong>
            <span>{isKorean ? "가장 약한 구조화 답변을 의도적인 재연습의 첫 목표로 삼으세요." : "Use the weakest structured answer as the first target for deliberate re-practice."}</span>
          </div>
        </div>
      </SectionPanel>
    </>
  );
}

import { useLocale } from "../../../../shared/i18n";
import { MetricCard } from "../../../../shared/ui/MetricCard";
import {
  deriveReviewSignals,
  localizeReviewPayloadText,
  type ReviewAnalysis,
  type ReviewInterviewerProfile,
  type ReviewModel,
  type ReviewQuestions,
  type ReviewTranscript,
} from "../reviewModel";

/** Replay readiness, lane priorities, provenance, and supporting payload counts. */
export function ReviewBrief({
  review,
  transcript,
  questions,
  analysis,
  interviewerProfile,
  applyTarget,
}: {
  review: ReviewModel;
  transcript: ReviewTranscript;
  questions: ReviewQuestions;
  analysis: ReviewAnalysis;
  interviewerProfile: ReviewInterviewerProfile;
  applyTarget: (target?: string | null, payload?: Record<string, string>) => void;
}) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const { primaryReviewLane, replayBlockerCount } = deriveReviewSignals(review, isKorean);

  return (
    <section className="page-card practical-review-brief">
      <div className="section-heading">
        <div>
          <span className="page-card__label">{isKorean ? "리뷰 브리프" : "Review brief"}</span>
          <h2 className="page-card__title">{isKorean ? "전사 위에 리플레이 컨텍스트를 유지하세요" : "Keep replay context above the transcript"}</h2>
        </div>
        <p className="page-card__body practical-review-brief__summary">
          {isKorean ? "전사가 중심입니다. 나머지 리뷰가 면접 자체에 집중할 수 있도록 리플레이 준비 상태, 레인 우선순위, 출처, 보조 데이터 묶음을 여기서 함께 보여줍니다." : "Transcript stays primary. Replay readiness, lane priorities, provenance, and supporting payloads are grouped here so the rest of the review can focus on the interview itself."}
        </p>
      </div>
      <div className="practical-review-brief__summary-grid">
        <article className="practical-review-brief__summary-card">
          <span>{isKorean ? "먼저 열기" : "Open first"}</span>
          <strong>{primaryReviewLane ? localizeReviewPayloadText(primaryReviewLane.summaryText, isKorean) : isKorean ? "사용 가능한 레인 우선순위 없음" : "No lane priority available"}</strong>
        </article>
        <article className="practical-review-brief__summary-card">
          <span>{isKorean ? "리플레이 차단 요인" : "Replay blockers"}</span>
          <strong>
            {replayBlockerCount > 0
              ? isKorean
                ? `리플레이 전에 ${replayBlockerCount}개의 차단 요인을 정리해야 합니다.`
                : `${replayBlockerCount} blocker${replayBlockerCount === 1 ? "" : "s"} should be cleared before replay.`
              : isKorean
                ? "활성 레인 리뷰가 안정화되면 리플레이를 시작할 수 있습니다."
                : "Replay can start once the active lane review is stable."}
          </strong>
        </article>
        <article className="practical-review-brief__summary-card">
          <span>{isKorean ? "약한 답변 부하" : "Weak-answer load"}</span>
          <strong>{isKorean ? `${review.weakAnswerCount}개의 답변이 아직 복구 지향 점검이 필요합니다.` : `${review.weakAnswerCount} answers still need recovery-oriented inspection.`}</strong>
        </article>
      </div>
      <div className="practical-review-brief__grid">
        <section className="page-card page-card--inset practical-review-brief__card">
          <span className="page-card__label">{isKorean ? "리플레이 준비 상태" : "Replay readiness"}</span>
          <h3 className="page-card__title">{localizeReviewPayloadText(review.replayReadiness.statusBadgeText, isKorean)}</h3>
          <p className="page-card__body">{review.replayReadiness.statusSummary}</p>
          <div className="stats-grid">
            <MetricCard label={isKorean ? "리플레이 가능" : "Replayable"} value={String(review.replayReadiness.replayableQuestionCount)} />
            <MetricCard label={isKorean ? "연결됨" : "Linked"} value={String(review.replayReadiness.linkedQuestionCount)} />
            <MetricCard label={isKorean ? "스레드" : "Threads"} tone="accent" value={String(review.replayReadiness.followUpThreadCount)} />
          </div>
          {review.replayReadiness.blockerDetails.length > 0 ? (
            <div className="stack-list">
              {review.replayReadiness.blockerDetails.slice(0, 2).map((blocker) => (
                <article className="list-item-card practical-blocker-card" key={blocker.id}>
                  <div className="list-item-card__content">
                    <div className="list-item-card__meta">
                      <span>{localizeReviewPayloadText(blocker.label, isKorean)}</span>
                      <span>{localizeReviewPayloadText(blocker.severity, isKorean)}</span>
                    </div>
                    <p className="list-item-card__body">{blocker.description}</p>
                  </div>
                </article>
              ))}
            </div>
          ) : null}
        </section>

        <section className="page-card page-card--inset practical-review-brief__card">
          <span className="page-card__label">{isKorean ? "레인 우선순위" : "Lane priorities"}</span>
          <h3 className="page-card__title">{isKorean ? "서버 우선순위 레인" : "Server-prioritized lanes"}</h3>
          <div className="stack-list">
            {review.laneItems.map((lane) => (
              <article
                className={`list-item-card practical-lane-card practical-lane-card--${lane.highlightVariant}`}
                key={lane.key}
              >
                <div className="list-item-card__content">
                  <div className="list-item-card__meta">
                    <span>{localizeReviewPayloadText(lane.badgeText, isKorean)}</span>
                    <span>{localizeReviewPayloadText(lane.readiness, isKorean)}</span>
                    <span>{isKorean ? `${lane.needsReviewCount}개 검토 필요` : `${lane.needsReviewCount} need review`}</span>
                  </div>
                  <h3 className="list-item-card__title">{localizeReviewPayloadText(lane.summaryText, isKorean)}</h3>
                  <p className="list-item-card__body">{localizeReviewPayloadText(lane.whyItMatters, isKorean)}</p>
                </div>
                <div className="list-item-card__actions">
                  {lane.primaryActionLabel ? (
                    <button
                      className="secondary-button"
                      onClick={() =>
                        applyTarget(lane.primaryActionTarget, lane.primaryActionTargetPayload)
                      }
                      type="button"
                    >
                      {localizeReviewPayloadText(lane.primaryActionLabel, isKorean)}
                    </button>
                  ) : null}
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="page-card page-card--inset practical-review-brief__card">
          <span className="page-card__label">{isKorean ? "출처" : "Provenance"}</span>
          <h3 className="page-card__title">{isKorean ? "규칙 생성 vs AI vs 확정본" : "Deterministic vs AI vs confirmed"}</h3>
          <div className="stack-list">
            <article className="list-item-card">
              <div className="list-item-card__content">
                <div className="list-item-card__meta">
                  <span>{isKorean ? "질문 출처" : "Question source"}</span>
                  <span>{localizeReviewPayloadText(review.provenanceComparisonSummary.currentQuestionSource, isKorean)}</span>
                </div>
                <p className="list-item-card__body">
                  {isKorean
                    ? `변경된 질문 ${review.provenanceComparisonSummary.changedQuestionCountFromDeterministic}`
                    : `Changed questions ${review.provenanceComparisonSummary.changedQuestionCountFromDeterministic}`}
                </p>
              </div>
            </article>
            <article className="list-item-card">
              <div className="list-item-card__content">
                <div className="list-item-card__meta">
                  <span>{isKorean ? "답변 출처" : "Answer source"}</span>
                  <span>{localizeReviewPayloadText(review.provenanceComparisonSummary.currentAnswerSource, isKorean)}</span>
                </div>
                <p className="list-item-card__body">
                  {isKorean
                    ? `변경된 답변 ${review.provenanceComparisonSummary.changedAnswerCountFromDeterministic}`
                    : `Changed answers ${review.provenanceComparisonSummary.changedAnswerCountFromDeterministic}`}
                </p>
              </div>
            </article>
          </div>
        </section>

        <section className="page-card page-card--inset practical-review-brief__card">
          <span className="page-card__label">{isKorean ? "보조 데이터 묶음" : "Supporting payloads"}</span>
          <h3 className="page-card__title">{isKorean ? "불러온 맥락" : "Loaded context"}</h3>
          <div className="stats-grid">
            <MetricCard label={isKorean ? "전사 행" : "Transcript rows"} value={String(transcript.segments.length)} />
            <MetricCard label={isKorean ? "구조화 질문" : "Structured questions"} value={String(questions.items.length)} />
            <MetricCard label={isKorean ? "주제" : "Topics"} tone="muted" value={String(analysis.topicTags.length)} />
            <MetricCard label={isKorean ? "면접관 프로필" : "Interviewer profile"} tone="accent" value={interviewerProfile ? (isKorean ? "준비됨" : "Ready") : isKorean ? "없음" : "Missing"} />
          </div>
          {interviewerProfile ? (
            <div className="chip-list">
              {interviewerProfile.styleTags.map((tag) => (
                <span className="detail-chip detail-chip--accent" key={tag}>
                  {localizeReviewPayloadText(tag, isKorean)}
                </span>
              ))}
            </div>
          ) : null}
        </section>
      </div>
    </section>
  );
}

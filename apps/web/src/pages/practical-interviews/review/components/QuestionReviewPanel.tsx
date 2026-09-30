import { Link } from "react-router-dom";
import { routeConfig } from "../../../../shared/config/routes";
import { useLocale } from "../../../../shared/i18n";
import { MetricCard } from "../../../../shared/ui/MetricCard";
import {
  buildHeatmapAnchorPath,
  localizeReviewPayloadText,
  type PlaybackRange,
  type ReplayPresetModel,
  type ReviewModel,
  type ReviewRecordDetail,
  type StructuredQuestion,
} from "../reviewModel";

/** Question lane: origin summary, filters, and per-question replay and deep links. */
export function QuestionReviewPanel({
  recordId,
  detail,
  review,
  structuredQuestionById,
  selectedQuestionId,
  activeQuestionFilter,
  setActiveQuestionFilter,
  focusQuestionWithPlayback,
  openReplayLauncher,
}: {
  recordId: string;
  detail: ReviewRecordDetail;
  review: ReviewModel;
  structuredQuestionById: Map<string, StructuredQuestion>;
  selectedQuestionId: string | null;
  activeQuestionFilter: string;
  setActiveQuestionFilter: (filter: string) => void;
  focusQuestionWithPlayback: (
    targetQuestionId: string | null,
    range: PlaybackRange | null | undefined,
    label: string,
  ) => void;
  openReplayLauncher: (preset: ReplayPresetModel) => void;
}) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  const questionFilterOptions = [
    { id: "all", label: isKorean ? "전체" : "All", count: review.questionFilterSummary.allQuestions },
    { id: "primary", label: isKorean ? "메인" : "Primary", count: review.questionFilterSummary.primaryQuestions },
    { id: "follow-up", label: isKorean ? "꼬리질문" : "Follow-up", count: review.questionFilterSummary.followUpQuestions },
    { id: "weak", label: isKorean ? "약한 답변" : "Weak answers", count: review.questionFilterSummary.weakAnswerQuestions },
  ];

  const filteredQuestionSummaries = review.questionSummaries.filter((question) => {
    switch (activeQuestionFilter) {
      case "primary":
        return !question.isFollowUp;
      case "follow-up":
        return question.isFollowUp;
      case "weak":
        return question.hasWeakAnswer;
      default:
        return true;
    }
  });

  return (
    <div className="page-stack">
      <span className="page-card__label">{isKorean ? "질문" : "Questions"}</span>
      <h2 className="page-card__title">{isKorean ? "질문 요약과 딥링크" : "Question summaries and deep links"}</h2>
      <div className="stats-grid">
        <MetricCard label={isKorean ? "이력서 연결" : "Resume-linked"} value={String(review.questionOriginSummary.resumeLinkedQuestions)} />
        <MetricCard label={isKorean ? "공고 연결" : "Job-posting linked"} tone="muted" value={String(review.questionOriginSummary.jobPostingLinkedQuestions)} />
        <MetricCard label={isKorean ? "혼합" : "Hybrid"} tone="accent" value={String(review.questionOriginSummary.hybridLinkedQuestions)} />
        <MetricCard label={isKorean ? "일반" : "General"} tone="muted" value={String(review.questionOriginSummary.generalQuestions)} />
      </div>
      <div className="page-card__actions">
        {questionFilterOptions.map((filter) => (
          <button
            className={activeQuestionFilter === filter.id ? "primary-button" : "secondary-button"}
            key={filter.id}
            onClick={() => setActiveQuestionFilter(filter.id)}
            type="button"
          >
            {filter.label} ({filter.count})
          </button>
        ))}
      </div>
      <div className="stack-list">
        {filteredQuestionSummaries.map((question) => {
          const structuredQuestion = structuredQuestionById.get(question.id);
          const heatmapAnchorPath = buildHeatmapAnchorPath({
            versionId: detail.linkedResumeVersionId,
            anchorType: structuredQuestion?.derivedFromResumeRecordType ?? null,
            anchorRecordId: structuredQuestion?.derivedFromResumeRecordId ?? null,
            isFollowUp: question.isFollowUp,
            weakOnly: question.hasWeakAnswer,
          });

          return (
          <article
            className={`page-card page-card--inset practical-question-row${selectedQuestionId === question.id ? " practical-question-row--selected" : ""}`}
            id={`practical-question-${question.id}`}
            key={question.id}
          >
            <div className="section-heading">
              <div>
                <p className="section-heading__eyebrow">
                  #{question.orderIndex + 1} · {localizeReviewPayloadText(question.questionTypeLabel, isKorean)}
                </p>
                <h3 className="page-card__title">{question.text}</h3>
              </div>
              <div className="chip-list">
                <span className="detail-chip">{localizeReviewPayloadText(question.originLabel, isKorean)}</span>
                {question.isFollowUp ? (
                  <span className="detail-chip detail-chip--accent">{isKorean ? "꼬리질문" : "Follow-up"}</span>
                ) : null}
                {question.hasWeakAnswer ? (
                  <span className="detail-chip detail-chip--accent">{isKorean ? "약한 답변" : "Weak answer"}</span>
                ) : null}
              </div>
            </div>
            <div className="practical-review-meta">
              {question.questionStructuringSource ? (
                <div className="practical-review-meta__row">
                  <span className="practical-review-meta__label">{isKorean ? "질문 출처" : "Question source"}</span>
                  <span className="practical-review-meta__value">
                    {localizeReviewPayloadText(question.questionStructuringSource, isKorean)}
                  </span>
                </div>
              ) : null}
              {question.answerStructuringSource ? (
                <div className="practical-review-meta__row">
                  <span className="practical-review-meta__label">{isKorean ? "답변 출처" : "Answer source"}</span>
                  <span className="practical-review-meta__value">
                    {localizeReviewPayloadText(question.answerStructuringSource, isKorean)}
                  </span>
                </div>
              ) : null}
              {question.derivedFromResumeSection ? (
                <div className="practical-review-meta__row">
                  <span className="practical-review-meta__label">{isKorean ? "이력서 섹션" : "Resume section"}</span>
                  <span className="practical-review-meta__value">
                    {question.derivedFromResumeSection}
                  </span>
                </div>
              ) : null}
              {question.derivedFromJobPostingSection ? (
                <div className="practical-review-meta__row">
                  <span className="practical-review-meta__label">{isKorean ? "채용 공고 섹션" : "Job posting section"}</span>
                  <span className="practical-review-meta__value">
                    {question.derivedFromJobPostingSection}
                  </span>
                </div>
              ) : null}
            </div>
            {question.answerSummary ? <p className="page-card__body">{question.answerSummary}</p> : null}
            <div className="chip-list">
              {question.topicTags.map((tag) => (
                <span className="detail-chip" key={tag}>
                  {tag}
                </span>
              ))}
              {question.weaknessTags.map((tag) => (
                <span className="detail-chip detail-chip--accent" key={tag}>
                  {tag}
                </span>
              ))}
            </div>
            <div className="page-card__actions">
              {question.questionRange ? (
                <button
                  className="secondary-button"
                  onClick={() =>
                    focusQuestionWithPlayback(question.id, question.questionRange, isKorean ? `${question.orderIndex + 1}번 질문` : `Question ${question.orderIndex + 1}`)
                  }
                  type="button"
                >
                  {isKorean ? "질문 재생" : "Play question"}
                </button>
              ) : null}
              {question.answerRange ? (
                <button
                  className="secondary-button"
                  onClick={() =>
                    focusQuestionWithPlayback(question.id, question.answerRange, isKorean ? `${question.orderIndex + 1}번 답변` : `Answer ${question.orderIndex + 1}`)
                  }
                  type="button"
                >
                  {isKorean ? "답변 재생" : "Play answer"}
                </button>
              ) : null}
              {question.questionAnswerRange ? (
                <button
                  className="secondary-button"
                  onClick={() =>
                    focusQuestionWithPlayback(question.id, question.questionAnswerRange, isKorean ? `${question.orderIndex + 1}번 문답` : `Q&A ${question.orderIndex + 1}`)
                  }
                  type="button"
                >
                  {isKorean ? "문답 재생" : "Play Q&A"}
                </button>
              ) : null}
              {question.linkedQuestionId ? (
                <Link
                  className="secondary-button"
                  to={routeConfig.questionDetail.buildPath({
                    questionId: question.linkedQuestionId,
                  })}
                >
                  {isKorean ? "질문 상세 열기" : "Open question detail"}
                </Link>
              ) : null}
              {heatmapAnchorPath ? (
                <Link className="secondary-button" to={heatmapAnchorPath}>
                  {isKorean ? "히트맵 앵커 열기" : "Open heatmap anchor"}
                </Link>
              ) : null}
              {question.deepLink?.sourceInterviewQuestionId ? (
                <Link
                  className="secondary-button"
                  to={`${routeConfig.archive.buildPath()}?sourceInterviewRecordId=${recordId}&sourceInterviewQuestionId=${question.deepLink.sourceInterviewQuestionId}`}
                >
                  {isKorean ? "아카이브 원본 열기" : "Open archive source"}
                </Link>
              ) : null}
              {question.deepLink?.canStartReplayMock ? (
                <button
                  className="secondary-button"
                  onClick={() =>
                    openReplayLauncher(
                      review.replayLaunchPreset
                        ? {
                            ...review.replayLaunchPreset,
                            seedQuestionIds: [question.id],
                          }
                        : null,
                    )
                  }
                  type="button"
                >
                  {isKorean ? "리플레이 모의면접 시작" : "Start replay mock"}
                </button>
              ) : null}
            </div>
          </article>
          );
        })}
      </div>
    </div>
  );
}

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
  const { t } = useLocale();

  const questionFilterOptions = [
    { id: "all", label: t("practicalReviewPanels.all"), count: review.questionFilterSummary.allQuestions },
    { id: "primary", label: t("practicalReviewPanels.primary"), count: review.questionFilterSummary.primaryQuestions },
    { id: "follow-up", label: t("practicalReviewPanels.followUp"), count: review.questionFilterSummary.followUpQuestions },
    { id: "weak", label: t("practicalReviewPanels.weakAnswers"), count: review.questionFilterSummary.weakAnswerQuestions },
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
      <span className="page-card__label">{t("practicalReviewPanels.questions")}</span>
      <h2 className="page-card__title">{t("practicalReviewPanels.questionSummariesDeepLinks")}</h2>
      <div className="stats-grid">
        <MetricCard label={t("practicalReviewPanels.resumeLinked")} value={String(review.questionOriginSummary.resumeLinkedQuestions)} />
        <MetricCard label={t("practicalReviewPanels.jobPostingLinked")} tone="muted" value={String(review.questionOriginSummary.jobPostingLinkedQuestions)} />
        <MetricCard label={t("practicalReviewPanels.hybrid")} tone="accent" value={String(review.questionOriginSummary.hybridLinkedQuestions)} />
        <MetricCard label={t("practicalReviewPanels.general")} tone="muted" value={String(review.questionOriginSummary.generalQuestions)} />
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
                  #{question.orderIndex + 1} · {localizeReviewPayloadText(question.questionTypeLabel, t)}
                </p>
                <h3 className="page-card__title">{question.text}</h3>
              </div>
              <div className="chip-list">
                <span className="detail-chip">{localizeReviewPayloadText(question.originLabel, t)}</span>
                {question.isFollowUp ? (
                  <span className="detail-chip detail-chip--accent">{t("practicalReviewPanels.followUp")}</span>
                ) : null}
                {question.hasWeakAnswer ? (
                  <span className="detail-chip detail-chip--accent">{t("practicalReviewPanels.weakAnswer")}</span>
                ) : null}
              </div>
            </div>
            <div className="practical-review-meta">
              {question.questionStructuringSource ? (
                <div className="practical-review-meta__row">
                  <span className="practical-review-meta__label">{t("practicalReviewPanels.questionSource")}</span>
                  <span className="practical-review-meta__value">
                    {localizeReviewPayloadText(question.questionStructuringSource, t)}
                  </span>
                </div>
              ) : null}
              {question.answerStructuringSource ? (
                <div className="practical-review-meta__row">
                  <span className="practical-review-meta__label">{t("practicalReviewPanels.answerSource")}</span>
                  <span className="practical-review-meta__value">
                    {localizeReviewPayloadText(question.answerStructuringSource, t)}
                  </span>
                </div>
              ) : null}
              {question.derivedFromResumeSection ? (
                <div className="practical-review-meta__row">
                  <span className="practical-review-meta__label">{t("practicalReviewPanels.resumeSection")}</span>
                  <span className="practical-review-meta__value">
                    {question.derivedFromResumeSection}
                  </span>
                </div>
              ) : null}
              {question.derivedFromJobPostingSection ? (
                <div className="practical-review-meta__row">
                  <span className="practical-review-meta__label">{t("practicalReviewPanels.jobPostingSection")}</span>
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
                    focusQuestionWithPlayback(question.id, question.questionRange, t("practicalReviewPanels.questionLabel", { number: question.orderIndex + 1 }))
                  }
                  type="button"
                >
                  {t("practicalReviewPanels.playQuestion")}
                </button>
              ) : null}
              {question.answerRange ? (
                <button
                  className="secondary-button"
                  onClick={() =>
                    focusQuestionWithPlayback(question.id, question.answerRange, t("practicalReviewPanels.answerLabel", { number: question.orderIndex + 1 }))
                  }
                  type="button"
                >
                  {t("practicalReviewPanels.playAnswer")}
                </button>
              ) : null}
              {question.questionAnswerRange ? (
                <button
                  className="secondary-button"
                  onClick={() =>
                    focusQuestionWithPlayback(question.id, question.questionAnswerRange, t("practicalReviewPanels.questionAnswerLabel", { number: question.orderIndex + 1 }))
                  }
                  type="button"
                >
                  {t("practicalReviewPanels.playQuestionAnswer")}
                </button>
              ) : null}
              {question.linkedQuestionId ? (
                <Link
                  className="secondary-button"
                  to={routeConfig.questionDetail.buildPath({
                    questionId: question.linkedQuestionId,
                  })}
                >
                  {t("practicalReviewPanels.openQuestionDetail")}
                </Link>
              ) : null}
              {heatmapAnchorPath ? (
                <Link className="secondary-button" to={heatmapAnchorPath}>
                  {t("practicalReviewPanels.openHeatmapAnchor")}
                </Link>
              ) : null}
              {question.deepLink?.sourceInterviewQuestionId ? (
                <Link
                  className="secondary-button"
                  to={`${routeConfig.archive.buildPath()}?sourceInterviewRecordId=${recordId}&sourceInterviewQuestionId=${question.deepLink.sourceInterviewQuestionId}`}
                >
                  {t("practicalReviewPanels.openArchiveSource")}
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
                  {t("practicalReviewPanels.startReplayMock")}
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

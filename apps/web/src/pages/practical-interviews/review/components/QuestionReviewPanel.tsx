import { routeConfig } from "../../../../shared/config/routes";
import { useLocale } from "../../../../shared/i18n";
import { weaknessTagLabel } from "../../../../shared/lib/labels";
import { Badge, Button, ButtonLink, Segmented } from "../../../../shared/ui/primitives";
import {
  buildHeatmapAnchorPath,
  localizeReviewPayloadText,
  questionTypeLabel,
  resumeSectionLabel,
  type PlaybackRange,
  type ReplayPresetModel,
  type ReviewModel,
  type ReviewRecordDetail,
  type StructuredQuestion,
} from "../reviewModel";

export type QuestionFilter = "all" | "primary" | "follow-up" | "weak";

/** Every question asked, with the answer summary, what was weak, and where to practice it next. */
export function QuestionReviewPanel({
  detail,
  review,
  structuredQuestionById,
  selectedQuestionId,
  activeQuestionFilter,
  setActiveQuestionFilter,
  focusQuestionWithPlayback,
  openReplayLauncher,
  canPlay,
}: {
  detail: ReviewRecordDetail;
  review: ReviewModel;
  structuredQuestionById: Map<string, StructuredQuestion>;
  selectedQuestionId: string | null;
  activeQuestionFilter: QuestionFilter;
  setActiveQuestionFilter: (filter: QuestionFilter) => void;
  focusQuestionWithPlayback: (targetQuestionId: string | null, range: PlaybackRange | null | undefined, label: string) => void;
  openReplayLauncher: (preset: ReplayPresetModel) => void;
  canPlay: boolean;
}) {
  const { t, locale } = useLocale();
  const counts = review.questionFilterSummary;
  const questions = review.questionSummaries.filter((question) => {
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
    <div className="record-panel">
      <Segmented<QuestionFilter>
        items={[
          { id: "all", label: t("recordReview.filterAll", { count: counts.allQuestions }) },
          { id: "primary", label: t("recordReview.filterPrimary", { count: counts.primaryQuestions }) },
          { id: "follow-up", label: t("recordReview.filterFollowUp", { count: counts.followUpQuestions }) },
          { id: "weak", label: t("recordReview.filterWeak", { count: counts.weakAnswerQuestions }) },
        ]}
        label={t("recordReview.questionFilter")}
        onChange={setActiveQuestionFilter}
        value={activeQuestionFilter}
      />

      {questions.length === 0 ? <p className="record-panel__empty">{t("recordReview.noQuestionsMatch")}</p> : null}

      <ol className="record-list">
        {questions.map((question) => {
          const number = question.orderIndex + 1;
          const structured = structuredQuestionById.get(question.id);
          const heatmapPath = buildHeatmapAnchorPath({
            versionId: detail.linkedResumeVersionId,
            anchorType: structured?.derivedFromResumeRecordType ?? null,
            anchorRecordId: structured?.derivedFromResumeRecordId ?? null,
            isFollowUp: question.isFollowUp,
            weakOnly: question.hasWeakAnswer,
          });
          const type = questionTypeLabel(question.questionType, t);
          const origin = localizeReviewPayloadText(question.originLabel, t);

          return (
            <li
              aria-current={selectedQuestionId === question.id ? "true" : undefined}
              className="record-item"
              id={`practical-question-${question.id}`}
              key={question.id}
            >
              <p className="record-item__eyebrow">
                <span>{t("recordReview.questionNumber", { number })}</span>
                {type ? <span>{type}</span> : null}
                {question.isFollowUp ? <Badge tone="accent">{t("recordReview.followUp")}</Badge> : null}
                {question.hasWeakAnswer ? <Badge tone="danger">{t("recordReview.weakAnswer")}</Badge> : null}
                {origin ? <Badge>{origin}</Badge> : null}
              </p>
              <h3 className="record-item__title">{question.text}</h3>
              {question.answerSummary ? (
                <p className="record-item__body">
                  <span className="record-item__label">{t("recordReview.yourAnswer")}</span>
                  {question.answerSummary}
                </p>
              ) : null}
              {question.derivedFromResumeSection ? (
                <p className="record-item__meta">{t("recordReview.fromResume", { section: resumeSectionLabel(question.derivedFromResumeSection, t) })}</p>
              ) : null}
              {question.weaknessTags.length > 0 || question.topicTags.length > 0 ? (
                <ul aria-label={t("recordReview.tags")} className="record-item__tags">
                  {question.weaknessTags.map((tag) => (
                    <li key={`weak-${tag}`}>
                      <Badge tone="danger">{weaknessTagLabel(tag, locale)}</Badge>
                    </li>
                  ))}
                  {question.topicTags.map((tag) => (
                    <li key={`topic-${tag}`}>
                      <Badge>{tag}</Badge>
                    </li>
                  ))}
                </ul>
              ) : null}
              <div className="record-item__actions">
                {canPlay && question.questionRange ? (
                  <Button
                    onClick={() => focusQuestionWithPlayback(question.id, question.questionRange, t("recordReview.questionNumber", { number }))}
                    size="sm"
                    variant="ghost"
                  >
                    {t("recordReview.playQuestion")}
                  </Button>
                ) : null}
                {canPlay && question.answerRange ? (
                  <Button
                    onClick={() => focusQuestionWithPlayback(question.id, question.answerRange, t("recordReview.answerNumber", { number }))}
                    size="sm"
                    variant="ghost"
                  >
                    {t("recordReview.playAnswer")}
                  </Button>
                ) : null}
                {heatmapPath ? (
                  <ButtonLink size="sm" to={heatmapPath} variant="ghost">
                    {t("recordReview.openInPressureMap")}
                  </ButtonLink>
                ) : null}
                {question.linkedQuestionId ? (
                  <ButtonLink size="sm" to={routeConfig.answerEditor.buildPath({ questionId: question.linkedQuestionId })}>
                    {t("recordReview.practiceAnswer")}
                  </ButtonLink>
                ) : null}
                {question.deepLink?.canStartReplayMock && review.replayLaunchPreset ? (
                  <Button onClick={() => openReplayLauncher({ ...review.replayLaunchPreset!, seedQuestionIds: [question.id] })} size="sm">
                    {t("recordReview.replayFromHere")}
                  </Button>
                ) : null}
              </div>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

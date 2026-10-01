import { useLocale } from "../../../../shared/i18n";
import { Badge, Button } from "../../../../shared/ui/primitives";
import { threadActionLabel, type PlayRange, type ReplayPresetModel, type ReviewModel } from "../reviewModel";

/** Each opening question with the follow-ups it drew, and a replay of that chain. */
export function ThreadReviewPanel({
  review,
  selectedThreadRootQuestionId,
  setSelectedThreadRootQuestionId,
  jumpToQuestion,
  playRange,
  openReplayLauncher,
  canPlay,
}: {
  review: ReviewModel;
  selectedThreadRootQuestionId: string | null;
  setSelectedThreadRootQuestionId: (threadRootQuestionId: string | null) => void;
  jumpToQuestion: (targetQuestionId: string | null) => void;
  playRange: PlayRange;
  openReplayLauncher: (preset: ReplayPresetModel) => void;
  canPlay: boolean;
}) {
  const { t } = useLocale();

  if (review.followUpThreads.length === 0) {
    return <p className="record-panel__empty">{t("recordReview.noThreads")}</p>;
  }

  return (
    <ol className="record-list">
      {review.followUpThreads.map((thread) => {
        const number = thread.rootOrderIndex + 1;
        const nextStep = threadActionLabel(thread.recommendedAction, t);
        return (
          <li
            aria-current={selectedThreadRootQuestionId === thread.id ? "true" : undefined}
            className="record-item"
            id={`practical-thread-${thread.id}`}
            key={thread.id}
          >
            <p className="record-item__eyebrow">
              <span>{t("recordReview.questionNumber", { number })}</span>
              <span>{t("recordReview.threadCounts", { questions: thread.questionIds.length, followUps: thread.followUpCount, answered: thread.answeredQuestionCount })}</span>
              {thread.weakQuestionCount > 0 ? <Badge tone="danger">{t("recordReview.weakInThread", { count: thread.weakQuestionCount })}</Badge> : null}
              {thread.uncertainQuestionCount > 0 ? <Badge tone="warning">{t("recordReview.uncertain")}</Badge> : null}
              {thread.quantifiedQuestionCount > 0 ? <Badge tone="success">{t("recordReview.quantified")}</Badge> : null}
              {thread.tradeoffAwareQuestionCount > 0 ? <Badge tone="success">{t("recordReview.tradeoffAware")}</Badge> : null}
            </p>
            <h3 className="record-item__title">{thread.rootText}</h3>
            {nextStep ? (
              <p className="record-item__body">
                <span className="record-item__label">{t("recordReview.nextStep")}</span>
                {nextStep}
              </p>
            ) : null}
            <div className="record-item__actions">
              <Button
                onClick={() => {
                  setSelectedThreadRootQuestionId(thread.id);
                  jumpToQuestion(thread.id);
                }}
                size="sm"
                variant="ghost"
              >
                {t("recordReview.showQuestion")}
              </Button>
              {canPlay && thread.threadRange ? (
                <Button
                  onClick={() => {
                    setSelectedThreadRootQuestionId(thread.id);
                    void playRange(thread.threadRange, t("recordReview.threadNumber", { number }));
                  }}
                  size="sm"
                  variant="ghost"
                >
                  {t("recordReview.playThread")}
                </Button>
              ) : null}
              {thread.replayLaunchPreset ? (
                <Button onClick={() => openReplayLauncher(thread.replayLaunchPreset)} size="sm">
                  {t("recordReview.replayThread")}
                </Button>
              ) : null}
            </div>
          </li>
        );
      })}
    </ol>
  );
}

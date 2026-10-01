import type { useCreateInterviewSessionMutation } from "../../../../features/interview/api/useCreateInterviewSessionMutation";
import { useLocale } from "../../../../shared/i18n";
import { Button, Callout, Dialog, Field, Input, Select } from "../../../../shared/ui/primitives";
import { localizeReplayModeLabel, localizeReviewPayloadText, type ReplayPresetModel, type ReviewModel } from "../reviewModel";

/** Settings for a mock interview seeded from this record: how to replay it and how many questions. */
export function ReplayLaunchDialog({
  replayPreset,
  review,
  selectedReplayMode,
  setSelectedReplayMode,
  selectedQuestionCount,
  setSelectedQuestionCount,
  createReplayMutation,
  handleStartReplay,
  onClose,
}: {
  replayPreset: ReplayPresetModel;
  review: ReviewModel;
  selectedReplayMode: string;
  setSelectedReplayMode: (mode: string) => void;
  selectedQuestionCount: number;
  setSelectedQuestionCount: (count: number) => void;
  createReplayMutation: ReturnType<typeof useCreateInterviewSessionMutation>;
  handleStartReplay: () => Promise<void>;
  onClose: () => void;
}) {
  const { t } = useLocale();
  const readiness = review.replayReadiness;
  const seedCount = replayPreset?.seedQuestionIds.length ?? 0;

  return (
    <Dialog
      closeLabel={t("recordReview.close")}
      description={seedCount > 0 ? t("recordReview.replaySeeded", { count: seedCount }) : t("recordReview.replayDescription")}
      footer={
        <>
          <Button onClick={onClose} variant="ghost">
            {t("recordReview.cancel")}
          </Button>
          <Button
            disabled={!review.actionRecommendations.canReplay}
            loading={createReplayMutation.isPending}
            onClick={() => void handleStartReplay().catch(() => undefined)}
            variant="primary"
          >
            {t("recordReview.startReplay")}
          </Button>
        </>
      }
      onClose={onClose}
      open={replayPreset !== null}
      title={t("recordReview.replayTitle")}
    >
      {replayPreset ? (
        <div className="record-replay">
          <Field label={t("recordReview.replayMode")}>
            {(control) => (
              <Select {...control} onChange={(event) => setSelectedReplayMode(event.target.value)} value={selectedReplayMode}>
                {replayPreset.availableReplayModes.map((mode) => (
                  <option key={mode} value={mode}>
                    {localizeReplayModeLabel(replayPreset.availableReplayModeLabels[mode] ?? mode, t)}
                  </option>
                ))}
              </Select>
            )}
          </Field>
          <Field hint={t("recordReview.questionCountHint", { count: readiness.replayableQuestionCount })} label={t("recordReview.questionCount")}>
            {(control) => (
              <Input
                {...control}
                max={10}
                min={1}
                onChange={(event) => setSelectedQuestionCount(Number(event.target.value))}
                type="number"
                value={selectedQuestionCount}
              />
            )}
          </Field>
          {!readiness.ready && readiness.blockerDetails.length > 0 ? (
            <Callout title={t("recordReview.replayBlocked")} tone="warning">
              <ul className="record-review__reasons">
                {readiness.blockerDetails.map((blocker) => (
                  <li key={blocker.id}>
                    <strong>{localizeReviewPayloadText(blocker.label, t)}</strong> {blocker.description}
                  </li>
                ))}
              </ul>
            </Callout>
          ) : null}
        </div>
      ) : null}
    </Dialog>
  );
}

import { useState, type Dispatch, type SetStateAction } from "react";
import type { useUpdateInterviewTranscriptSegmentMutation } from "../../../../features/practical-interview/api/useUpdateInterviewTranscriptSegmentMutation";
import { useLocale } from "../../../../shared/i18n";
import { Badge, Button, Field, Input, Textarea } from "../../../../shared/ui/primitives";
import {
  localizeReviewPayloadText,
  type PlayRange,
  type ReviewModel,
  type ReviewTranscript,
  type SegmentDraftEdits,
} from "../reviewModel";

type Segment = ReviewTranscript["segments"][number];

/** The transcript, segment by segment: what to check first, playback, and inline corrections. */
export function TranscriptReviewPanel({
  review,
  transcript,
  draftEdits,
  setDraftEdits,
  selectedSegmentSequence,
  activePlaybackSegmentSequence,
  updateSegmentMutation,
  jumpToSegment,
  jumpToQuestion,
  playRange,
  setSelectedQuestionId,
  setSelectedThreadRootQuestionId,
  handleSaveSegment,
  canPlay,
}: {
  review: ReviewModel;
  transcript: ReviewTranscript;
  draftEdits: SegmentDraftEdits;
  setDraftEdits: Dispatch<SetStateAction<SegmentDraftEdits>>;
  selectedSegmentSequence: number | null;
  activePlaybackSegmentSequence: number | null;
  updateSegmentMutation: ReturnType<typeof useUpdateInterviewTranscriptSegmentMutation>;
  jumpToSegment: (sequence: number | null) => void;
  jumpToQuestion: (targetQuestionId: string | null) => void;
  playRange: PlayRange;
  setSelectedQuestionId: (questionId: string | null) => void;
  setSelectedThreadRootQuestionId: (threadRootQuestionId: string | null) => void;
  handleSaveSegment: (segmentId: string) => Promise<void>;
  canPlay: boolean;
}) {
  const { t } = useLocale();
  const [editing, setEditing] = useState<Set<string>>(() => new Set());
  const issues = review.transcriptIssueSummary;
  const questionStartBySequence = new Map(
    (review.timelineNavigation ?? [])
      .filter((item) => item.questionSegmentStartSequence && item.questionId)
      .map((item) => [item.questionSegmentStartSequence as number, item.questionId as string]),
  );

  function segmentRange(segment: Segment) {
    return {
      startMs: segment.startMs,
      endMs: segment.endMs,
      durationMs: Math.max(0, segment.endMs - segment.startMs),
      startTimestampLabel: segment.timestampLabel,
      endTimestampLabel: null,
    };
  }

  function updateDraft(segment: Segment, patch: Partial<SegmentDraftEdits[string]>) {
    setDraftEdits((current) => {
      const base = current[segment.id] ?? { speakerType: segment.speakerType, cleanedText: segment.cleanedText, confirmedText: segment.confirmedText };
      return { ...current, [segment.id]: { ...base, ...patch } };
    });
  }

  function closeEditor(segmentId: string) {
    setEditing((current) => {
      const next = new Set(current);
      next.delete(segmentId);
      return next;
    });
    setDraftEdits((current) => {
      const next = { ...current };
      delete next[segmentId];
      return next;
    });
  }

  return (
    <div className="record-panel">
      {issues.topPrioritySegmentActions.length > 0 ? (
        <section aria-labelledby="record-check-title" className="record-check">
          <h3 className="record-check__title" id="record-check-title">
            {t("recordReview.checkFirst")}
            <span className="record-check__counts">
              {t("recordReview.issueCounts", { lowConfidence: issues.lowConfidenceSegmentCount, unresolved: issues.unresolvedIssueCount })}
            </span>
          </h3>
          <ul className="record-check__list">
            {issues.topPrioritySegmentActions.map((action) => (
              <li key={action.id}>
                <button
                  className="record-check__item"
                  onClick={() => {
                    jumpToSegment(action.sequence);
                    if (canPlay) {
                      void playRange(action.seekRange, t("recordReview.segmentNumber", { sequence: action.sequence }));
                    }
                    if (action.linkedQuestionId) {
                      setSelectedQuestionId(action.linkedQuestionId);
                    }
                    if (action.threadRootQuestionId) {
                      setSelectedThreadRootQuestionId(action.threadRootQuestionId);
                    }
                  }}
                  type="button"
                >
                  <span className="record-check__segment">{t("recordReview.segmentNumber", { sequence: action.sequence })}</span>
                  <span>{localizeReviewPayloadText(action.triageReason, t) || localizeReviewPayloadText(action.ctaLabel, t)}</span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {transcript.segments.length === 0 ? <p className="record-panel__empty">{t("recordReview.noSegments")}</p> : null}

      <ol aria-label={t("recordReview.transcript")} className="record-transcript">
        {transcript.segments.map((segment) => {
          const draft = draftEdits[segment.id];
          const isEditing = editing.has(segment.id) || Boolean(draft);
          const isPlaying = activePlaybackSegmentSequence === segment.sequence;
          const questionId = questionStartBySequence.get(segment.sequence) ?? null;
          const text = segment.confirmedText || segment.cleanedText || segment.rawText;
          const classes = ["record-segment", selectedSegmentSequence === segment.sequence && "record-segment--selected", isPlaying && "record-segment--playing"]
            .filter(Boolean)
            .join(" ");

          return (
            <li aria-current={isPlaying ? "true" : undefined} className={classes} id={`practical-segment-${segment.sequence}`} key={segment.id}>
              <p className="record-segment__head">
                <strong>{localizeReviewPayloadText(segment.speakerLabel, t)}</strong>
                {segment.timestampLabel ? <span>{segment.timestampLabel}</span> : null}
                <span>{t("recordReview.segmentNumber", { sequence: segment.sequence })}</span>
                {isPlaying ? <Badge tone="accent">{t("recordReview.playingNow")}</Badge> : null}
                {segment.hasTextOverride ? <Badge tone="success">{t("recordReview.edited")}</Badge> : null}
                {segment.confidenceLabel ? <Badge>{segment.confidenceLabel}</Badge> : null}
              </p>

              {isEditing ? (
                <div className="record-segment__editor">
                  {segment.rawText ? (
                    <p className="record-segment__raw">
                      <span className="record-item__label">{t("recordReview.originalTranscript")}</span>
                      {segment.rawText}
                    </p>
                  ) : null}
                  <Field label={t("recordReview.speaker")}>
                    {(control) => (
                      <Input {...control} onChange={(event) => updateDraft(segment, { speakerType: event.target.value })} value={draft?.speakerType ?? segment.speakerType} />
                    )}
                  </Field>
                  <Field hint={t("recordReview.cleanedTextHint")} label={t("recordReview.cleanedText")}>
                    {(control) => (
                      <Textarea
                        {...control}
                        className="record-segment__input"
                        onChange={(event) => updateDraft(segment, { cleanedText: event.target.value })}
                        rows={3}
                        value={draft?.cleanedText ?? segment.cleanedText}
                      />
                    )}
                  </Field>
                  <Field hint={t("recordReview.confirmedTextHint")} label={t("recordReview.confirmedText")}>
                    {(control) => (
                      <Textarea
                        {...control}
                        className="record-segment__input"
                        onChange={(event) => updateDraft(segment, { confirmedText: event.target.value })}
                        rows={3}
                        value={draft?.confirmedText ?? segment.confirmedText}
                      />
                    )}
                  </Field>
                  <div className="record-item__actions">
                    {updateSegmentMutation.isError ? <span className="ui-tone-text--danger">{t("recordReview.segmentSaveFailed")}</span> : null}
                    <Button onClick={() => closeEditor(segment.id)} size="sm" variant="ghost">
                      {t("recordReview.cancel")}
                    </Button>
                    <Button
                      disabled={!draft}
                      loading={updateSegmentMutation.isPending}
                      onClick={() => {
                        handleSaveSegment(segment.id).then(
                          () => closeEditor(segment.id),
                          () => undefined,
                        );
                      }}
                      size="sm"
                      variant="primary"
                    >
                      {t("recordReview.saveSegment")}
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="record-segment__text">{text}</p>
                  <div className="record-item__actions">
                    {canPlay ? (
                      <Button onClick={() => void playRange(segmentRange(segment), t("recordReview.segmentNumber", { sequence: segment.sequence }))} size="sm" variant="ghost">
                        {t("recordReview.playSegment")}
                      </Button>
                    ) : null}
                    {questionId ? (
                      <Button onClick={() => jumpToQuestion(questionId)} size="sm" variant="ghost">
                        {t("recordReview.showQuestion")}
                      </Button>
                    ) : null}
                    <Button onClick={() => setEditing((current) => new Set(current).add(segment.id))} size="sm" variant="ghost">
                      {t("recordReview.editSegment")}
                    </Button>
                  </div>
                </>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}

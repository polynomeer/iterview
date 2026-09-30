import type { Dispatch, SetStateAction } from "react";
import type { useUpdateInterviewReviewMutation } from "../../../../features/practical-interview/api/useUpdateInterviewReviewMutation";
import type { useUpdateInterviewTranscriptSegmentMutation } from "../../../../features/practical-interview/api/useUpdateInterviewTranscriptSegmentMutation";
import { useLocale } from "../../../../shared/i18n";
import { MetricCard } from "../../../../shared/ui/MetricCard";
import {
  localizeReviewPayloadText,
  type PlayRange,
  type ReviewModel,
  type ReviewTranscript,
  type SegmentDraftEdits,
} from "../reviewModel";

/** Transcript lane: issue triage, bulk apply, and per-segment edits. */
export function TranscriptReviewPanel({
  review,
  transcript,
  draftEdits,
  setDraftEdits,
  dirtyEditCount,
  selectedSegmentSequence,
  activePlaybackSegmentSequence,
  updateReviewMutation,
  updateSegmentMutation,
  jumpToSegment,
  jumpToQuestion,
  playRange,
  setSelectedQuestionId,
  setSelectedThreadRootQuestionId,
  handleApplyBulkEdits,
  handleSaveSegment,
}: {
  review: ReviewModel;
  transcript: ReviewTranscript;
  draftEdits: SegmentDraftEdits;
  setDraftEdits: Dispatch<SetStateAction<SegmentDraftEdits>>;
  dirtyEditCount: number;
  selectedSegmentSequence: number | null;
  activePlaybackSegmentSequence: number | null;
  updateReviewMutation: ReturnType<typeof useUpdateInterviewReviewMutation>;
  updateSegmentMutation: ReturnType<typeof useUpdateInterviewTranscriptSegmentMutation>;
  jumpToSegment: (sequence: number | null) => void;
  jumpToQuestion: (targetQuestionId: string | null) => void;
  playRange: PlayRange;
  setSelectedQuestionId: (questionId: string | null) => void;
  setSelectedThreadRootQuestionId: (threadRootQuestionId: string | null) => void;
  handleApplyBulkEdits: (confirmAfterApply?: boolean) => Promise<void>;
  handleSaveSegment: (segmentId: string) => Promise<void>;
}) {
  const { t } = useLocale();

  return (
    <div className="page-stack">
      <span className="page-card__label">{t("practicalReviewPanels.transcript")}</span>
      <h2 className="page-card__title">{t("practicalReviewPanels.transcriptIssuesSegmentEdits")}</h2>
      <div className="stats-grid">
        <MetricCard label={t("practicalReviewPanels.lowConfidence")} value={String(review.transcriptIssueSummary.lowConfidenceSegmentCount)} />
        <MetricCard label={t("practicalReviewPanels.speakerOverrides")} tone="muted" value={String(review.transcriptIssueSummary.speakerOverrideSegmentCount)} />
        <MetricCard label={t("practicalReviewPanels.confirmedOverrides")} tone="accent" value={String(review.transcriptIssueSummary.confirmedTextOverrideCount)} />
        <MetricCard label={t("practicalReviewPanels.unresolved")} tone="muted" value={String(review.transcriptIssueSummary.unresolvedIssueCount)} />
      </div>
      <div className="stack-list">
        {review.transcriptIssueSummary.topPrioritySegmentActions.map((action) => (
          <button
            className="list-item-card"
            key={action.id}
            onClick={() => {
              jumpToSegment(action.sequence);
              void playRange(action.seekRange, t("practicalReviewPanels.segmentLabel", { sequence: action.sequence }));
              if (action.linkedQuestionId) {
                setSelectedQuestionId(action.linkedQuestionId);
              }
              if (action.threadRootQuestionId) {
                setSelectedThreadRootQuestionId(action.threadRootQuestionId);
              }
            }}
            type="button"
          >
            <div className="list-item-card__content">
              <div className="list-item-card__meta">
                <span>{t("practicalReviewPanels.segmentLabel", { sequence: action.sequence })}</span>
                <span>{localizeReviewPayloadText(action.severity, t)}</span>
                <span>{localizeReviewPayloadText(action.priority, t)}</span>
              </div>
              <h3 className="list-item-card__title">{localizeReviewPayloadText(action.ctaLabel, t)}</h3>
              <p className="list-item-card__body">{localizeReviewPayloadText(action.triageReason, t)}</p>
            </div>
          </button>
        ))}
      </div>
      <div className="page-card__actions">
        <button
          className="secondary-button"
          disabled={dirtyEditCount === 0 || updateReviewMutation.isPending}
          onClick={() => {
            void handleApplyBulkEdits(false);
          }}
          type="button"
        >
          {updateReviewMutation.isPending ? t("practicalReviewPanels.applying") : t("practicalReviewPanels.applyReviewedEdits")}
        </button>
      </div>
      <div className="stack-list">
        {transcript.segments.map((segment) => {
          const draft = draftEdits[segment.id];
          const cleanedText = draft?.cleanedText ?? segment.cleanedText;
          const confirmedText = draft?.confirmedText ?? segment.confirmedText;
          const speakerType = draft?.speakerType ?? segment.speakerType;
          const isSelected = selectedSegmentSequence === segment.sequence;
          const isPlaybackActive = activePlaybackSegmentSequence === segment.sequence;

          return (
            <article
              aria-current={isPlaybackActive ? "true" : undefined}
              className={`page-card page-card--inset practical-transcript-segment${isSelected ? " practical-transcript-segment--selected" : ""}${isPlaybackActive ? " practical-transcript-segment--active" : ""}`}
              id={`practical-segment-${segment.sequence}`}
              key={segment.id}
            >
              <div className="section-heading">
                <div>
                  <p className="section-heading__eyebrow">
                    {t("practicalReviewPanels.segmentLabel", { sequence: segment.sequence })}
                  </p>
                  <h3 className="page-card__title">
                    {localizeReviewPayloadText(segment.speakerLabel, t)}
                    {segment.timestampLabel ? ` · ${segment.timestampLabel}` : ""}
                  </h3>
                </div>
                <div className="chip-list">
                  {isPlaybackActive ? (
                    <span className="detail-chip detail-chip--accent">{t("practicalReviewPanels.playingNow")}</span>
                  ) : null}
                  {segment.confidenceLabel ? (
                    <span className="detail-chip">{segment.confidenceLabel}</span>
                  ) : null}
                  {segment.hasTextOverride ? (
                    <span className="detail-chip detail-chip--accent">{t("practicalReviewPanels.edited")}</span>
                  ) : null}
                </div>
              </div>
              {segment.rawText ? (
                <div className="practical-transcript-segment__source">
                  <p className="practical-transcript-segment__source-label">
                    {t("practicalReviewPanels.originalTranscript")}
                  </p>
                  <p className="page-card__body practical-transcript-segment__source-body">
                    {segment.rawText}
                  </p>
                </div>
              ) : null}
              <div className="form-grid">
                <label className="form-field">
                  <span className="form-field__label">{t("practicalReviewPanels.speaker")}</span>
                  <input
                    className="form-input"
                    onChange={(event) =>
                      setDraftEdits((current) => ({
                        ...current,
                        [segment.id]: {
                          speakerType: event.target.value,
                          cleanedText,
                          confirmedText,
                        },
                      }))
                    }
                    type="text"
                    value={speakerType}
                  />
                </label>
                <label className="form-field practical-editor-field">
                  <span className="form-field__label">{t("practicalReviewPanels.cleanedText")}</span>
                  <span className="practical-editor-field__helper">
                    {t("practicalReviewPanels.preserveSpeakerMeaningWhile")}
                  </span>
                  <textarea
                    className="form-input form-input--textarea"
                    onChange={(event) =>
                      setDraftEdits((current) => ({
                        ...current,
                        [segment.id]: {
                          speakerType,
                          cleanedText: event.target.value,
                          confirmedText,
                        },
                      }))
                    }
                    rows={3}
                    value={cleanedText}
                  />
                </label>
                <label className="form-field practical-editor-field">
                  <span className="form-field__label">{t("practicalReviewPanels.confirmedText")}</span>
                  <span className="practical-editor-field__helper">
                    {t("practicalReviewPanels.useOnlyWhenYou")}
                  </span>
                  <textarea
                    className="form-input form-input--textarea"
                    onChange={(event) =>
                      setDraftEdits((current) => ({
                        ...current,
                        [segment.id]: {
                          speakerType,
                          cleanedText,
                          confirmedText: event.target.value,
                        },
                      }))
                    }
                    rows={3}
                    value={confirmedText}
                  />
                </label>
              </div>
              <div className="page-card__actions">
                <button
                  className="secondary-button"
                  disabled={!draft || updateSegmentMutation.isPending}
                  onClick={() => {
                    void handleSaveSegment(segment.id);
                  }}
                  type="button"
                >
                  {t("practicalReviewPanels.saveSegment")}
                </button>
                {review.timelineNavigation?.find(
                  (item) => item.questionSegmentStartSequence === segment.sequence,
                )
                  ?.questionId ? (
                    <button
                      className="secondary-button"
                      onClick={() =>
                        jumpToQuestion(
                          review.timelineNavigation?.find(
                            (item) => item.questionSegmentStartSequence === segment.sequence,
                          )?.questionId ?? null,
                        )
                      }
                      type="button"
                    >
                      {t("practicalReviewPanels.jumpQuestion")}
                    </button>
                  ) : null}
                <button
                  className="secondary-button"
                  onClick={() => {
                    void playRange(
                      {
                        startMs: segment.startMs,
                        endMs: segment.endMs,
                        durationMs: Math.max(0, segment.endMs - segment.startMs),
                        startTimestampLabel: segment.timestampLabel,
                        endTimestampLabel: null,
                      },
                      t("practicalReviewPanels.segmentLabel", { sequence: segment.sequence }),
                    );
                  }}
                  type="button"
                >
                  {t("practicalReviewPanels.playSegment")}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

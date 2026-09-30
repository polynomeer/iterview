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
  const { locale } = useLocale();
  const isKorean = locale === "ko";

  return (
    <div className="page-stack">
      <span className="page-card__label">{isKorean ? "전사" : "Transcript"}</span>
      <h2 className="page-card__title">{isKorean ? "전사 이슈와 세그먼트 수정" : "Transcript issues and segment edits"}</h2>
      <div className="stats-grid">
        <MetricCard label={isKorean ? "낮은 신뢰도" : "Low confidence"} value={String(review.transcriptIssueSummary.lowConfidenceSegmentCount)} />
        <MetricCard label={isKorean ? "화자 수정" : "Speaker overrides"} tone="muted" value={String(review.transcriptIssueSummary.speakerOverrideSegmentCount)} />
        <MetricCard label={isKorean ? "확정본 수정" : "Confirmed overrides"} tone="accent" value={String(review.transcriptIssueSummary.confirmedTextOverrideCount)} />
        <MetricCard label={isKorean ? "미해결" : "Unresolved"} tone="muted" value={String(review.transcriptIssueSummary.unresolvedIssueCount)} />
      </div>
      <div className="stack-list">
        {review.transcriptIssueSummary.topPrioritySegmentActions.map((action) => (
          <button
            className="list-item-card"
            key={action.id}
            onClick={() => {
              jumpToSegment(action.sequence);
              void playRange(action.seekRange, isKorean ? `${action.sequence}번 세그먼트` : `Segment ${action.sequence}`);
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
                <span>{isKorean ? `${action.sequence}번 세그먼트` : `Segment ${action.sequence}`}</span>
                <span>{localizeReviewPayloadText(action.severity, isKorean)}</span>
                <span>{localizeReviewPayloadText(action.priority, isKorean)}</span>
              </div>
              <h3 className="list-item-card__title">{localizeReviewPayloadText(action.ctaLabel, isKorean)}</h3>
              <p className="list-item-card__body">{localizeReviewPayloadText(action.triageReason, isKorean)}</p>
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
          {updateReviewMutation.isPending ? (isKorean ? "적용 중..." : "Applying...") : isKorean ? "검토한 수정 적용" : "Apply reviewed edits"}
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
                    {isKorean ? `${segment.sequence}번 세그먼트` : `Segment ${segment.sequence}`}
                  </p>
                  <h3 className="page-card__title">
                    {localizeReviewPayloadText(segment.speakerLabel, isKorean)}
                    {segment.timestampLabel ? ` · ${segment.timestampLabel}` : ""}
                  </h3>
                </div>
                <div className="chip-list">
                  {isPlaybackActive ? (
                    <span className="detail-chip detail-chip--accent">{isKorean ? "현재 재생 중" : "Playing now"}</span>
                  ) : null}
                  {segment.confidenceLabel ? (
                    <span className="detail-chip">{segment.confidenceLabel}</span>
                  ) : null}
                  {segment.hasTextOverride ? (
                    <span className="detail-chip detail-chip--accent">{isKorean ? "수정됨" : "Edited"}</span>
                  ) : null}
                </div>
              </div>
              {segment.rawText ? (
                <div className="practical-transcript-segment__source">
                  <p className="practical-transcript-segment__source-label">
                    {isKorean ? "원본 전사" : "Original transcript"}
                  </p>
                  <p className="page-card__body practical-transcript-segment__source-body">
                    {segment.rawText}
                  </p>
                </div>
              ) : null}
              <div className="form-grid">
                <label className="form-field">
                  <span className="form-field__label">{isKorean ? "화자" : "Speaker"}</span>
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
                  <span className="form-field__label">{isKorean ? "정리된 텍스트" : "Cleaned text"}</span>
                  <span className="practical-editor-field__helper">
                    {isKorean ? "명백한 음성 인식 잡음을 제거하되 화자의 의미는 유지하세요." : "Preserve the speaker meaning while removing obvious ASR noise."}
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
                  <span className="form-field__label">{isKorean ? "확정 텍스트" : "Confirmed text"}</span>
                  <span className="practical-editor-field__helper">
                    {isKorean ? "최종 검토 문구를 정리된 텍스트와 다르게 확정할 때만 사용하세요." : "Use only when you want the final reviewed wording to differ from cleaned text."}
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
                  {isKorean ? "세그먼트 저장" : "Save segment"}
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
                      {isKorean ? "질문으로 이동" : "Jump to question"}
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
                      isKorean ? `${segment.sequence}번 세그먼트` : `Segment ${segment.sequence}`,
                    );
                  }}
                  type="button"
                >
                  {isKorean ? "세그먼트 재생" : "Play segment"}
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}

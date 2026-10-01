import { useState, type RefObject } from "react";
import { useLocale } from "../../../../shared/i18n";
import { Button, Card, CardHeader, Segmented, Select } from "../../../../shared/ui/primitives";
import { formatDurationLabel, truncateText, type PlaybackRange } from "../reviewModel";

type NavigatorItem = { id: string; startMs: number; endMs: number; timestampLabel: string | null; title: string; meta: string; body: string | null };

const RATES = [0.75, 1, 1.25, 1.5, 2];

/** The interview recording with a jump list of transcript segments or question chapters. */
export function ReplayPlayer(props: {
  playback: {
    playbackAvailable: boolean;
    sourceAudioFileUrl: string | null;
    sourceAudioFileName: string | null;
    audioDurationMs: number | null;
  } | null;
  currentTimeMs: number;
  isPlaying: boolean;
  playbackRate: number;
  audioSourceUrl: string | null;
  activeRangeLabel: string | null;
  transcriptTimeline: Array<{
    id: string;
    sequence: number;
    startMs: number;
    endMs: number;
    timestampLabel: string | null;
    speakerLabel: string;
    text: string;
  }>;
  chapters: Array<{
    id: string;
    label: string;
    startMs: number;
    endMs: number;
    timestampLabel: string | null;
    supportingText: string | null;
    isFollowUp: boolean;
  }>;
  audioRef: RefObject<HTMLAudioElement | null>;
  onTogglePlay: () => void;
  onSeekToMs: (ms: number) => void;
  onPlayRange: (range: PlaybackRange, label: string) => void;
  onPlaybackRateChange: (rate: number) => void;
}) {
  const { t } = useLocale();
  const [mode, setMode] = useState<"chapters" | "timeline">("chapters");

  if (!props.playback?.playbackAvailable || !props.playback.sourceAudioFileUrl) {
    return null;
  }

  const durationMs = props.playback.audioDurationMs ?? 0;
  const items: NavigatorItem[] =
    mode === "timeline"
      ? props.transcriptTimeline.map((segment) => ({
          id: segment.id,
          startMs: segment.startMs,
          endMs: segment.endMs,
          timestampLabel: segment.timestampLabel,
          title: t("recordReview.segmentNumber", { sequence: segment.sequence }),
          meta: segment.speakerLabel,
          body: truncateText(segment.text),
        }))
      : props.chapters.map((chapter) => ({
          id: chapter.id,
          startMs: chapter.startMs,
          endMs: chapter.endMs,
          timestampLabel: chapter.timestampLabel,
          title: chapter.label,
          meta: chapter.isFollowUp ? t("recordReview.followUp") : t("recordReview.mainQuestion"),
          body: chapter.supportingText ? truncateText(chapter.supportingText) : null,
        }));

  return (
    <Card aria-labelledby="record-player-title" className="record-player">
      <CardHeader
        meta={
          <span className="record-player__time">
            {formatDurationLabel(props.currentTimeMs)} / {formatDurationLabel(durationMs)}
          </span>
        }
        title={<span id="record-player-title">{t("recordReview.recording")}</span>}
        titleAs="h2"
      />
      <div className="record-player__body">
        <audio preload="metadata" ref={props.audioRef} src={props.audioSourceUrl ?? undefined} />
        <p className="record-player__now">{props.activeRangeLabel ?? props.playback.sourceAudioFileName ?? t("recordReview.recording")}</p>
        <input
          aria-label={t("recordReview.position")}
          className="record-player__scrubber"
          max={durationMs || 0}
          min={0}
          onChange={(event) => props.onSeekToMs(Number(event.target.value))}
          step={250}
          type="range"
          value={Math.min(props.currentTimeMs, durationMs || props.currentTimeMs)}
        />
        <div className="record-player__controls">
          <Button onClick={props.onTogglePlay} size="sm" variant="primary">
            {props.isPlaying ? t("recordReview.pause") : t("recordReview.play")}
          </Button>
          <Button aria-label={t("recordReview.back5")} onClick={() => props.onSeekToMs(props.currentTimeMs - 5000)} size="sm" variant="ghost">
            −5s
          </Button>
          <Button aria-label={t("recordReview.forward5")} onClick={() => props.onSeekToMs(props.currentTimeMs + 5000)} size="sm" variant="ghost">
            +5s
          </Button>
          <Select
            aria-label={t("recordReview.playbackRate")}
            className="record-player__rate"
            onChange={(event) => props.onPlaybackRateChange(Number(event.target.value))}
            value={props.playbackRate}
          >
            {RATES.map((rate) => (
              <option key={rate} value={rate}>
                {rate}x
              </option>
            ))}
          </Select>
        </div>
        <Segmented<"chapters" | "timeline">
          items={[
            { id: "chapters", label: t("recordReview.chapters") },
            { id: "timeline", label: t("recordReview.timeline") },
          ]}
          label={t("recordReview.jumpTo")}
          onChange={setMode}
          value={mode}
        />
      </div>
      {items.length === 0 ? (
        <p className="record-panel__empty">{mode === "timeline" ? t("recordReview.noTimeline") : t("recordReview.noChapters")}</p>
      ) : (
        <ul aria-label={t("recordReview.jumpTo")} className="record-player__list">
          {items.map((item) => {
            const active = props.currentTimeMs >= item.startMs && props.currentTimeMs <= item.endMs;
            return (
              <li key={item.id}>
                <button
                  aria-current={active ? "true" : undefined}
                  className="record-player__item"
                  onClick={() =>
                    props.onPlayRange(
                      { startMs: item.startMs, endMs: item.endMs, durationMs: Math.max(0, item.endMs - item.startMs), startTimestampLabel: item.timestampLabel, endTimestampLabel: null },
                      item.title,
                    )
                  }
                  type="button"
                >
                  <span className="record-player__item-meta">
                    {item.timestampLabel ?? formatDurationLabel(item.startMs)} · {item.meta}
                  </span>
                  <span className="record-player__item-title">{item.title}</span>
                  {item.body ? <span className="record-player__item-body">{item.body}</span> : null}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </Card>
  );
}

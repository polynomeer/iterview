import { useState, type RefObject } from "react";
import { useLocale } from "../../../../shared/i18n";
import { formatDurationLabel, truncateText } from "../reviewModel";

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
  onPlayRange: (range: { startMs: number; endMs: number; durationMs: number; startTimestampLabel: string | null; endTimestampLabel: string | null; }, label: string) => void;
  onPlaybackRateChange: (rate: number) => void;
}) {
  const { locale } = useLocale();
  const isKorean = locale === "ko";
  const [navigatorMode, setNavigatorMode] = useState<"timeline" | "chapters">("timeline");

  if (!props.playback?.playbackAvailable || !props.playback.sourceAudioFileUrl) {
    return null;
  }

  const durationMs = props.playback.audioDurationMs ?? 0;
  const progress = durationMs > 0 ? Math.min(100, (props.currentTimeMs / durationMs) * 100) : 0;
  const playerItems = navigatorMode === "timeline" ? props.transcriptTimeline : props.chapters;

  return (
    <section className="page-card practical-audio-player">
      <span className="page-card__label">{isKorean ? "오디오 리플레이" : "Audio replay"}</span>
      <div className="section-heading">
        <div>
          <h2 className="page-card__title">
            {props.playback.sourceAudioFileName ?? (isKorean ? "면접 녹음 파일" : "Interview recording")}
          </h2>
          <p className="page-card__body">
            {props.activeRangeLabel ??
              (isKorean
                ? "전사, 질문, 스레드 리플레이 동작으로 원하는 구간으로 바로 이동할 수 있습니다."
                : "Use transcript, question, or thread replay actions to jump to one clip.")}
          </p>
        </div>
        <div className="chip-list">
          <span className="detail-chip">
            {formatDurationLabel(props.currentTimeMs)} / {formatDurationLabel(durationMs)}
          </span>
        </div>
      </div>
      <audio preload="metadata" ref={props.audioRef} src={props.audioSourceUrl ?? undefined} />
      <div className="practical-audio-player__progress">
        <input
          aria-label={isKorean ? "리플레이 위치" : "Replay position"}
          className="practical-audio-player__scrubber"
          max={durationMs || 0}
          min={0}
          onChange={(event) => props.onSeekToMs(Number(event.target.value))}
          step={250}
          type="range"
          value={Math.min(props.currentTimeMs, durationMs || props.currentTimeMs)}
        />
        <div className="practical-audio-player__progress-bar">
          <span style={{ width: `${progress}%` }} />
        </div>
        <div className="practical-audio-player__progress-meta">
          <span>{formatDurationLabel(props.currentTimeMs)}</span>
          <span>{formatDurationLabel(durationMs)}</span>
        </div>
      </div>
      <div className="page-card__actions practical-audio-player__actions">
        <button className="primary-button practical-audio-player__button" onClick={props.onTogglePlay} type="button">
          {props.isPlaying ? (isKorean ? "일시정지" : "Pause") : isKorean ? "재생" : "Play"}
        </button>
        <button
          className="secondary-button practical-audio-player__button"
          onClick={() => props.onSeekToMs(props.currentTimeMs - 5000)}
          type="button"
        >
          -5s
        </button>
        <button
          className="secondary-button practical-audio-player__button"
          onClick={() => props.onSeekToMs(props.currentTimeMs + 5000)}
          type="button"
        >
          +5s
        </button>
        <select
          aria-label={isKorean ? "재생 속도" : "Playback rate"}
          className="form-input practical-audio-player__rate-input"
          onChange={(event) => props.onPlaybackRateChange(Number(event.target.value))}
          value={props.playbackRate}
        >
          {[0.75, 1, 1.25, 1.5, 2].map((rate) => (
            <option key={rate} value={rate}>
              {rate}x
            </option>
          ))}
        </select>
      </div>
      <div className="practical-audio-player__navigator">
        <div className="chip-list">
          <button
            className={navigatorMode === "timeline" ? "primary-button" : "secondary-button"}
            onClick={() => setNavigatorMode("timeline")}
            type="button"
          >
            {isKorean ? "타임라인" : "Timeline"}
          </button>
          <button
            className={navigatorMode === "chapters" ? "primary-button" : "secondary-button"}
            onClick={() => setNavigatorMode("chapters")}
            type="button"
          >
            {isKorean ? "챕터" : "Chapters"}
          </button>
        </div>
        <div className="stack-list practical-audio-player__navigator-list">
          {playerItems.length === 0 ? (
            <p className="page-card__body">
              {navigatorMode === "timeline"
                ? isKorean
                  ? "세그먼트 리플레이 데이터가 준비되면 전사 시점이 여기에 표시됩니다."
                  : "Transcript timestamps will appear here when segment replay data is available."
                : isKorean
                  ? "질문 리플레이 구간이 준비되면 질문 챕터가 여기에 표시됩니다."
                  : "Question chapters will appear here when question replay ranges are available."}
            </p>
          ) : null}
          {navigatorMode === "timeline"
            ? props.transcriptTimeline.map((segment) => {
                const isActive =
                  props.currentTimeMs >= segment.startMs && props.currentTimeMs <= segment.endMs;

                return (
                  <button
                    className={`list-item-card practical-audio-player__item ${
                      isActive ? "practical-audio-player__item--active" : ""
                    }`}
                    key={segment.id}
                    onClick={() =>
                      props.onPlayRange(
                        {
                          startMs: segment.startMs,
                          endMs: segment.endMs,
                          durationMs: Math.max(0, segment.endMs - segment.startMs),
                          startTimestampLabel: segment.timestampLabel,
                          endTimestampLabel: null,
                        },
                        isKorean ? `${segment.sequence}번 세그먼트` : `Segment ${segment.sequence}`,
                      )
                    }
                    type="button"
                  >
                    <div className="list-item-card__content">
                      <div className="list-item-card__meta">
                        <span>{segment.timestampLabel ?? formatDurationLabel(segment.startMs)}</span>
                        <span>{segment.speakerLabel}</span>
                      </div>
                      <h3 className="list-item-card__title">
                        {isKorean ? `${segment.sequence}번 세그먼트` : `Segment ${segment.sequence}`}
                      </h3>
                      <p className="list-item-card__body">{truncateText(segment.text)}</p>
                    </div>
                  </button>
                );
              })
            : props.chapters.map((chapter) => {
                const isActive =
                  props.currentTimeMs >= chapter.startMs && props.currentTimeMs <= chapter.endMs;

                return (
                  <button
                    className={`list-item-card practical-audio-player__item ${
                      isActive ? "practical-audio-player__item--active" : ""
                    }`}
                    key={chapter.id}
                    onClick={() =>
                      props.onPlayRange(
                        {
                          startMs: chapter.startMs,
                          endMs: chapter.endMs,
                          durationMs: Math.max(0, chapter.endMs - chapter.startMs),
                          startTimestampLabel: chapter.timestampLabel,
                          endTimestampLabel: null,
                        },
                        chapter.label,
                      )
                    }
                    type="button"
                  >
                    <div className="list-item-card__content">
                      <div className="list-item-card__meta">
                        <span>{chapter.timestampLabel ?? formatDurationLabel(chapter.startMs)}</span>
                        <span>{chapter.isFollowUp ? (isKorean ? "꼬리질문" : "Follow-up") : isKorean ? "메인" : "Main"}</span>
                      </div>
                      <h3 className="list-item-card__title">{chapter.label}</h3>
                      {chapter.supportingText ? (
                        <p className="list-item-card__body">{truncateText(chapter.supportingText)}</p>
                      ) : null}
                    </div>
                  </button>
                );
              })}
        </div>
      </div>
    </section>
  );
}

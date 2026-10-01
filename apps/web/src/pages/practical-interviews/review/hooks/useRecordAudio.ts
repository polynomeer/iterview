import { useEffect, useRef, useState, type SyntheticEvent } from "react";
import { getInterviewRecordAudioRequest } from "../../../../shared/api/practicalInterviewApi";
import type { PlaybackRange } from "../reviewModel";

/**
 * Audio element and replay player state for one interview record: loads the recording as an
 * object URL, tracks playback time, and plays bounded ranges (segments, questions, threads).
 */
export function useRecordAudio(recordId: string | undefined, playbackSourceAudioFileUrl: string | null | undefined) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const activeRangeEndRef = useRef<number | null>(null);
  const [currentTimeMs, setCurrentTimeMs] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const [audioSourceUrl, setAudioSourceUrl] = useState<string | null>(null);
  const [activeReplayLabel, setActiveReplayLabel] = useState<string | null>(null);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [audioSourceUrl, playbackRate]);

  // Passed as props on <audio> so they always reach the element React rendered. Listeners added in an
  // effect missed an element that mounted later, which left the play button reading 재생 while playing.
  const audioEvents = {
    onTimeUpdate: (event: SyntheticEvent<HTMLAudioElement>) => {
      const audio = event.currentTarget;
      const nextTimeMs = audio.currentTime * 1000;
      setCurrentTimeMs(nextTimeMs);

      if (activeRangeEndRef.current !== null && nextTimeMs >= activeRangeEndRef.current) {
        activeRangeEndRef.current = null;
        audio.pause();
      }
    },
    onPlay: () => setIsPlayingAudio(true),
    onPause: () => setIsPlayingAudio(false),
    onEnded: () => setIsPlayingAudio(false),
    onLoadedMetadata: (event: SyntheticEvent<HTMLAudioElement>) => {
      event.currentTarget.playbackRate = playbackRate;
    },
  };

  useEffect(() => {
    if (!recordId || !playbackSourceAudioFileUrl || typeof URL.createObjectURL !== "function") {
      setAudioSourceUrl(null);
      return undefined;
    }

    const controller = new AbortController();
    let active = true;
    let objectUrl: string | null = null;

    setAudioSourceUrl(null);
    void getInterviewRecordAudioRequest(recordId, controller.signal)
      .then((audioBlob) => {
        if (!active) {
          return;
        }
        objectUrl = URL.createObjectURL(audioBlob);
        setAudioSourceUrl(objectUrl);
      })
      .catch((error: unknown) => {
        if (active && !(error instanceof DOMException && error.name === "AbortError")) {
          setAudioSourceUrl(null);
        }
      });

    return () => {
      active = false;
      controller.abort();
      if (objectUrl) {
        URL.revokeObjectURL(objectUrl);
      }
    };
  }, [playbackSourceAudioFileUrl, recordId]);

  async function playRange(range: PlaybackRange | null | undefined, label: string) {
    const audio = audioRef.current;

    if (!audio || !range) {
      return;
    }

    activeRangeEndRef.current = range.endMs;
    audio.currentTime = range.startMs / 1000;
    setCurrentTimeMs(range.startMs);
    setActiveReplayLabel(
      range.startTimestampLabel && range.endTimestampLabel
        ? `${label} · ${range.startTimestampLabel} - ${range.endTimestampLabel}`
        : label,
    );

    try {
      await audio.play();
    } catch {
      setIsPlayingAudio(false);
    }
  }

  function seekToMs(ms: number) {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    const nextMs = Math.max(0, ms);
    activeRangeEndRef.current = null;
    setActiveReplayLabel(null);
    audio.currentTime = nextMs / 1000;
    setCurrentTimeMs(nextMs);
  }

  function toggleAudioPlayback() {
    const audio = audioRef.current;

    if (!audio) {
      return;
    }

    if (audio.paused) {
      void audio.play();
      return;
    }

    audio.pause();
  }

  return {
    audioRef,
    audioEvents,
    currentTimeMs,
    playbackRate,
    setPlaybackRate,
    isPlayingAudio,
    audioSourceUrl,
    activeReplayLabel,
    playRange,
    seekToMs,
    toggleAudioPlayback,
  };
}

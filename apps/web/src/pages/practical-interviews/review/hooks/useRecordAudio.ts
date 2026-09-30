import { useEffect, useRef, useState } from "react";
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
    const audio = audioRef.current;

    if (!audio) {
      return undefined;
    }

    const handleTimeUpdate = () => {
      const nextTimeMs = audio.currentTime * 1000;
      setCurrentTimeMs(nextTimeMs);

      if (activeRangeEndRef.current !== null && nextTimeMs >= activeRangeEndRef.current) {
        audio.pause();
        setIsPlayingAudio(false);
      }
    };
    const handlePlay = () => setIsPlayingAudio(true);
    const handlePause = () => setIsPlayingAudio(false);

    audio.playbackRate = playbackRate;
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
    };
  }, [audioSourceUrl, playbackRate]);

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

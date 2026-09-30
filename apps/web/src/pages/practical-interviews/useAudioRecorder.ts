import { useEffect, useRef, useState } from "react";

export const MAX_AUDIO_FILE_SIZE_BYTES = 50 * 1024 * 1024;

export type RecorderError = "too-large" | "consent" | "unsupported" | "permission";

/**
 * Picks an audio file or records one from the microphone. Recording needs explicit consent;
 * files over 50 MB are rejected. Stops the microphone on unmount.
 */
export function useAudioRecorder() {
  const [file, setFile] = useState<File | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [seconds, setSeconds] = useState(0);
  const [error, setError] = useState<RecorderError | null>(null);
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(
    () => () => {
      recorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    },
    [],
  );

  useEffect(() => {
    if (!isRecording) {
      return undefined;
    }
    const timer = window.setInterval(() => setSeconds((current) => current + 1), 1000);
    return () => window.clearInterval(timer);
  }, [isRecording]);

  function selectFile(next: File | null) {
    setError(null);
    if (next && next.size > MAX_AUDIO_FILE_SIZE_BYTES) {
      setFile(null);
      setError("too-large");
      return false;
    }
    setFile(next);
    return true;
  }

  async function start(hasConsent: boolean) {
    setError(null);
    if (!hasConsent) {
      setError("consent");
      return;
    }
    if (!navigator.mediaDevices?.getUserMedia || typeof MediaRecorder === "undefined") {
      setError("unsupported");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mimeType = ["audio/webm;codecs=opus", "audio/webm"].find((candidate) => MediaRecorder.isTypeSupported(candidate));
      const recorder = mimeType ? new MediaRecorder(stream, { mimeType }) : new MediaRecorder(stream);
      streamRef.current = stream;
      recorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        streamRef.current?.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        recorderRef.current = null;
        chunksRef.current = [];
        if (blob.size > 0) {
          selectFile(new File([blob], `iterview-recording-${new Date().toISOString().replace(/[:.]/g, "-")}.webm`, { type: blob.type }));
        }
        setIsRecording(false);
      };
      recorder.start();
      setSeconds(0);
      setIsRecording(true);
    } catch {
      setError("permission");
    }
  }

  function stop() {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  }

  function discard() {
    setFile(null);
    setError(null);
  }

  return { file, isRecording, seconds, error, selectFile, start, stop, discard };
}

export function formatDuration(seconds: number) {
  return `${String(Math.floor(seconds / 60)).padStart(2, "0")}:${String(seconds % 60).padStart(2, "0")}`;
}

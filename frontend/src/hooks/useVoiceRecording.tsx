import { useState, useRef, useCallback } from "react";
import { blobToBase64 } from "@/utils/audioUtils";

type RecordingState = "idle" | "recording" | "processing";

interface UseVoiceRecordingReturn {
  state: RecordingState;
  startRecording: () => Promise<boolean>;
  stopRecording: () => Promise<string | null>;
  error: string | null;
}

export const useVoiceRecording = (): UseVoiceRecordingReturn => {
  const [state, setState] = useState<RecordingState>("idle");
  const [error, setError] = useState<string | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recordingStartTimeRef = useRef<number | null>(null);
  const lastRecordingTimeRef = useRef<number>(0);

  const startRecording = useCallback(async (): Promise<boolean> => {
    try {
      // Prevent rapid triggering (debounce: minimum 500ms between recordings)
      const now = Date.now();
      if (now - lastRecordingTimeRef.current < 500) {
        console.log("Recording triggered too quickly, ignoring");
        return false;
      }

      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 44100,
        }
      });

      // Determine the best supported MIME type
      const mimeType = MediaRecorder.isTypeSupported("audio/webm")
        ? "audio/webm"
        : "audio/mp4";

      const mediaRecorder = new MediaRecorder(stream, { mimeType });
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;
      recordingStartTimeRef.current = Date.now();
      setState("recording");
      return true;
    } catch (err) {
      console.error("Error starting recording:", err);
      setError("Could not access microphone. Please check permissions.");
      setState("idle");
      return false;
    }
  }, []);

  const stopRecording = useCallback(async (): Promise<string | null> => {
    return new Promise((resolve) => {
      const mediaRecorder = mediaRecorderRef.current;
      if (!mediaRecorder || mediaRecorder.state === "inactive") {
        resolve(null);
        return;
      }

      // Check recording duration
      const recordingDuration = recordingStartTimeRef.current
        ? Date.now() - recordingStartTimeRef.current
        : 0;

      // Ignore recordings shorter than 500ms (prevents Whisper hallucinations)
      if (recordingDuration < 500) {
        console.log(`Recording too short (${recordingDuration}ms), ignoring`);
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());
        mediaRecorder.stop();
        setState("idle");
        resolve(null);
        return;
      }

      setState("processing");
      lastRecordingTimeRef.current = Date.now();

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: mediaRecorder.mimeType });

        // Stop all tracks
        mediaRecorder.stream.getTracks().forEach((track) => track.stop());

        // Convert to base64
        try {
          const base64Audio = await blobToBase64(audioBlob);
          setState("idle");
          resolve(base64Audio);
        } catch (err) {
          console.error("Error converting audio:", err);
          setError("Failed to process audio recording");
          setState("idle");
          resolve(null);
        }
      };

      mediaRecorder.stop();
    });
  }, []);

  return {
    state,
    startRecording,
    stopRecording,
    error,
  };
};

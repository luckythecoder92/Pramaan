import { useCallback, useEffect, useRef, useState } from "react";
import { synthesizeSpeech } from "../services/voice.service";
import { getApiErrorMessage } from "../utils/errors";

interface UseSpeechSynthesisOptions {
  onError?: (message: string) => void;
}

export function useSpeechSynthesis({
  onError,
}: UseSpeechSynthesisOptions = {}) {
  const [isSpeaking, setIsSpeaking] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const objectUrlRef = useRef<string | null>(null);
  const onErrorRef = useRef(onError);

  const supported =
    typeof window !== "undefined" && "speechSynthesis" in window;

  useEffect(() => {
    onErrorRef.current = onError;
  }, [onError]);

  const cleanupAudio = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.src = "";
      audioRef.current = null;
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current);
      objectUrlRef.current = null;
    }
  }, []);

  const stop = useCallback(() => {
    if (supported) {
      window.speechSynthesis.cancel();
    }

    cleanupAudio();
    setIsSpeaking(false);
  }, [supported, cleanupAudio]);

  const speak = useCallback(
    async (text: string) => {
      const cleanText = text.trim();

      if (!cleanText) {
        return;
      }

      // Always stop the previous utterance before starting a new one.
      stop();
      setIsSpeaking(true);

      if (supported) {
        const utterance = new SpeechSynthesisUtterance(cleanText);
        const voices = window.speechSynthesis.getVoices();
        const preferredVoice =
          voices.find(
            (voice) => voice.default && voice.lang.toLowerCase().startsWith("en"),
          ) ?? voices.find((voice) => voice.lang.toLowerCase().startsWith("en"));

        utterance.lang = preferredVoice?.lang ?? "en-US";
        utterance.rate = 1;

        if (preferredVoice) {
          utterance.voice = preferredVoice;
        }

        utterance.onend = () => setIsSpeaking(false);
        utterance.onerror = (event) => {
          setIsSpeaking(false);

          if (event.error !== "canceled" && event.error !== "interrupted") {
            onErrorRef.current?.("The browser could not read this answer aloud.");
          }
        };

        window.speechSynthesis.speak(utterance);
        return;
      }

      // Fallback to the backend speech endpoint when the browser has no
      // speech synthesis engine.
      try {
        const blob = await synthesizeSpeech(cleanText);
        const objectUrl = URL.createObjectURL(blob);
        objectUrlRef.current = objectUrl;

        const audio = new Audio(objectUrl);
        audioRef.current = audio;

        audio.onended = () => {
          setIsSpeaking(false);
          cleanupAudio();
        };

        audio.onerror = () => {
          setIsSpeaking(false);
          cleanupAudio();
          onErrorRef.current?.(
            "The generated audio could not be played in this browser.",
          );
        };

        await audio.play();
      } catch (error) {
        setIsSpeaking(false);
        cleanupAudio();
        onErrorRef.current?.(getApiErrorMessage(error));
      }
    },
    [supported, stop, cleanupAudio],
  );

  useEffect(() => {
    return () => {
      if (supported) {
        window.speechSynthesis.cancel();
      }

      cleanupAudio();
    };
  }, [supported, cleanupAudio]);

  return {
    supported,
    isSpeaking,
    speak,
    stop,
  } as const;
}

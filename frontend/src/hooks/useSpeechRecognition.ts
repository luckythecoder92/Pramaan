import { useCallback, useEffect, useRef, useState } from "react";
import {
  getSpeechRecognitionConstructor,
  type SpeechRecognitionErrorEvent,
  type SpeechRecognitionEvent,
  type SpeechRecognitionLike,
} from "../types/speech";

interface UseSpeechRecognitionOptions {
  onFinalResult?: (text: string) => void;
  onError?: (message: string) => void;
}

function describeRecognitionError(error: string): string | null {
  switch (error) {
    case "not-allowed":
    case "service-not-allowed":
      return "Microphone access was denied. Allow microphone permission in your browser and try again.";
    case "audio-capture":
      return "No microphone was found. Check that a microphone is connected and selected.";
    case "network":
      return "Speech recognition needs a network connection. Check your connection and try again.";
    case "no-speech":
      return "No speech was detected. Try again and speak a little closer to the microphone.";
    case "language-not-supported":
      return "Speech recognition does not support the current browser language.";
    case "aborted":
      return null;
    default:
      return "Speech recognition stopped unexpectedly. Please try again.";
  }
}

export function useSpeechRecognition({
  onFinalResult,
  onError,
}: UseSpeechRecognitionOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const [error, setError] = useState<string | null>(null);
  const recognitionRef = useRef<SpeechRecognitionLike | null>(null);
  const onFinalResultRef = useRef(onFinalResult);
  const onErrorRef = useRef(onError);

  useEffect(() => {
    onFinalResultRef.current = onFinalResult;
    onErrorRef.current = onError;
  }, [onFinalResult, onError]);

  const supported = getSpeechRecognitionConstructor() !== null;

  const stop = useCallback(() => {
    const recognition = recognitionRef.current;

    if (recognition) {
      recognition.stop();
    }

    setIsListening(false);
    setInterimTranscript("");
  }, []);

  const start = useCallback(() => {
    if (isListening) {
      return;
    }

    const Recognition = getSpeechRecognitionConstructor();

    if (!Recognition) {
      const message =
        "Voice input is not supported in this browser. Try a current version of Chrome or Edge, or type your question instead.";
      setError(message);
      onErrorRef.current?.(message);
      return;
    }

    setError(null);
    setInterimTranscript("");

    const recognition = new Recognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;
    recognition.lang = navigator.language?.startsWith("en")
      ? navigator.language
      : "en-US";

    recognition.onstart = () => {
      setIsListening(true);
    };

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";

      for (let index = event.resultIndex; index < event.results.length; index += 1) {
        const result = event.results[index];
        const alternative = result?.[0];

        if (!alternative) {
          continue;
        }

        if (result.isFinal) {
          const finalText = alternative.transcript.trim();

          if (finalText) {
            onFinalResultRef.current?.(finalText);
          }
        } else {
          interim += alternative.transcript;
        }
      }

      setInterimTranscript(interim.trim());
    };

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const message = describeRecognitionError(event.error);
      setIsListening(false);
      setInterimTranscript("");

      if (message) {
        setError(message);
        onErrorRef.current?.(message);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      setInterimTranscript("");
      recognitionRef.current = null;
    };

    recognitionRef.current = recognition;

    try {
      recognition.start();
    } catch {
      const message = "Voice input could not start. Please try again.";
      recognitionRef.current = null;
      setError(message);
      setIsListening(false);
      onErrorRef.current?.(message);
    }
  }, [isListening]);

  useEffect(() => {
    return () => {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
    };
  }, []);

  return {
    supported,
    isListening,
    interimTranscript,
    error,
    start,
    stop,
  } as const;
}

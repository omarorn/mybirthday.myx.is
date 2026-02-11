/**
 * useTTS Hook — Text-to-Speech
 * Extracted from: Litla Gamaleigan (production)
 *
 * Wraps Web Speech API for voice announcements.
 * Supports multiple languages including Icelandic.
 *
 * Usage:
 *   const { speak, stop, isSpeaking } = useTTS({ lang: 'is' });
 *   speak('Nýtt verkefni tilbúið');
 */

import { useState, useCallback, useRef } from 'react';

interface UseTTSOptions {
  lang?: string; // BCP 47 language tag (default: 'is' for Icelandic)
  voice?: string; // Preferred voice name
  rate?: number; // Speech rate 0.1-10 (default: 1)
  pitch?: number; // Pitch 0-2 (default: 1)
}

interface UseTTSReturn {
  speak: (text: string) => void;
  stop: () => void;
  isSpeaking: boolean;
  isSupported: boolean;
}

export function useTTS(options: UseTTSOptions = {}): UseTTSReturn {
  const { lang = 'is', voice: preferredVoice, rate = 1, pitch = 1 } = options;
  const [isSpeaking, setIsSpeaking] = useState(false);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

  const isSupported = typeof window !== 'undefined' && 'speechSynthesis' in window;

  const speak = useCallback(
    (text: string) => {
      if (!isSupported) return;

      // Cancel any current speech
      window.speechSynthesis.cancel();

      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang;
      utterance.rate = rate;
      utterance.pitch = pitch;

      // Try to find preferred voice
      if (preferredVoice) {
        const voices = window.speechSynthesis.getVoices();
        const match = voices.find((v) => v.name.includes(preferredVoice));
        if (match) utterance.voice = match;
      }

      utterance.onstart = () => setIsSpeaking(true);
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);

      utteranceRef.current = utterance;
      window.speechSynthesis.speak(utterance);
    },
    [isSupported, lang, preferredVoice, rate, pitch]
  );

  const stop = useCallback(() => {
    if (!isSupported) return;
    window.speechSynthesis.cancel();
    setIsSpeaking(false);
  }, [isSupported]);

  return { speak, stop, isSpeaking, isSupported };
}

import { Flashcard } from '@/types';

export type AnswerQuality = 0 | 1 | 2 | 3 | 4 | 5;

export interface SpeechConfig {
  lang: string;
  rate: number;
  pitch: number;
  volume: number;
}

const DEFAULT_CONFIG: SpeechConfig = {
  lang: 'es-ES',
  rate: 0.9,
  pitch: 1,
  volume: 1,
};

let synthesis: SpeechSynthesis | null = null;
let voices: SpeechSynthesisVoice[] = [];

export function getSpeechSynthesis(): SpeechSynthesis | null {
  if (typeof window === 'undefined') return null;
  
  if (!synthesis) {
    synthesis = window.speechSynthesis;
    
    // Load voices (may require callback for some browsers)
    voices = synthesis?.getVoices() || [];
    
    if (synthesis) {
      synthesis.onvoiceschanged = () => {
        if (synthesis) {
          voices = synthesis.getVoices();
        }
      };
    }
  }
  
  return synthesis;
}

export function getSpanishVoices(): SpeechSynthesisVoice[] {
  return voices.filter(voice => 
    voice.lang.startsWith('es') || voice.lang === 'gl-ES'
  );
}

export function getBestSpanishVoice(): SpeechSynthesisVoice | null {
  const spanishVoices = getSpanishVoices();
  
  // Prefer voices from Spain
  const spainVoice = spanishVoices.find(v => v.lang === 'es-ES');
  if (spainVoice) return spainVoice;
  
  // Fall back to any Spanish voice
  return spanishVoices[0] || null;
}

export function isSpeechSynthesisSupported(): boolean {
  return typeof window !== 'undefined' && 'speechSynthesis' in window;
}

export function speak(
  text: string,
  config: Partial<SpeechConfig> = {}
): Promise<void> {
  return new Promise((resolve, reject) => {
    if (!isSpeechSynthesisSupported()) {
      reject(new Error('Speech synthesis not supported'));
      return;
    }
    
    const synth = getSpeechSynthesis();
    if (!synth) {
      reject(new Error('Speech synthesis not available'));
      return;
    }
    
    // Cancel any ongoing speech
    synth.cancel();
    
    const utterance = new SpeechSynthesisUtterance(text);
    
    // Apply configuration
    const finalConfig = { ...DEFAULT_CONFIG, ...config };
    utterance.lang = finalConfig.lang;
    utterance.rate = finalConfig.rate;
    utterance.pitch = finalConfig.pitch;
    utterance.volume = finalConfig.volume;
    
    // Select voice
    const voice = getBestSpanishVoice();
    if (voice) {
      utterance.voice = voice;
    }
    
    utterance.onend = () => {
      resolve();
    };
    
    utterance.onerror = (event) => {
      reject(new Error(`Speech synthesis error: ${event.error}`));
    };
    
    synth.speak(utterance);
  });
}

export function speakFlashcard(card: Flashcard): Promise<void> {
  const textToSpeak = card.example || card.front;
  return speak(textToSpeak);
}

export function stopSpeaking(): void {
  const synth = getSpeechSynthesis();
  if (synth) {
    synth.cancel();
  }
}

export function isSpeaking(): boolean {
  const synth = getSpeechSynthesis();
  return synth?.speaking || false;
}

export function isPaused(): boolean {
  const synth = getSpeechSynthesis();
  return synth?.pending || false;
}

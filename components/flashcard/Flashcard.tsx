'use client';

import { useState, useCallback } from 'react';
import { Flashcard as FlashcardType } from '@/types';
import { Volume2 } from 'lucide-react';
import { speak, stopSpeaking } from '@/lib/audio';

interface FlashcardProps {
  card: FlashcardType;
  isFlipped: boolean;
  onFlip: () => void;
  showBack?: boolean;
  autoPlayAudio?: boolean;
}

export function Flashcard({ card, isFlipped, onFlip, showBack = false, autoPlayAudio = false }: FlashcardProps) {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleAudio = useCallback(async (e: React.MouseEvent) => {
    e.stopPropagation();
    
    if (isSpeaking) {
      stopSpeaking();
      setIsSpeaking(false);
      return;
    }
    
    setIsSpeaking(true);
    try {
      await speak(card.front);
    } catch (error) {
      console.error('Speech synthesis error:', error);
    } finally {
      setIsSpeaking(false);
    }
  }, [card.front, isSpeaking]);

  return (
    <div
      className="relative w-full max-w-md mx-auto cursor-pointer"
      onClick={onFlip}
    >
      <div
        className={`relative w-full aspect-[3/2] transition-transform duration-500 transform-style-3d ${
          isFlipped ? 'rotate-y-180' : ''
        }`}
      >
        {/* Front of card */}
        <div className="absolute w-full h-full backface-hidden bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center p-8">
          <div className="text-center">
            <p className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              {card.front}
            </p>
            {card.pronunciation && (
              <p className="text-lg text-gray-500 dark:text-gray-400 italic">
                {card.pronunciation}
              </p>
            )}
            <p className="text-sm text-gray-400 dark:text-gray-500 mt-4 capitalize">
              {card.type}
            </p>
          </div>
          <button
            onClick={handleAudio}
            className="absolute bottom-4 right-4 p-2 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 hover:bg-blue-200 dark:hover:bg-blue-800 transition-colors"
            aria-label="Play pronunciation"
          >
            <Volume2 size={20} className={isSpeaking ? 'animate-pulse' : ''} />
          </button>
        </div>

        {/* Back of card */}
        <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-white dark:bg-gray-800 rounded-2xl shadow-lg border-2 border-gray-100 dark:border-gray-700 flex flex-col items-center justify-center p-8">
          <div className="text-center">
            <p className="text-3xl font-semibold text-gray-700 dark:text-gray-300 mb-4">
              {card.back}
            </p>
            {card.example && (
              <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  <span className="font-medium">Example:</span> {card.example}
                </p>
              </div>
            )}
            {card.notes && (
              <p className="text-sm text-gray-500 dark:text-gray-500 mt-3">
                {card.notes}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

interface FlashcardListProps {
  cards: FlashcardType[];
  onCardClick?: (card: FlashcardType) => void;
}

export function FlashcardList({ cards, onCardClick }: FlashcardListProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {cards.map(card => (
        <div
          key={card.id}
          onClick={() => onCardClick?.(card)}
          className="p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
        >
          <p className="font-semibold text-gray-900 dark:text-white">{card.front}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{card.back}</p>
          <span className="inline-block mt-2 px-2 py-1 text-xs bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 rounded-full capitalize">
            {card.type}
          </span>
        </div>
      ))}
    </div>
  );
}

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Layout';
import { Flashcard } from '@/components/flashcard/Flashcard';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { ProgressBar } from '@/components/ui/ProgressBar';
import { useDeckStore } from '@/store/useDeckStore';
import { useProgressStore } from '@/store/useProgressStore';
import { useStatsStore } from '@/store/useStatsStore';
import { getDecks, getCards } from '@/lib/storage';
import { ArrowLeft, Check, X, Volume2 } from 'lucide-react';

type AnswerQuality = 0 | 1 | 2 | 3 | 4 | 5;

export default function StudyPage() {
  const router = useRouter();
  const [isInitialized, setIsInitialized] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionComplete, setSessionComplete] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [incorrectCount, setIncorrectCount] = useState(0);
  const [studyCards, setStudyCards] = useState<ReturnType<typeof getCards>>([]);
  const [startTime] = useState(Date.now());
  
  const decks = useDeckStore(state => state.decks);
  const updateCardProgress = useProgressStore(state => state.updateCardProgress);
  const recordSession = useStatsStore(state => state.recordSession);
  const getDueCards = useProgressStore(state => state.getDueCards);
  
  useEffect(() => {
    const storedDecks = getDecks();
    const storedCards = getCards();
    useDeckStore.getState().setDecks(storedDecks);
    
    const allDueCards: typeof storedCards = [];
    storedDecks.forEach(deck => {
      const deckCards = storedCards.filter(c => deck.cards.includes(c.id));
      const dueCards = getDueCards(deck.id, deckCards);
      allDueCards.push(...dueCards);
    });
    
    const uniqueCards = allDueCards.filter((card, index, self) =>
      index === self.findIndex(c => c.id === card.id)
    );
    
    const shuffled = uniqueCards.sort(() => Math.random() - 0.5);
    setStudyCards(shuffled);
    setIsInitialized(true);
  }, [getDueCards]);

  const handleFlip = useCallback(() => {
    setIsFlipped(!isFlipped);
  }, [isFlipped]);

  const handleAnswer = (quality: AnswerQuality) => {
    if (studyCards.length === 0) return;
    
    const currentCard = studyCards[currentCardIndex];
    updateCardProgress(currentCard.id, quality);
    
    if (quality >= 3) {
      setCorrectCount(prev => prev + 1);
    } else {
      setIncorrectCount(prev => prev + 1);
    }
    
    if (currentCardIndex < studyCards.length - 1) {
      setCurrentCardIndex(prev => prev + 1);
      setIsFlipped(false);
    } else {
      setSessionComplete(true);
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      
      recordSession({
        cardsStudied: studyCards.length,
        correctAnswers: correctCount + (quality >= 3 ? 1 : 0),
        incorrectAnswers: incorrectCount + (quality < 3 ? 1 : 0),
        timeSpent,
        streak: 0,
        retentionRate: 0,
      });
    }
  };

  const handleKeyPress = useCallback((e: KeyboardEvent) => {
    if (e.code === 'Space') {
      e.preventDefault();
      handleFlip();
    } else if (e.code === 'Digit1' || e.code === 'Numpad1' || e.code === 'Digit2' || e.code === 'Numpad2') {
      handleAnswer(0);
    } else if (e.code === 'Digit3' || e.code === 'Numpad3') {
      handleAnswer(3);
    } else if (e.code === 'Digit4' || e.code === 'Numpad4') {
      handleAnswer(4);
    } else if (e.code === 'Digit5' || e.code === 'Numpad5') {
      handleAnswer(5);
    }
  }, [handleFlip, currentCardIndex, studyCards, correctCount, incorrectCount, startTime]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  if (studyCards.length === 0) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <Card variant="outlined" className="max-w-md w-full text-center">
            <CardContent className="p-8">
              <Volume2 size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                No Cards Due
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                You don't have any cards due for review right now.
              </p>
              <Button onClick={() => router.push('/decks')}>
                Browse Decks
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  if (sessionComplete) {
    const totalCards = correctCount + incorrectCount;
    const retentionRate = totalCards > 0 ? Math.round((correctCount / totalCards) * 100) : 0;
    
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 flex items-center justify-center px-4">
          <Card variant="elevated" className="max-w-md w-full text-center">
            <CardContent className="p-8">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                Session Complete! 🎉
              </h2>
              <div className="space-y-4 mb-6">
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Cards Studied</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{totalCards}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Correct</span>
                  <span className="font-semibold text-green-600">{correctCount}</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-gray-100 dark:border-gray-800">
                  <span className="text-gray-600 dark:text-gray-400">Incorrect</span>
                  <span className="font-semibold text-red-600">{incorrectCount}</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-gray-600 dark:text-gray-400">Retention Rate</span>
                  <span className="font-semibold text-gray-900 dark:text-white">{retentionRate}%</span>
                </div>
              </div>
              <div className="flex gap-4">
                <Button variant="outline" className="flex-1" onClick={() => router.push('/decks')}>
                  <ArrowLeft size={18} className="mr-2" />
                  Back to Decks
                </Button>
                <Button className="flex-1" onClick={() => router.push('/stats')}>
                  View Statistics
                </Button>
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    );
  }

  const currentCard = studyCards[currentCardIndex];
  const progress = ((currentCardIndex + 1) / studyCards.length) * 100;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 flex flex-col items-center justify-center px-4 py-8">
        <div className="w-full max-w-md mb-6">
          <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
            <span>Card {currentCardIndex + 1} of {studyCards.length}</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <ProgressBar value={progress} size="md" />
        </div>

        <Flashcard
          card={currentCard}
          isFlipped={isFlipped}
          onFlip={handleFlip}
        />

        <div className="mt-8 w-full max-w-md">
          {!isFlipped ? (
            <Button className="w-full" onClick={handleFlip}>
              Tap to reveal answer
            </Button>
          ) : (
            <div className="grid grid-cols-4 gap-2">
              <Button
                variant="danger"
                onClick={() => handleAnswer(0)}
                className="flex-col py-3"
              >
                <X size={20} className="mb-1" />
                <span className="text-xs">Again</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAnswer(3)}
                className="flex-col py-3"
              >
                <span className="text-lg font-bold">3</span>
                <span className="text-xs">Hard</span>
              </Button>
              <Button
                variant="outline"
                onClick={() => handleAnswer(4)}
                className="flex-col py-3"
              >
                <span className="text-lg font-bold">4</span>
                <span className="text-xs">Good</span>
              </Button>
              <Button
                variant="success"
                onClick={() => handleAnswer(5)}
                className="flex-col py-3"
              >
                <Check size={20} className="mb-1" />
                <span className="text-xs">Easy</span>
              </Button>
            </div>
          )}
        </div>

        <p className="mt-4 text-sm text-gray-500 dark:text-gray-400">
          Press Space to flip • 1-5 to answer
        </p>
      </main>
    </div>
  );
}

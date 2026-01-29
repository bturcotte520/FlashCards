'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { Header } from '@/components/layout/Layout';
import { DeckList } from '@/components/deck/DeckCard';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import { useDeckStore } from '@/store/useDeckStore';
import { useProgressStore } from '@/store/useProgressStore';
import { getDecks, getCards, getProgress } from '@/lib/storage';
import { Deck } from '@/types';
import { Plus, Search, Upload } from 'lucide-react';
import { exportDeck, importDeck } from '@/lib/import-export';

export default function DecksPage() {
  const [isInitialized, setIsInitialized] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterDifficulty, setFilterDifficulty] = useState('all');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const decks = useDeckStore(state => state.decks);
  const deleteDeck = useDeckStore(state => state.deleteDeck);
  const { getDueCards } = useProgressStore();
  
  useEffect(() => {
    const storedDecks = getDecks();
    useDeckStore.getState().setDecks(storedDecks);
    setIsInitialized(true);
  }, []);

  const dueCounts: Record<string, number> = {};
  decks.forEach(deck => {
    const deckCards = getCards().filter(c => deck.cards.includes(c.id));
    const dueCards = getDueCards(deck.id, deckCards);
    dueCounts[deck.id] = dueCards.length;
  });

  const filteredDecks = decks.filter(deck => {
    const matchesSearch = deck.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      deck.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesDifficulty = filterDifficulty === 'all' || deck.difficulty === filterDifficulty;
    return matchesSearch && matchesDifficulty;
  });

  const handleStudy = (deckId: string) => {
    window.location.href = `/decks/${deckId}/study`;
  };

  const handleEdit = (deckId: string) => {
    window.location.href = `/decks/${deckId}/edit`;
  };

  const handleDelete = (deckId: string) => {
    if (confirm('Are you sure you want to delete this deck? This action cannot be undone.')) {
      deleteDeck(deckId);
    }
  };

  const handleExport = (deck: Deck) => {
    const deckCards = getCards().filter(c => deck.cards.includes(c.id));
    exportDeck(deck, deckCards);
  };

  const handleImport = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      await importDeck(file);
      useDeckStore.getState().setDecks(getDecks());
      alert('Deck imported successfully!');
    } catch (error) {
      alert('Failed to import deck. Please check the file format.');
    }
    
    event.target.value = '';
  };

  if (!isInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-gray-500">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 py-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Your Decks
            </h1>
            <p className="text-gray-600 dark:text-gray-400 mt-1">
              Manage and study your flashcard decks
            </p>
          </div>
          <div className="flex items-center gap-2">
            <label>
              <Button variant="outline" as="span" className="cursor-pointer">
                <Upload size={18} className="mr-2" />
                Import
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleImport}
                className="hidden"
              />
            </label>
            <Link href="/decks/create">
              <Button>
                <Plus size={18} className="mr-2" />
                New Deck
              </Button>
            </Link>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search decks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select
            value={filterDifficulty}
            onChange={(e) => setFilterDifficulty(e.target.value)}
            options={[
              { value: 'all', label: 'All Levels' },
              { value: 'beginner', label: 'Beginner' },
              { value: 'intermediate', label: 'Intermediate' },
              { value: 'advanced', label: 'Advanced' },
            ]}
            className="w-full sm:w-48"
          />
        </div>

        <DeckList
          decks={filteredDecks}
          dueCounts={dueCounts}
          onStudy={handleStudy}
          onEdit={handleEdit}
          onDelete={handleDelete}
          onExport={handleExport}
        />
      </main>

      <footer className="bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-6">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Spanish Flashcards - Learn Spanish with spaced repetition
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

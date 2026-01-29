'use client';

import { Deck } from '@/types';
import { Card } from '@/components/ui/Card';
import { FileText, BookOpen, Settings, Trash2, Play } from 'lucide-react';

interface DeckCardProps {
  deck: Deck;
  dueCount: number;
  onStudy: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onExport: () => void;
}

export function DeckCard({ deck, dueCount, onStudy, onEdit, onDelete, onExport }: DeckCardProps) {
  const difficultyColors = {
    beginner: 'bg-green-100 dark:bg-green-900 text-green-600 dark:text-green-400',
    intermediate: 'bg-yellow-100 dark:bg-yellow-900 text-yellow-600 dark:text-yellow-400',
    advanced: 'bg-red-100 dark:bg-red-900 text-red-600 dark:text-red-400',
  };

  return (
    <Card variant="elevated" className="hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            {deck.name}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {deck.description}
          </p>
        </div>
        <span className={`px-2 py-1 text-xs rounded-full capitalize ${difficultyColors[deck.difficulty]}`}>
          {deck.difficulty}
        </span>
      </div>
      
      <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400 mb-4">
        <span className="flex items-center gap-1">
          <FileText size={16} />
          {deck.cards.length} cards
        </span>
        <span className="flex items-center gap-1">
          <BookOpen size={16} />
          {deck.category}
        </span>
        {dueCount > 0 && (
          <span className="flex items-center gap-1 text-blue-600 dark:text-blue-400">
            <Play size={16} />
            {dueCount} due
          </span>
        )}
      </div>
      
      <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-gray-700">
        <div className="flex items-center gap-2">
          <button
            onClick={onStudy}
            className="px-3 py-1.5 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Study
          </button>
          <button
            onClick={onEdit}
            className="p-1.5 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
            aria-label="Edit deck"
          >
            <Settings size={18} />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={onExport}
            className="px-3 py-1.5 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
          >
            Export
          </button>
          <button
            onClick={onDelete}
            className="p-1.5 text-red-500 hover:text-red-700 transition-colors"
            aria-label="Delete deck"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </Card>
  );
}

interface DeckListProps {
  decks: Deck[];
  dueCounts: Record<string, number>;
  onStudy: (deckId: string) => void;
  onEdit: (deckId: string) => void;
  onDelete: (deckId: string) => void;
  onExport: (deck: Deck) => void;
}

export function DeckList({ decks, dueCounts, onStudy, onEdit, onDelete, onExport }: DeckListProps) {
  if (decks.length === 0) {
    return (
      <div className="text-center py-12">
        <BookOpen size={48} className="mx-auto text-gray-300 dark:text-gray-600 mb-4" />
        <p className="text-gray-500 dark:text-gray-400">
          No decks yet. Create your first deck to get started!
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {decks.map(deck => (
        <DeckCard
          key={deck.id}
          deck={deck}
          dueCount={dueCounts[deck.id] || 0}
          onStudy={() => onStudy(deck.id)}
          onEdit={() => onEdit(deck.id)}
          onDelete={() => onDelete(deck.id)}
          onExport={() => onExport(deck)}
        />
      ))}
    </div>
  );
}

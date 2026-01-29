'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Header } from '@/components/layout/Layout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { useDeckStore } from '@/store/useDeckStore';
import { Flashcard } from '@/types';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';

export default function CreateDeckPage() {
  const router = useRouter();
  const addDeck = useDeckStore(state => state.addDeck);
  const addCard = useDeckStore(state => state.addCard);
  
  const [deckName, setDeckName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [difficulty, setDifficulty] = useState<'beginner' | 'intermediate' | 'advanced'>('beginner');
  const [cards, setCards] = useState<Partial<Flashcard>[]>([
    { front: '', back: '', type: 'vocabulary', difficulty: 1 },
  ]);

  const addNewCard = () => {
    setCards([...cards, { front: '', back: '', type: 'vocabulary', difficulty: 1 }]);
  };

  const removeCard = (index: number) => {
    if (cards.length > 1) {
      setCards(cards.filter((_, i) => i !== index));
    }
  };

  const updateCard = (index: number, field: string, value: string | number) => {
    const updated = [...cards];
    updated[index] = { ...updated[index], [field]: value };
    setCards(updated);
  };

  const handleSave = () => {
    if (!deckName.trim()) {
      alert('Please enter a deck name');
      return;
    }

    const validCards = cards.filter(c => c.front?.trim() && c.back?.trim());
    if (validCards.length === 0) {
      alert('Please add at least one card with front and back content');
      return;
    }

    const deckId = crypto.randomUUID();
    const now = new Date();

    const deck = {
      id: deckId,
      name: deckName.trim(),
      description: description.trim(),
      category: category.trim() || 'General',
      difficulty,
      cards: [] as string[],
      isPublic: false,
      createdAt: now,
      updatedAt: now,
    };

    // Create and add cards
    validCards.forEach(card => {
      const cardId = crypto.randomUUID();
      const fullCard: Flashcard = {
        id: cardId,
        front: card.front!,
        back: card.back!,
        type: card.type || 'vocabulary',
        pronunciation: card.pronunciation,
        example: card.example,
        notes: card.notes,
        difficulty: card.difficulty as 1 | 2 | 3 | 4 | 5 || 1,
        createdAt: now,
        updatedAt: now,
      };
      deck.cards.push(cardId);
      addCard(deckId, fullCard);
    });

    addDeck(deck);
    router.push('/decks');
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 py-8">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => router.back()} className="mb-4">
            <ArrowLeft size={18} className="mr-2" />
            Back
          </Button>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Create New Deck
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Create a new flashcard deck for Spanish learning
          </p>
        </div>

        <Card variant="outlined" className="mb-6">
          <CardHeader>
            <CardTitle>Deck Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              label="Deck Name"
              value={deckName}
              onChange={(e) => setDeckName(e.target.value)}
              placeholder="e.g., Spanish Food Vocabulary"
              required
            />
            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="What is this deck about?"
              rows={3}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Category"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g., Food, Travel, Business"
              />
              <Select
                label="Difficulty Level"
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as 'beginner' | 'intermediate' | 'advanced')}
                options={[
                  { value: 'beginner', label: 'Beginner' },
                  { value: 'intermediate', label: 'Intermediate' },
                  { value: 'advanced', label: 'Advanced' },
                ]}
              />
            </div>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Flashcards</CardTitle>
            <Button variant="outline" size="sm" onClick={addNewCard}>
              <Plus size={16} className="mr-1" />
              Add Card
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            {cards.map((card, index) => (
              <div key={index} className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    Card {index + 1}
                  </span>
                  {cards.length > 1 && (
                    <button
                      onClick={() => removeCard(index)}
                      className="p-1 text-red-500 hover:text-red-700 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    label="Front (Spanish)"
                    value={card.front}
                    onChange={(e) => updateCard(index, 'front', e.target.value)}
                    placeholder="e.g., Hola"
                  />
                  <Input
                    label="Back (English)"
                    value={card.back}
                    onChange={(e) => updateCard(index, 'back', e.target.value)}
                    placeholder="e.g., Hello"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-3">
                  <Select
                    label="Type"
                    value={card.type}
                    onChange={(e) => updateCard(index, 'type', e.target.value)}
                    options={[
                      { value: 'vocabulary', label: 'Vocabulary' },
                      { value: 'grammar', label: 'Grammar' },
                      { value: 'verb', label: 'Verb' },
                      { value: 'sentence', label: 'Sentence' },
                    ]}
                  />
                  <Input
                    label="Pronunciation (optional)"
                    value={card.pronunciation || ''}
                    onChange={(e) => updateCard(index, 'pronunciation', e.target.value)}
                    placeholder="e.g., /ˈola/"
                  />
                  <Select
                    label="Difficulty"
                    value={String(card.difficulty || 1)}
                    onChange={(e) => updateCard(index, 'difficulty', parseInt(e.target.value))}
                    options={[
                      { value: '1', label: '1 - Very Easy' },
                      { value: '2', label: '2 - Easy' },
                      { value: '3', label: '3 - Medium' },
                      { value: '4', label: '4 - Hard' },
                      { value: '5', label: '5 - Very Hard' },
                    ]}
                  />
                </div>
                <Input
                  label="Example Sentence (optional)"
                  value={card.example || ''}
                  onChange={(e) => updateCard(index, 'example', e.target.value)}
                  placeholder="e.g., Hola, ¿cómo estás?"
                  className="mt-3"
                />
              </div>
            ))}
          </CardContent>
        </Card>

        <div className="mt-6 flex justify-end gap-4">
          <Button variant="outline" onClick={() => router.back()}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            <Save size={18} className="mr-2" />
            Create Deck
          </Button>
        </div>
      </main>
    </div>
  );
}

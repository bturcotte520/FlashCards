export interface DeckCard {
  id: string;
  name: string;
  description: string;
  cardCount: number;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  dueCount: number;
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeckFormData {
  name: string;
  description: string;
  category: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  isPublic: boolean;
}

export interface DeckFilter {
  category?: string;
  difficulty?: string;
  search?: string;
  showPublicOnly?: boolean;
}

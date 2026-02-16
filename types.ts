export type BookStatus = 'Read' | 'Reading' | 'Unread';

export interface Book {
  id: number;
  title: string;
  author: string;
  genre: string;
  year: number;
  rating: number; // 0 to 5
  status: BookStatus;
}

export interface Stats {
  total: number;
  read: number;
  unread: number;
  reading: number;
}

export type ViewState = 'dashboard' | 'library' | 'ai-librarian';

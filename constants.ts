import { Book } from './types';

export const INITIAL_BOOKS: Book[] = [
  {
    id: 1,
    title: 'The Great Gatsby',
    author: 'F. Scott Fitzgerald',
    genre: 'Classic',
    year: 1925,
    rating: 5,
    status: 'Read',
  },
  {
    id: 2,
    title: 'Dune',
    author: 'Frank Herbert',
    genre: 'Sci-Fi',
    year: 1965,
    rating: 5,
    status: 'Reading',
  },
  {
    id: 3,
    title: 'Project Hail Mary',
    author: 'Andy Weir',
    genre: 'Sci-Fi',
    year: 2021,
    rating: 4,
    status: 'Read',
  },
  {
    id: 4,
    title: 'Atomic Habits',
    author: 'James Clear',
    genre: 'Self-Help',
    year: 2018,
    rating: 0,
    status: 'Unread',
  },
  {
    id: 5,
    title: '1984',
    author: 'George Orwell',
    genre: 'Dystopian',
    year: 1949,
    rating: 5,
    status: 'Read',
  },
];

export const GENRES = [
  'Fiction',
  'Non-Fiction',
  'Sci-Fi',
  'Fantasy',
  'Mystery',
  'Classic',
  'Biography',
  'Self-Help',
  'Dystopian',
  'History'
];

import { Book } from '../types';

// Use environment variable for production, fallback to localhost for development
const API_URL = process.env.VITE_API_URL || 'http://127.0.0.1:5000';

export interface RecommendationResponse {
  message: string;
  book?: {
    title: string;
    author: string;
  } | null;
}

export const fetchBooks = async (): Promise<Book[]> => {
  const response = await fetch(`${API_URL}/books`);
  if (!response.ok) {
    throw new Error(`Error fetching books: ${response.statusText}`);
  }
  return response.json();
};

export const addBook = async (book: Omit<Book, 'id'>): Promise<Book> => {
  const response = await fetch(`${API_URL}/add`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(book),
  });
  
  if (!response.ok) {
    throw new Error(`Error adding book: ${response.statusText}`);
  }
  
  const data = await response.json();
  // Return the complete book object with the ID assigned by backend
  return { ...book, id: data.id };
};

export const updateBook = async (book: Book): Promise<void> => {
  const response = await fetch(`${API_URL}/update/${book.id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(book),
  });

  if (!response.ok) {
    throw new Error(`Error updating book: ${response.statusText}`);
  }
};

export const deleteBook = async (id: number): Promise<void> => {
  const response = await fetch(`${API_URL}/delete/${id}`, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`Error deleting book: ${response.statusText}`);
  }
};

export const getRecommendation = async (): Promise<RecommendationResponse> => {
  const response = await fetch(`${API_URL}/recommend`);
  if (!response.ok) {
    throw new Error(`Error getting recommendation: ${response.statusText}`);
  }
  return response.json();
};
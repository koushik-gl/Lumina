import { Book } from '../types';
import { INITIAL_BOOKS } from '../constants';

const STORAGE_KEY = 'books';

// Recommendation Database (Moved to client-side)
const RECOMMENDATIONS_DB: Record<string, Array<{title: string, author: string}>> = {
    'Fiction': [
        {'title': 'The Kite Runner', 'author': 'Khaled Hosseini'},
        {'title': 'To Kill a Mockingbird', 'author': 'Harper Lee'},
        {'title': 'The Alchemist', 'author': 'Paulo Coelho'}
    ],
    'Non-Fiction': [
        {'title': 'Sapiens', 'author': 'Yuval Noah Harari'},
        {'title': 'Educated', 'author': 'Tara Westover'},
        {'title': 'Thinking, Fast and Slow', 'author': 'Daniel Kahneman'}
    ],
    'Sci-Fi': [
        {'title': 'Neuromancer', 'author': 'William Gibson'},
        {'title': 'Snow Crash', 'author': 'Neal Stephenson'},
        {'title': 'The Three-Body Problem', 'author': 'Cixin Liu'},
        {'title': "Ender's Game", 'author': 'Orson Scott Card'}
    ],
    'Fantasy': [
        {'title': 'The Name of the Wind', 'author': 'Patrick Rothfuss'},
        {'title': 'The Way of Kings', 'author': 'Brandon Sanderson'},
        {'title': 'The Hobbit', 'author': 'J.R.R. Tolkien'}
    ],
    'Mystery': [
        {'title': 'Gone Girl', 'author': 'Gillian Flynn'},
        {'title': 'The Girl with the Dragon Tattoo', 'author': 'Stieg Larsson'},
        {'title': 'The Da Vinci Code', 'author': 'Dan Brown'}
    ],
    'Classic': [
        {'title': 'Pride and Prejudice', 'author': 'Jane Austen'},
        {'title': 'Moby Dick', 'author': 'Herman Melville'},
        {'title': 'Crime and Punishment', 'author': 'Fyodor Dostoevsky'}
    ],
    'Biography': [
        {'title': 'Steve Jobs', 'author': 'Walter Isaacson'},
        {'title': 'Becoming', 'author': 'Michelle Obama'},
        {'title': 'Elon Musk', 'author': 'Walter Isaacson'}
    ],
    'Self-Help': [
        {'title': 'The Power of Habit', 'author': 'Charles Duhigg'},
        {'title': 'Deep Work', 'author': 'Cal Newport'},
        {'title': "Can't Hurt Me", 'author': 'David Goggins'}
    ],
    'Dystopian': [
        {'title': 'Brave New World', 'author': 'Aldous Huxley'},
        {'title': 'Fahrenheit 451', 'author': 'Ray Bradbury'},
        {'title': "The Handmaid's Tale", 'author': 'Margaret Atwood'}
    ],
    'History': [
        {'title': 'Guns, Germs, and Steel', 'author': 'Jared Diamond'},
        {'title': 'The Silk Roads', 'author': 'Peter Frankopan'},
        {'title': 'A Short History of Nearly Everything', 'author': 'Bill Bryson'}
    ]
};

export interface RecommendationResponse {
  message: string;
  book?: {
    title: string;
    author: string;
  } | null;
}

const getLocalBooks = (): Book[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
        return JSON.parse(stored);
    } catch (e) {
        console.error("Failed to parse books from local storage", e);
    }
  }
  // Initialize with default books if empty
  localStorage.setItem(STORAGE_KEY, JSON.stringify(INITIAL_BOOKS));
  return INITIAL_BOOKS;
};

const saveLocalBooks = (books: Book[]) => {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(books));
};

// Simulate network delay for realistic feel
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const checkHealth = async (): Promise<boolean> => {
  return true; // Always healthy in local mode
};

export const fetchBooks = async (): Promise<Book[]> => {
  await delay(600);
  return getLocalBooks();
};

export const addBook = async (book: Omit<Book, 'id'>): Promise<Book> => {
  await delay(400);
  const books = getLocalBooks();
  const newBook = { ...book, id: Date.now() };
  const updatedBooks = [newBook, ...books];
  saveLocalBooks(updatedBooks);
  return newBook;
};

export const updateBook = async (book: Book): Promise<void> => {
  await delay(400);
  const books = getLocalBooks();
  const updatedBooks = books.map(b => b.id === book.id ? book : b);
  saveLocalBooks(updatedBooks);
};

export const deleteBook = async (id: number): Promise<void> => {
  await delay(400);
  const books = getLocalBooks();
  const updatedBooks = books.filter(b => b.id !== id);
  saveLocalBooks(updatedBooks);
};

export const getRecommendation = async (): Promise<RecommendationResponse> => {
  await delay(1000);
  const books = getLocalBooks();
  
  if (books.length === 0) {
    return {
      message: "Your library is empty. Add some books to get recommendations!",
      book: null
    };
  }

  // Count genres
  const genreCounts: Record<string, number> = {};
  books.forEach(book => {
    genreCounts[book.genre] = (genreCounts[book.genre] || 0) + 1;
  });

  // Find favorite genre
  let favoriteGenre = '';
  let maxCount = -1;
  
  Object.entries(genreCounts).forEach(([genre, count]) => {
    if (count > maxCount) {
      maxCount = count;
      favoriteGenre = genre;
    }
  });

  const potentialRecs = RECOMMENDATIONS_DB[favoriteGenre] || [];
  const userTitles = new Set(books.map(b => b.title.toLowerCase()));
  const validRecs = potentialRecs.filter(r => !userTitles.has(r.title.toLowerCase()));

  if (validRecs.length > 0) {
    const randomRec = validRecs[Math.floor(Math.random() * validRecs.length)];
    return {
      message: `Because you read a lot of ${favoriteGenre}, you might enjoy:`,
      book: randomRec
    };
  }

  return {
    message: `You're a ${favoriteGenre} expert! We don't have new suggestions right now.`,
    book: null
  };
};
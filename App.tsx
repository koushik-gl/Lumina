import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import BookList from './components/BookList';
import BookModal from './components/BookModal';
import AILibrarian from './components/AILibrarian';
import { Book, ViewState } from './types';
import { Menu, X, Loader2 } from 'lucide-react';
import * as api from './services/api';

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setIsLoading(true);
      const data = await api.fetchBooks();
      setBooks(data);
    } catch (err) {
      console.error("Failed to load books", err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBook = async (bookData: Omit<Book, 'id'>) => {
    try {
        const newBook = await api.addBook(bookData);
        setBooks(prev => [newBook, ...prev]);
        return true;
    } catch (err) {
        console.error("Failed to add book", err);
        return false;
    }
  };

  const handleUpdateBook = async (bookData: Omit<Book, 'id'> & { id?: number }) => {
    if (!bookData.id) {
      await handleAddBook(bookData);
    } else {
      const bookToUpdate = bookData as Book;
      // Optimistic update
      setBooks(prev => prev.map(b => b.id === bookToUpdate.id ? bookToUpdate : b));
      
      try {
        await api.updateBook(bookToUpdate);
      } catch (err) {
        console.error("Failed to update book", err);
      }
    }
    setEditingBook(null);
  };

  const handleDeleteBook = async (id: number) => {
    // Optimistic delete
    setBooks(prev => prev.filter(b => b.id !== id));
    
    try {
      await api.deleteBook(id);
    } catch (err) {
      console.error("Failed to delete book", err);
    }
  };

  const openAddModal = () => {
    setEditingBook(null);
    setIsModalOpen(true);
  };

  const openEditModal = (book: Book) => {
    setEditingBook(book);
    setIsModalOpen(true);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center text-slate-400 gap-3">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
        <span className="text-lg font-medium">Loading Library...</span>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-slate-950 text-slate-100 font-sans">
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />

      <div className="md:hidden fixed top-0 w-full bg-slate-900 border-b border-slate-800 z-40 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Smart Shelf</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="text-white" /> : <Menu className="text-white" />}
        </button>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-30 bg-slate-950 pt-16 px-4 md:hidden">
           <nav className="flex flex-col gap-4">
            <button 
              onClick={() => { setCurrentView('dashboard'); setIsMobileMenuOpen(false); }}
              className="text-lg font-medium text-slate-300 py-2 border-b border-slate-800"
            >Dashboard</button>
            <button 
              onClick={() => { setCurrentView('library'); setIsMobileMenuOpen(false); }}
              className="text-lg font-medium text-slate-300 py-2 border-b border-slate-800"
            >My Library</button>
             <button 
              onClick={() => { setCurrentView('ai-librarian'); setIsMobileMenuOpen(false); }}
              className="text-lg font-medium text-slate-300 py-2 border-b border-slate-800"
            >AI Librarian</button>
           </nav>
        </div>
      )}

      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-x-hidden relative">
        {currentView === 'dashboard' && <Dashboard books={books} />}
        
        {currentView === 'library' && (
          <BookList 
            books={books} 
            onAddBook={openAddModal} 
            onEditBook={openEditModal} 
            onDeleteBook={handleDeleteBook}
          />
        )}

        {currentView === 'ai-librarian' && (
          <AILibrarian books={books} />
        )}
      </main>

      <BookModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleUpdateBook}
        initialData={editingBook}
      />
    </div>
  );
}

export default App;
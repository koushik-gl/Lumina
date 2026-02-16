import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import BookList from './components/BookList';
import BookModal from './components/BookModal';
import AILibrarian from './components/AILibrarian';
import { Book, ViewState } from './types';
import { Menu, X, Loader2, WifiOff } from 'lucide-react';
import * as api from './services/api';
import { INITIAL_BOOKS } from './constants';

function App() {
  const [books, setBooks] = useState<Book[]>([]);
  const [currentView, setCurrentView] = useState<ViewState>('dashboard');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBook, setEditingBook] = useState<Book | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Async State
  const [isLoading, setIsLoading] = useState(true);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    loadBooks();
  }, []);

  const loadBooks = async () => {
    try {
      setIsLoading(true);
      const data = await api.fetchBooks();
      setBooks(data);
      setIsOffline(false);
    } catch (err) {
      console.warn("Backend unreachable, switching to offline mode.", err);
      setIsOffline(true);
      setBooks(INITIAL_BOOKS);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddBook = async (bookData: Omit<Book, 'id'>) => {
    if (isOffline) {
      const newBook = { ...bookData, id: Date.now() } as Book;
      setBooks(prev => [newBook, ...prev]);
      return true;
    }
    
    try {
      const newBook = await api.addBook(bookData);
      setBooks(prev => [newBook, ...prev]);
      return true;
    } catch (err) {
      console.error(err);
      alert('Failed to add book. Server might be down.');
      return false;
    }
  };

  const handleUpdateBook = async (bookData: Omit<Book, 'id'> & { id?: number }) => {
    if (isOffline) {
       if (bookData.id) {
        const bookToUpdate = bookData as Book;
        setBooks(prev => prev.map(b => b.id === bookData.id ? bookToUpdate : b));
       } else {
        handleAddBook(bookData);
       }
       setEditingBook(null);
       return;
    }

    try {
      if (bookData.id) {
        // Edit existing
        const bookToUpdate = bookData as Book;
        await api.updateBook(bookToUpdate);
        setBooks(prev => prev.map(b => b.id === bookData.id ? bookToUpdate : b));
      } else {
        // Add new (BookModal might call this with undefined id for new books)
        await handleAddBook(bookData as Omit<Book, 'id'>);
      }
      setEditingBook(null);
    } catch (err) {
      console.error(err);
      alert('Failed to save book. Check connection.');
    }
  };

  const handleDeleteBook = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this book?')) {
      if (isOffline) {
        setBooks(prev => prev.filter(b => b.id !== id));
        return;
      }

      try {
        await api.deleteBook(id);
        setBooks(prev => prev.filter(b => b.id !== id));
      } catch (err) {
        console.error(err);
        alert('Failed to delete book. Check connection.');
      }
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
      {/* Sidebar for Desktop */}
      <Sidebar currentView={currentView} onChangeView={setCurrentView} />

      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 w-full bg-slate-900 border-b border-slate-800 z-40 px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-bold text-white">Lumina</h1>
        <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
          {isMobileMenuOpen ? <X className="text-white" /> : <Menu className="text-white" />}
        </button>
      </div>

      {/* Mobile Menu Overlay */}
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

      {/* Main Content Area */}
      <main className="flex-1 p-4 md:p-8 pt-20 md:pt-8 overflow-x-hidden relative">
        {isOffline && (
          <div className="mb-6 bg-amber-500/10 border border-amber-500/20 text-amber-500 px-4 py-3 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2">
            <WifiOff className="w-5 h-5" />
            <span className="text-sm font-medium">Backend unreachable. Running in offline demo mode. Changes will not be saved to server.</span>
          </div>
        )}

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

      {/* Book Modal */}
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
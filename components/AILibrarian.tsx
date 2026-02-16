import React, { useState } from 'react';
import { Book } from '../types';
import { Send, Bot, Sparkles } from 'lucide-react';
import { getAIBookInsights } from '../services/geminiService';

interface AILibrarianProps {
  books: Book[];
}

interface Message {
  role: 'user' | 'ai';
  content: string;
}

const AILibrarian: React.FC<AILibrarianProps> = ({ books }) => {
  const [messages, setMessages] = useState<Message[]>([
    { role: 'ai', content: `Hello! I'm your AI Librarian. I can analyze your ${books.length} books and give you recommendations. How can I help?` }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const responseText = await getAIBookInsights(books, input);

    setMessages(prev => [...prev, { role: 'ai', content: responseText }]);
    setIsLoading(false);
  };

  const suggestions = [
    "Suggest a book based on my high rated ones",
    "What genre do I read the most?",
    "Pick a random unread book for me",
  ];

  return (
    <div className="h-[calc(100vh-2rem)] flex flex-col bg-slate-900 border border-slate-800 rounded-xl overflow-hidden animate-in fade-in duration-500">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 bg-slate-900 flex items-center gap-3">
        <div className="p-2 bg-indigo-600/20 rounded-lg">
          <Bot className="w-6 h-6 text-indigo-400" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-white">AI Librarian</h2>
          <p className="text-xs text-slate-400">Powered by Gemini 3 Flash</p>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[80%] p-4 rounded-xl ${
              msg.role === 'user' 
                ? 'bg-indigo-600 text-white rounded-br-none' 
                : 'bg-slate-800 text-slate-200 rounded-bl-none'
            }`}>
              {msg.content}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-slate-800 p-4 rounded-xl rounded-bl-none flex gap-2 items-center">
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
              <span className="w-2 h-2 bg-slate-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800">
        <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
          {suggestions.map((s, i) => (
            <button 
              key={i} 
              onClick={() => setInput(s)}
              className="whitespace-nowrap px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-xs text-slate-300 hover:bg-slate-700 hover:text-white transition-colors flex items-center gap-1"
            >
              <Sparkles className="w-3 h-3 text-indigo-400" />
              {s}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <input 
            type="text"
            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            placeholder="Ask about your library..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
          />
          <button 
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white px-4 rounded-lg transition-colors flex items-center justify-center"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AILibrarian;
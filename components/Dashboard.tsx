import React, { useState, useMemo } from 'react';
import { Book } from '../types';
import { BookOpen, CheckCircle, Clock, BookMarked, Sparkles, X, Lightbulb } from 'lucide-react';
import * as api from '../services/api';

interface DashboardProps {
  books: Book[];
}

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#f97316'];

const Dashboard: React.FC<DashboardProps> = ({ books }) => {
  const [recLoading, setRecLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<api.RecommendationResponse | null>(null);

  // Calculate Basic Stats
  const stats = useMemo(() => ({
    total: books.length,
    read: books.filter(b => b.status === 'Read').length,
    unread: books.filter(b => b.status === 'Unread').length,
    reading: books.filter(b => b.status === 'Reading').length,
  }), [books]);

  // Calculate Genre Stats & Gradient for Chart
  const genreStats = useMemo(() => {
    const counts: Record<string, number> = {};
    books.forEach(b => counts[b.genre] = (counts[b.genre] || 0) + 1);
    
    const total = books.length;
    const data = Object.entries(counts)
      .map(([name, value], i) => ({
        name,
        value,
        percentage: total > 0 ? (value / total) * 100 : 0,
        color: COLORS[i % COLORS.length]
      }))
      .sort((a, b) => b.value - a.value);

    let current = 0;
    const gradientParts = data.map(d => {
      const start = current;
      const end = current + d.percentage;
      current = end;
      return `${d.color} ${start}% ${end}%`;
    });

    // Default to dark slate if no data
    const gradient = total > 0 
      ? `conic-gradient(${gradientParts.join(', ')})` 
      : '#1e293b';

    return { data, gradient };
  }, [books]);

  const handleGetRecommendation = async () => {
    try {
      setRecLoading(true);
      const data = await api.getRecommendation();
      setRecommendation(data);
    } catch (error) {
      console.error(error);
      alert("Failed to get recommendation from server.");
    } finally {
      setRecLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-3xl font-bold text-white">Overview</h2>
        <button 
          onClick={handleGetRecommendation}
          disabled={recLoading}
          className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white px-5 py-2.5 rounded-lg transition-all shadow-lg shadow-indigo-600/20 font-medium disabled:opacity-70 w-full sm:w-auto justify-center"
        >
          {recLoading ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <Sparkles className="w-5 h-5" />
          )}
          <span>Get AI Recommendation</span>
        </button>
      </div>
      
      {/* Recommendation Card */}
      {recommendation && (
        <div className="bg-gradient-to-br from-indigo-900/40 to-slate-900 border border-indigo-500/30 rounded-xl p-6 relative animate-in fade-in slide-in-from-top-4 shadow-xl">
          <button 
            onClick={() => setRecommendation(null)}
            className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="flex gap-4 items-start">
            <div className="p-3 bg-indigo-500/20 rounded-lg shrink-0">
              <Lightbulb className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white mb-2">Recommendation For You</h3>
              <p className="text-slate-300 mb-4">{recommendation.message}</p>
              {recommendation.book && (
                <div className="bg-slate-950/50 p-4 rounded-lg border border-indigo-500/20 inline-block">
                  <div className="text-xl font-bold text-indigo-100">{recommendation.book.title}</div>
                  <div className="text-indigo-300">by {recommendation.book.author}</div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard 
          title="Total Books" 
          value={stats.total} 
          icon={BookOpen} 
          color="bg-indigo-500/10 text-indigo-500" 
          borderColor="border-indigo-500/20"
        />
        <StatCard 
          title="Books Read" 
          value={stats.read} 
          icon={CheckCircle} 
          color="bg-emerald-500/10 text-emerald-500" 
          borderColor="border-emerald-500/20"
        />
        <StatCard 
          title="Currently Reading" 
          value={stats.reading} 
          icon={BookMarked} 
          color="bg-amber-500/10 text-amber-500" 
          borderColor="border-amber-500/20"
        />
        <StatCard 
          title="To Be Read" 
          value={stats.unread} 
          icon={Clock} 
          color="bg-rose-500/10 text-rose-500" 
          borderColor="border-rose-500/20"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        {/* Genre Distribution Chart */}
        <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-6">Genre Distribution</h3>
          
          <div className="flex flex-col md:flex-row items-center justify-center gap-10">
            {/* CSS-only Donut Chart */}
            <div 
              className="relative w-64 h-64 rounded-full shadow-2xl transition-all duration-1000 ease-out"
              style={{ background: genreStats.gradient }}
            >
              <div className="absolute inset-4 bg-slate-900 rounded-full flex flex-col items-center justify-center">
                <span className="text-4xl font-bold text-white">{stats.total}</span>
                <span className="text-sm text-slate-400">Total Books</span>
              </div>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-2 sm:grid-cols-1 gap-x-8 gap-y-3 w-full sm:w-auto">
              {genreStats.data.length > 0 ? (
                genreStats.data.map((g) => (
                  <div key={g.name} className="flex items-center gap-3">
                    <span 
                      className="w-3 h-3 rounded-full shadow-sm shadow-black/50" 
                      style={{ backgroundColor: g.color }}
                    ></span>
                    <div className="flex flex-col">
                      <span className="text-sm font-medium text-slate-200">{g.name}</span>
                      <span className="text-xs text-slate-500">{Math.round(g.percentage)}% ({g.value})</span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-500 italic">No genres data yet.</p>
              )}
            </div>
          </div>
        </div>

        {/* Recent Activity List */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col">
          <h3 className="text-lg font-semibold text-white mb-4">Recent Additions</h3>
          <div className="space-y-4 flex-1 overflow-y-auto max-h-[300px] pr-2 custom-scrollbar">
            {books.length > 0 ? books.slice(0, 5).map((book) => (
              <div key={book.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-800/50 hover:bg-slate-800 transition border border-transparent hover:border-slate-700">
                <div className="w-10 h-10 rounded bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-400 shrink-0">
                  {book.title.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate" title={book.title}>{book.title}</p>
                  <p className="text-xs text-slate-400 truncate">{book.author}</p>
                </div>
                <span className={`text-xs px-2 py-1 rounded-full shrink-0 ${
                  book.status === 'Read' ? 'bg-emerald-500/10 text-emerald-400' :
                  book.status === 'Reading' ? 'bg-amber-500/10 text-amber-400' :
                  'bg-slate-500/10 text-slate-400'
                }`}>
                  {book.status}
                </span>
              </div>
            )) : (
              <p className="text-slate-500 text-center py-4">No recent books.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const StatCard: React.FC<{ title: string; value: number; icon: any; color: string; borderColor: string }> = ({ 
  title, value, icon: Icon, color, borderColor 
}) => (
  <div className={`bg-slate-900 border ${borderColor} rounded-xl p-6 flex items-start justify-between hover:shadow-lg transition-shadow duration-300`}>
    <div>
      <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-white">{value}</h3>
    </div>
    <div className={`p-3 rounded-lg ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
  </div>
);

export default Dashboard;
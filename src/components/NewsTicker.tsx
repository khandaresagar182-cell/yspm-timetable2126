import React, { useState, useEffect } from 'react';
import { AuthService } from '../services/authService';
import { Megaphone, Plus, Trash2, X, Edit2, AlertCircle } from 'lucide-react';

interface NewsItem {
    id: number;
    content: string;
    is_active: number;
    created_at: string;
}

export const NewsTicker: React.FC = () => {
    const [news, setNews] = useState<NewsItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [newContent, setNewContent] = useState('');
    const [currentUser] = useState(AuthService.getCurrentUser());
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isFaculty = currentUser?.role === 'teacher' || currentUser?.role === 'admin';

    // Fetch News
    const fetchNews = async () => {
        const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        try {
            const res = await fetch(`${API_BASE_URL}/news`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setNews(data);
            } else {
                if (import.meta.env.DEV) console.error("News data is not an array:", data);
                setNews([]);
            }
        } catch (error) {
            // Silently fail in production, show error in dev
            setNews([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchNews();
        // Poll for updates occasionally or just refresh on load
    }, []);

    const handleAddNews = async () => {
        if (!newContent.trim()) return;
        setIsSubmitting(true);
        const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        try {
            await fetch(`${API_BASE_URL}/news`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ content: newContent, createdBy: currentUser?.email })
            });
            setNewContent('');
            fetchNews(); // Refresh
        } catch (error) {
            console.error("Failed to add news:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleDeleteNews = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this news item?')) return;
        const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
        try {
            await fetch(`${API_BASE_URL}/news/${id}`, {
                method: 'DELETE'
            });
            fetchNews();
        } catch (error) {
            console.error("Failed to delete news:", error);
        }
    };

    const handleScrollToNotices = () => {
        const noticeBoard = document.getElementById('notice-board');
        if (noticeBoard) {
            noticeBoard.scrollIntoView({ behavior: 'smooth' });
        }
    };

    const [currentIndex, setCurrentIndex] = React.useState(0);
    const [animationTrigger, setAnimationTrigger] = React.useState(0); // Force re-render key

    // Reset index when news changes
    React.useEffect(() => {
        setCurrentIndex(0);
        setAnimationTrigger(0);
    }, [news.length]);

    const handleAnimationEnd = () => {
        // Small delay before next item starts
        setTimeout(() => {
            setCurrentIndex((prev) => (prev + 1) % news.length);
            setAnimationTrigger(prev => prev + 1);
        }, 100);
    };

    if (loading) return null;

    // Calculate duration based on current item length
    const currentItem = news[currentIndex];
    const itemContent = currentItem?.content || '';
    const itemDuration = Math.max(15, itemContent.length * 0.25);

    return (
        <div className="relative bg-blue-900 border-b-2 border-amber-500 shadow-md h-12 flex items-center overflow-hidden z-20">
            {/* Label */}
            <div className="absolute left-0 top-0 bottom-0 bg-red-600 px-4 flex items-center gap-2 z-20 shadow-lg skew-x-6 -ml-2 pl-6">
                <div className="-skew-x-6 flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-white animate-pulse" />
                    <span className="text-white font-bold text-sm uppercase tracking-widest">Latest Updates</span>
                </div>
            </div>

            {/* Scrolling Content - Clickable */}
            <div
                className="flex-1 h-full flex items-center overflow-hidden cursor-pointer hover:bg-blue-800 transition-colors ml-48 relative"
                onClick={handleScrollToNotices}
                title="Click to view Notice Board"
            >
                {news.length > 0 && currentItem ? (
                    <div
                        key={`${currentItem.id}-${animationTrigger}`} // Key changes every time animation ends
                        className="absolute whitespace-nowrap flex items-center gap-4 will-change-transform"
                        style={{
                            animation: `scrollOne ${itemDuration}s linear forwards`,
                            left: '100%'
                        }}
                        onAnimationEnd={handleAnimationEnd}
                    >
                        <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                        <span style={{ fontFamily: '"Times New Roman", Times, serif' }} className="text-white text-base font-semibold tracking-widest">
                            {currentItem?.content || ''}
                        </span>
                    </div>
                ) : (
                    <div className="pl-4 text-blue-200 text-sm italic whitespace-nowrap">No breaking news at the moment...</div>
                )}
            </div>

            {/* Combined Styles */}
            <style>{`
                @keyframes scrollOne {
                    from { transform: translateX(0); }
                    to { transform: translateX(-100vw) translateX(-100%); }
                }
            `}</style>

            {/* Add/Edit Button (Faculty Only) */}
            {isFaculty && (
                <button
                    onClick={() => setIsEditing(true)}
                    className="absolute right-0 top-0 bottom-0 bg-blue-800 hover:bg-blue-700 px-3 flex items-center z-20 transition-colors border-l border-blue-700"
                    title="Manage News Ticker"
                >
                    <Edit2 className="w-4 h-4 text-white" />
                </button>
            )}

            {/* Edit Modal */}
            {isEditing && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full overflow-hidden">
                        <div className="bg-blue-900 px-6 py-4 flex items-center justify-between">
                            <h3 className="text-white font-bold flex items-center gap-2">
                                <Megaphone className="w-5 h-5" />
                                Manage News Ticker
                            </h3>
                            <button onClick={() => setIsEditing(false)} className="text-blue-200 hover:text-white">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="p-6">
                            {/* Add New */}
                            <div className="flex gap-2 mb-6">
                                <input
                                    type="text"
                                    value={newContent}
                                    onChange={(e) => setNewContent(e.target.value)}
                                    placeholder="Enter news update..."
                                    className="flex-1 px-3 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                                <button
                                    onClick={handleAddNews}
                                    disabled={!newContent.trim() || isSubmitting}
                                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center gap-2 font-medium"
                                >
                                    <Plus className="w-4 h-4" />
                                    Add
                                </button>
                            </div>

                            {/* List */}
                            <div className="space-y-2 max-h-64 overflow-y-auto">
                                {news.length === 0 && (
                                    <div className="text-center text-gray-400 py-4 flex flex-col items-center">
                                        <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
                                        <p>No active news items</p>
                                    </div>
                                )}
                                {news.map(item => (
                                    <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md border hover:bg-gray-100 transition-colors">
                                        <span className="text-sm text-gray-700 font-medium line-clamp-2 pr-4">{item.content}</span>
                                        <button
                                            onClick={() => handleDeleteNews(item.id)}
                                            className="text-red-500 hover:text-red-700 p-1 rounded hover:bg-red-50"
                                            title="Delete"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


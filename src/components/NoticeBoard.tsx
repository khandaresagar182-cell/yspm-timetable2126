import React, { useState, useEffect } from 'react';
import { NoticeService, type Notice } from '../services/noticeService';
import { Bell, X, Plus, Edit2, Trash2, Paperclip, Download, FileText } from 'lucide-react';
import { AuthService } from '../services/authService';
import { Document, Page, pdfjs } from 'react-pdf';

// Configure PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    'pdfjs-dist/build/pdf.worker.min.mjs',
    import.meta.url,
).toString();

interface NoticeBoardProps {
    departmentId?: string;
}

export const NoticeBoard: React.FC<NoticeBoardProps> = ({ departmentId }) => {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [loading, setLoading] = useState(true);
    const [isEditorOpen, setIsEditorOpen] = useState(false);
    const [editingNotice, setEditingNotice] = useState<Notice | null>(null);
    const [formData, setFormData] = useState<{ title: string; content: string; attachment?: File }>({ title: '', content: '' });
    const user = AuthService.getCurrentUser();
    const isFaculty = user && (user.role === 'admin' || user.role === 'teacher');

    const [isPaused, setIsPaused] = useState(false);

    useEffect(() => {
        loadNotices();
    }, [departmentId]);

    const loadNotices = async () => {
        setLoading(true);
        const data = await NoticeService.getNotices(departmentId);
        setNotices(data);
        setLoading(false);
    };

    const handleSaveNotice = async () => {
        if (!formData.title) return;

        let result;
        if (editingNotice) {
            result = await NoticeService.updateNotice(editingNotice.id, {
                ...formData,
                department_id: departmentId,
                created_by: user?.email || 'Faculty'
            });
        } else {
            result = await NoticeService.createNotice({
                ...formData,
                department_id: departmentId,
                created_by: user?.email || 'Faculty'
            });
        }

        if (result.status === 'success') {
            setFormData({ title: '', content: '' });
            setEditingNotice(null);
            setIsEditorOpen(false);
            loadNotices();
        } else {
            alert('Failed to save notice: ' + ((result as any).message || 'Unknown error'));
        }
    };

    const handleEdit = (notice: Notice) => {
        setEditingNotice(notice);
        setFormData({ title: notice.title, content: notice.content });
        setIsEditorOpen(true);
    };

    const handleDelete = async (id: number) => {
        if (confirm('Are you sure you want to delete this notice?')) {
            await NoticeService.deleteNotice(id);
            loadNotices();
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg border border-gray-200 p-6 flex justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden h-[500px] flex flex-col">
            {/* Header */}
            <div className="bg-gradient-to-r from-gray-50 to-white px-4 py-3 border-b border-gray-200 flex items-center justify-between z-10 relative shadow-sm">
                <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-blue-100 rounded-lg">
                        <Bell className="w-5 h-5 text-blue-700" />
                    </div>
                    <div>
                        <h3 className="text-base font-bold text-gray-800 uppercase tracking-wide">Notice Board</h3>
                        <div className="h-0.5 w-full bg-blue-600 mt-0.5 rounded-full"></div>
                    </div>
                </div>

                <div className="flex items-center gap-2">
                    {isFaculty && (
                        <button
                            onClick={() => {
                                setEditingNotice(null);
                                setFormData({ title: '', content: '' });
                                setIsEditorOpen(true);
                            }}
                            className="p-1.5 text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors shadow-sm"
                            title="Post Notice"
                        >
                            <Plus className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Notices List with Scrollbar */}
            <div
                className="flex-1 overflow-y-auto relative bg-white scrollbar-thin scrollbar-thumb-gray-200 hover:scrollbar-thumb-gray-300 transition-colors"
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => setIsPaused(false)}
            >
                {notices.length === 0 ? (
                    <div className="text-center py-12 text-gray-400">
                        <Bell className="w-12 h-12 mx-auto mb-3 opacity-20" />
                        <p className="text-sm">No notices posted yet.</p>
                    </div>
                ) : (
                    <div className="min-h-full">
                        <div
                            className={notices.length > 2 ? (isPaused ? 'animate-none' : 'animate-scroll-up') : ''}
                        >
                            {/* Quadruple notices for seamless loop even with small content */}
                            {(notices.length > 2 ? [...notices, ...notices, ...notices, ...notices] : notices).map((notice, index) => (
                                <div
                                    key={`${notice.id}-${index}`}
                                    className="p-4 mb-3"
                                >
                                    {/* File Card Design with Image Preview */}
                                    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all border border-gray-200 overflow-hidden group relative">

                                        {/* Reduced height for compact look */}
                                        <div className="h-32 w-full bg-gray-100 relative overflow-hidden border-b border-gray-100">
                                            {notice.attachment_path ? (
                                                (() => {
                                                    // Robust PDF check using name OR path
                                                    const fileName = notice.attachment_name || notice.attachment_path || '';
                                                    const isPdf = fileName.toLowerCase().endsWith('.pdf');

                                                    if (isPdf) {
                                                        return (
                                                            <div className="w-full h-full relative group-hover:opacity-100 opacity-90 transition-opacity bg-gray-50 flex items-center justify-center overflow-hidden">
                                                                <Document
                                                                    file={`http://localhost:5000${notice.attachment_path}`}
                                                                    loading={
                                                                        <div className="w-full h-32 flex flex-col items-center justify-center bg-red-50">
                                                                            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-red-500 mb-2"></div>
                                                                            <span className="text-xs text-red-500">Loading Preview...</span>
                                                                        </div>
                                                                    }
                                                                    error={
                                                                        <div className="w-full h-32 flex flex-col items-center justify-center bg-red-50 px-4 text-center">
                                                                            <FileText className="w-8 h-8 text-red-500 mb-2 opacity-50" />
                                                                            <span className="text-xs text-red-400 font-medium">Preview Unavailable</span>
                                                                        </div>
                                                                    }
                                                                    className="flex justify-center items-center w-full"
                                                                >
                                                                    <Page
                                                                        pageNumber={1}
                                                                        width={350}
                                                                        renderTextLayer={false}
                                                                        renderAnnotationLayer={false}
                                                                        className="shadow-sm"
                                                                    />
                                                                </Document>
                                                            </div>
                                                        );
                                                    }

                                                    // Optimistic Image approach for everything else
                                                    return (
                                                        <>
                                                            <img
                                                                src={`http://localhost:5000${notice.attachment_path}`}
                                                                alt="Notice Preview"
                                                                className="w-full h-full object-cover object-top opacity-90 transition-opacity group-hover:opacity-100"
                                                                onError={(e) => {
                                                                    e.currentTarget.style.display = 'none';
                                                                    const fallback = document.getElementById(`fallback-${notice.id}-${index}`);
                                                                    if (fallback) fallback.style.display = 'flex';
                                                                }}
                                                            />
                                                            <div
                                                                id={`fallback-${notice.id}-${index}`}
                                                                className="hidden w-full h-full flex-col items-center justify-center bg-blue-50 absolute inset-0"
                                                            >
                                                                <Paperclip className="w-12 h-12 text-blue-400 mb-2 opacity-50" />
                                                                <span className="text-xs text-blue-400 font-medium truncate max-w-[80%] px-2">
                                                                    {notice.attachment_name || 'Attachment'}
                                                                </span>
                                                            </div>
                                                        </>
                                                    );
                                                })()
                                            ) : (
                                                // No Attachment Fallback
                                                <div className="w-full h-full flex items-center justify-center bg-gray-50 pattern-grid-lg">
                                                    <Bell className="w-10 h-10 text-gray-300" />
                                                </div>
                                            )}

                                            {/* Gradient Overlay for Readability */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                                        </div>

                                        {/* Content Overlay / Bottom Section */}
                                        <div className="p-3 relative z-10 -mt-12">
                                            <div className="flex items-start justify-between gap-2">
                                                <h4 className="text-white font-bold text-lg capitalize tracking-normal leading-snug drop-shadow-md line-clamp-2 font-sans">
                                                    {notice.title}
                                                    {index < 2 && index < notices.length && (
                                                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold bg-red-600 text-white shadow-sm animate-pulse align-middle normal-case tracking-normal">
                                                            NEW
                                                        </span>
                                                    )}
                                                </h4>

                                                {/* Download Button */}
                                                {notice.attachment_path && (
                                                    <a
                                                        href={`http://localhost:5000${notice.attachment_path}`}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="flex-shrink-0 w-8 h-8 bg-white/20 hover:bg-white/40 backdrop-blur-sm rounded-full flex items-center justify-center transition-colors border border-white/30 text-white"
                                                        title="Download / View Full"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        <Download className="w-4 h-4" />
                                                    </a>
                                                )}
                                            </div>

                                            <div className="mt-4 pt-3 border-t border-gray-100/10">
                                                {notice.content && (
                                                    <p className="text-gray-600 text-sm line-clamp-2 mb-2 bg-white/90 p-2 rounded backdrop-blur-sm shadow-sm">
                                                        {notice.content}
                                                    </p>
                                                )}

                                                <div className="flex items-center justify-between mt-2">
                                                    <span className="text-xs text-gray-700 font-semibold flex items-center gap-1 bg-gray-100 px-2.5 py-1 rounded-full">
                                                        {formatDate(notice.created_at)}
                                                    </span>

                                                    {/* Faculty Actions */}
                                                    {isFaculty && (index < notices.length) && (
                                                        <div className="flex gap-1">
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleEdit(notice); }}
                                                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                            >
                                                                <Edit2 className="w-4 h-4" />
                                                            </button>
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleDelete(notice.id); }}
                                                                className="p-1.5 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Editor Modal */}
            {isEditorOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-lg w-full">
                        <div className="flex items-center justify-between px-6 py-4 border-b">
                            <h3 className="font-semibold text-gray-800">
                                {editingNotice ? 'Edit Notice' : 'New Notice'}
                            </h3>
                            <button
                                onClick={() => {
                                    setIsEditorOpen(false);
                                    setEditingNotice(null);
                                    setFormData({ title: '', content: '' });
                                }}
                                className="text-gray-400 hover:text-gray-600"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-medium text-gray-700 mb-1">
                                    TITLE
                                </label>
                                <input
                                    type="text"
                                    value={formData.title}
                                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500 text-sm"
                                    placeholder="Notice title"
                                />
                            </div>


                            {!editingNotice && (
                                <div>
                                    <label className="block text-xs font-medium text-gray-700 mb-1">
                                        ATTACHMENT
                                    </label>
                                    <div className="flex items-center gap-2">
                                        <label className="cursor-pointer inline-flex items-center gap-2 px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-50 text-gray-600 text-xs">
                                            <Paperclip className="w-3.5 h-3.5" />
                                            <span>{formData.attachment ? formData.attachment.name : 'Select PDF/Image'}</span>
                                            <input
                                                type="file"
                                                className="hidden"
                                                onChange={(e) => {
                                                    if (e.target.files && e.target.files[0]) {
                                                        setFormData({ ...formData, attachment: e.target.files[0] });
                                                    }
                                                }}
                                            />
                                        </label>
                                        {formData.attachment && (
                                            <button
                                                onClick={() => setFormData({ ...formData, attachment: undefined })}
                                                className="text-red-500 hover:text-red-700"
                                            >
                                                <X className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            )}

                        </div>
                        <div className="flex justify-end gap-3 px-6 py-4 border-t bg-gray-50">
                            <button
                                onClick={() => {
                                    setIsEditorOpen(false);
                                    setEditingNotice(null);
                                    setFormData({ title: '', content: '' });
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSaveNotice}
                                disabled={!formData.title}
                                className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 disabled:bg-gray-300"
                            >
                                {editingNotice ? 'Update' : 'Post'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* CSS Animation for Upward Scroll */}
            <style>{`
                @keyframes scrollUp {
                    0% {
                        transform: translateY(0);
                    }
                    100% {
                        transform: translateY(-25%);
                    }
                }
                
                .animate-scroll-up {
                    animation: scrollUp 40s linear infinite;
                }
                
                .animate-none {
                    animation: none !important;
                }

                /* Custom Scrollbar */
                ::-webkit-scrollbar {
                    width: 6px;
                }
                ::-webkit-scrollbar-track {
                    background: #f1f1f1; 
                }
                ::-webkit-scrollbar-thumb {
                    background: #d1d5db; 
                    border-radius: 4px;
                }
                ::-webkit-scrollbar-thumb:hover {
                    background: #9ca3af; 
                }
            `}</style>
        </div>
    );
};

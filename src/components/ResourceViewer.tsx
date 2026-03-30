import React, { useEffect, useState } from 'react';
import { X, Upload, FileText, Download, Trash2, Loader2, File, Link, Plus, ExternalLink } from 'lucide-react';
// import { auth } from '../lib/firebase';
import { FileService, type PracticalResource } from '../services/fileService';
import { AuthService } from '../services/authService';

interface ResourceViewerProps {
    isOpen: boolean;
    onClose: () => void;
    batch: string;
    subject: string;
    isLab?: boolean;
}

const CATEGORIES = [
    { id: 'General', label: 'General' },
    { id: 'ModelAnswer', label: 'Model Answer' },
    { id: 'PPT', label: 'PPT' },
    { id: 'Assignment', label: 'Assignments' },
    { id: 'Homework', label: 'Homework' },
    { id: 'Notes', label: 'Notes' },
    { id: 'Links', label: 'Links' },
];

const UNIT_LINKS = [
    { name: 'UNIT I', url: '#' },
    { name: 'UNIT II', url: '#' },
    { name: 'UNIT III', url: '#' },
    { name: 'UNIT IV', url: '#' },
    { name: 'UNIT V', url: '#' },
];

const UNIT_OPTIONS = ['UNIT I', 'UNIT II', 'UNIT III', 'UNIT IV', 'UNIT V', 'UNIT VI'];

export const ResourceViewer: React.FC<ResourceViewerProps> = ({ isOpen, onClose, batch, subject, isLab = false }) => {
    const [files, setFiles] = useState<PracticalResource[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [user, setUser] = useState<any>(null); // Track auth state
    const [showLinkForm, setShowLinkForm] = useState(false);
    const [linkName, setLinkName] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [selectedUnit, setSelectedUnit] = useState('UNIT I'); // Default Unit
    const [activeUnit, setActiveUnit] = useState<string | null>(null);
    const [addingLink, setAddingLink] = useState(false);

    // Determine available categories based on type
    // If it's NOT a lab, filter out 'General'
    const availableCategories = isLab
        ? CATEGORIES
        : CATEGORIES.filter(c => c.id !== 'General');

    // Default to first available category if General is gone
    const [selectedCategory, setSelectedCategory] = useState(isLab ? 'General' : 'ModelAnswer');
    const [uploadCategory, setUploadCategory] = useState(isLab ? 'General' : 'ModelAnswer');

    const activeUploadsRef = React.useRef<(() => void)[]>([]);

    useEffect(() => {
        // If isLab changes or dialog re-opens, ensure valid category selection
        if (!isLab && selectedCategory === 'General') {
            setSelectedCategory('ModelAnswer');
            setUploadCategory('ModelAnswer');
        } else if (isLab && !selectedCategory) {
            setSelectedCategory('General');
            setUploadCategory('General');
        }
    }, [isLab, isOpen]);

    useEffect(() => {
        // Check Auth State
        const currentUser = AuthService.getCurrentUser();
        setUser(currentUser);
    }, []);

    const cancelUpload = () => {
        // Call all cancel functions
        activeUploadsRef.current.forEach(cancel => cancel());
        activeUploadsRef.current = []; // Clear list
        setUploading(false);
        setProgress(0);
    };

    useEffect(() => {
        if (files.length > 0) {
            console.log(`[DEBUG] ResourceViewer Files:`, files.length);
            console.log(`[DEBUG] Links Count:`, files.filter(f => f.isLink || (f as any).is_link || f.type === 'link').length);
            if (import.meta.env.DEV) {
                console.log(`[DEBUG] First 3 Files:`, files.slice(0, 3));
            }
        }
    }, [files]);

    useEffect(() => {
        if (!isOpen) {
            if (import.meta.env.DEV) console.log("ResourceViewer: Closed, skipping subscription.");
            return;
        }

        if (import.meta.env.DEV) console.log(`ResourceViewer: Opening for Batch=${batch}, Subject=${subject}. Starting subscription...`);
        setLoading(true);

        // Subscribe to real-time updates
        const unsubscribeFiles = FileService.subscribeToFiles(batch, subject, (data) => {
            if (import.meta.env.DEV) console.log(`[ResourceViewer] Received ${data.length} files from Firestore for ${batch}/${subject}.`);
            setFiles(data);
            setLoading(false);
            clearTimeout(loadTimeout);
        });

        // Fallback: If no response in 10 seconds, show error
        const loadTimeout = setTimeout(() => {
            setLoading((prevLoading) => {
                if (prevLoading) {
                    if (import.meta.env.DEV) console.warn("ResourceViewer: Firestore load timed out after 10s.");
                    return false; // Stop spinner
                }
                return prevLoading;
            });
        }, 10000);

        return () => {
            if (import.meta.env.DEV) console.log("ResourceViewer: Cleaning up subscription.");
            unsubscribeFiles();
            clearTimeout(loadTimeout);
        };
    }, [isOpen, batch, subject]);

    const handleAddLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!linkName || !linkUrl || !user) return;

        setAddingLink(true);

        try {
            // Ensure URL has protocol
            let finalUrl = linkUrl.trim();
            if (!/^https?:\/\//i.test(finalUrl)) {
                finalUrl = `https://${finalUrl}`;
            }

            // Prepend Unit to Name
            const finalName = `[${selectedUnit}] ${linkName}`;
            // Always global for Links
            await FileService.addLink(batch, subject, finalName, finalUrl, user.email || 'Teacher', uploadCategory, true);

            setLinkName('');
            setLinkUrl('');
            setShowLinkForm(false);
            // alert("Link added successfully!"); 
        } catch (error: any) {
            console.error("Failed to add link:", error);
            alert(`Failed to add link: ${error.message || 'Unknown error'}`);
        } finally {
            setAddingLink(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (!fileList || fileList.length === 0 || !user) return;

        try {
            setUploading(true);
            setProgress(0);

            const { promise, cancel } = FileService.uploadFile(
                batch,
                subject,
                fileList, // Verified FileList
                user.email || 'Teacher',
                uploadCategory || (isLab ? 'General' : 'ModelAnswer'),
                (prog) => setProgress(prog)
            );

            // Store cancel function
            activeUploadsRef.current = [cancel];

            const result = await promise;

            if (result.status === 'error' || (result.errors && result.errors.length > 0)) {
                const msg = result.message || 'Upload failed';
                const details = result.errors ? `\n${result.errors.join('\n')}` : '';
                if (import.meta.env.DEV) console.warn("Upload issues:", msg, details);
                alert(`${msg}${details}`);
            }

            // Clear cancel functions
            activeUploadsRef.current = [];
        } catch (error: any) {
            console.error("Failed to upload files. Please try again.");
            if (error.message !== 'Upload cancelled') {
                alert(`Upload failed: ${error.message || 'Unknown error'}`);
            }
        } finally {
            setUploading(false);
            setProgress(0);
            activeUploadsRef.current = [];
            if (e.target) e.target.value = '';
        }
    };

    const handleDelete = async (fileId: string) => {
        if (!confirm("Are you sure you want to delete this resource?")) return;
        try {
            setLoading(true);
            await FileService.deleteFile(fileId);
            // List will auto-update via polling
        } catch (error) {
            console.error("Failed to delete resource. Please try again.");
            alert("Failed to delete resource.");
            setLoading(false);
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    };

    useEffect(() => {
        if (selectedCategory !== 'all') {
            setUploadCategory(selectedCategory);
        }
    }, [selectedCategory]);

    // Helper to get category label
    const getCategoryLabel = (catId: string) => {
        const cat = CATEGORIES.find(c => c.id === catId);
        return cat ? cat.label : (catId || 'General');
    };

    // Filter files based on category
    // Filter files based on category
    const filteredFiles = files.filter((file) =>
        (file.category || 'General') === selectedCategory
    );

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                    <div>
                        <h3 className="text-lg font-bold text-gray-900">{subject}</h3>
                        <p className="text-xs text-gray-500">Resources & Materials ({batch})</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors">
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Category Tabs */}
                <div className="px-4 pt-3 flex gap-2 overflow-x-auto border-b border-gray-200 pb-0 scrollbar-hide">
                    {availableCategories.map(cat => (
                        <button
                            key={cat.id}
                            onClick={() => setSelectedCategory(cat.id)}
                            className={`px-3 py-2 text-xs font-medium whitespace-nowrap transition-colors border-b-2 ${selectedCategory === cat.id
                                ? 'border-blue-600 text-blue-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            {cat.label}
                        </button>
                    ))}
                </div>

                {/* File List */}
                <div className="flex-1 overflow-y-auto p-6 space-y-3 custom-scrollbar">
                    {/* LINKS CATEGORY logic */}
                    {selectedCategory === 'Links' ? (
                        <>
                            {/* LEVEL 1: UNIT FOLDERS (When no unit is active) */}
                            {!activeUnit && (
                                <div className="flex flex-col gap-3 mb-4">
                                    {UNIT_LINKS.map((unit, index) => {
                                        // Count links for this unit
                                        const count = files.filter(f =>
                                            (f.isLink || (f as any).is_link || f.type === 'link') &&
                                            f.name.trim().startsWith(`[${unit.name}]`)
                                        ).length;

                                        return (
                                            <div
                                                key={index}
                                                onClick={() => setActiveUnit(unit.name)}
                                                className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 bg-white hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
                                            >
                                                <div className="p-2 bg-gray-50 text-gray-600 rounded-md group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                                                    <FileText className="w-5 h-5" />
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-semibold text-gray-900 group-hover:text-blue-700 transition-colors">{unit.name}</h4>
                                                    <p className="text-[10px] text-gray-500 font-medium uppercase tracking-wide">{count} Links</p>
                                                </div>
                                                <ExternalLink className="w-4 h-4 text-gray-300 ml-auto group-hover:text-blue-500" />
                                            </div>
                                        );
                                    })}
                                </div>
                            )}

                            {/* LEVEL 2: LINKS INSIDE A UNIT */}
                            {activeUnit && (
                                <div className="space-y-4">
                                    {/* Header with Back Button */}
                                    <div className="flex items-center gap-2 mb-2">
                                        <button
                                            onClick={() => setActiveUnit(null)}
                                            className="p-1 hover:bg-gray-100 rounded-full text-gray-500"
                                        >
                                            <ExternalLink className="w-5 h-5 rotate-180" />
                                            <span className="sr-only">Back</span>
                                        </button>
                                        <h4 className="text-lg font-bold text-gray-800">{activeUnit} Resources</h4>
                                    </div>

                                    {/* List of Links for this Unit */}
                                    {files.filter(f => (f.isLink || (f as any).is_link || f.type === 'link') && f.name.trim().startsWith(`[${activeUnit}]`)).length === 0 ? (
                                        <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200">
                                            <p className="text-gray-500 text-sm">No links in this chapter yet.</p>
                                        </div>
                                    ) : (
                                        files
                                            .filter(f => (f.isLink || (f as any).is_link || f.type === 'link') && f.name.trim().startsWith(`[${activeUnit}]`))
                                            .map(file => (
                                                <div key={file.id} className="group flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-blue-100 hover:bg-blue-50/30 transition-all">
                                                    <div className="flex items-center gap-3 overflow-hidden">
                                                        <div className="p-2 rounded-lg bg-blue-100 text-blue-600">
                                                            <Link className="w-5 h-5" />
                                                        </div>
                                                        <div className="min-w-0 text-left">
                                                            {/* Remove [UNIT X] prefix for display */}
                                                            <h4 className="text-sm font-medium text-gray-900 truncate pr-4">
                                                                {file.name.replace(`[${activeUnit}]`, '').trim()}
                                                            </h4>
                                                            <div className="flex items-center gap-2 text-xs text-gray-500">
                                                                <span className="bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold tracking-wide">
                                                                    LINK
                                                                </span>
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex items-center gap-1">
                                                        <a
                                                            href={file.url}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                                                            title="Open Link"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </a>
                                                        {user && (
                                                            <button
                                                                onClick={() => handleDelete(file.id)}
                                                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                                                                title="Delete"
                                                            >
                                                                <Trash2 className="w-4 h-4" />
                                                            </button>
                                                        )}
                                                    </div>
                                                </div>
                                            ))
                                    )}

                                    {/* Add Link Button (Only if user logged in) */}
                                    {user && !showLinkForm && (
                                        <button
                                            onClick={() => {
                                                setSelectedUnit(activeUnit);
                                                setShowLinkForm(true);
                                            }}
                                            className="w-full py-3 border-2 border-dashed border-blue-200 rounded-xl text-blue-600 font-medium hover:bg-blue-50 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Plus className="w-5 h-5" />
                                            Add Link to {activeUnit}
                                        </button>
                                    )}
                                </div>
                            )}
                        </>
                    ) : (
                        /* STANDARD FILE LIST (For other categories) */
                        loading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                <p className="text-sm">Loading resources...</p>
                            </div>
                        ) : filteredFiles.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                                <FileText className="w-12 h-12 mb-3 text-gray-200" />
                                <p className="text-sm">No files found.</p>
                                {selectedCategory !== 'all' && <p className="text-xs mt-1">Try selecting a different category.</p>}
                            </div>
                        ) : (
                            filteredFiles.map((file) => {
                                // Determine File Type Styling
                                const getFileStyle = (name: string, isLink: boolean) => {
                                    if (isLink) return { bg: 'bg-blue-50', text: 'text-blue-600', icon: Link, border: 'border-blue-200' };

                                    const ext = name.split('.').pop()?.toLowerCase();
                                    switch (ext) {
                                        case 'pdf': return { bg: 'bg-red-50', text: 'text-red-600', icon: FileText, border: 'border-red-200' };
                                        case 'ppt':
                                        case 'pptx': return { bg: 'bg-orange-50', text: 'text-orange-600', icon: FileText, border: 'border-orange-200' }; // Use FileText or specific Presentation icon if available
                                        case 'doc':
                                        case 'docx': return { bg: 'bg-blue-50', text: 'text-blue-700', icon: FileText, border: 'border-blue-200' };
                                        case 'jpg':
                                        case 'jpeg':
                                        case 'png': return { bg: 'bg-purple-50', text: 'text-purple-600', icon: File, border: 'border-purple-200' }; // Generic image icon
                                        default: return { bg: 'bg-gray-50', text: 'text-gray-600', icon: File, border: 'border-gray-200' };
                                    }
                                };

                                const style = getFileStyle(file.name, !!file.isLink);
                                const IconComponent = style.icon;

                                return (
                                    <div key={file.id} className="group flex items-center justify-between p-3 rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-lg hover:shadow-gray-100/50 hover:-translate-y-0.5 transition-all duration-300 bg-white">
                                        <div className="flex items-center gap-4 overflow-hidden">
                                            <div className={`relative p-3 rounded-xl ${style.bg} ${style.text} border ${style.border} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                                                <IconComponent className="w-6 h-6" strokeWidth={1.5} />
                                                {/* Decorative dot */}
                                                <div className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-current opacity-40"></div>
                                            </div>
                                            <div className="min-w-0 text-left space-y-1">
                                                <h4 className="text-sm font-semibold text-gray-900 truncate pr-4 group-hover:text-blue-600 transition-colors">{file.name}</h4>
                                                <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                                                    <span className={`px-2 py-0.5 rounded-md text-[10px] uppercase tracking-wider font-bold ${style.bg} ${style.text} bg-opacity-50`}>
                                                        {getCategoryLabel(file.category || 'General')}
                                                    </span>
                                                    <span className="flex items-center gap-1">
                                                        <span className="w-1 h-1 rounded-full bg-gray-300"></span>
                                                        {file.isLink ? 'External Link' : formatSize(file.size || 0)}
                                                    </span>
                                                    <span className="text-gray-300">•</span>
                                                    <span>
                                                        {file.uploadedAt ? new Date(file.uploadedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : 'Unknown Date'}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                                            <a
                                                href={file.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className={`p-2.5 rounded-xl transition-all duration-200 ${file.isLink
                                                    ? 'text-blue-500 hover:bg-blue-50 hover:text-blue-700 hover:shadow-md hover:shadow-blue-100'
                                                    : 'text-gray-400 hover:bg-gray-100 hover:text-gray-900 hover:shadow-md hover:shadow-gray-100'}`}
                                                title={file.isLink ? "Open Link" : "Download"}
                                            >
                                                {file.isLink ? <ExternalLink className="w-5 h-5" /> : <Download className="w-5 h-5" />}
                                            </a>
                                            {user && (
                                                <button
                                                    onClick={() => handleDelete(file.id)}
                                                    className="p-2.5 text-gray-400 hover:bg-red-50 hover:text-red-600 rounded-xl transition-all duration-200 hover:shadow-md hover:shadow-red-100"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                )
                            })
                        )
                    )}
                </div>

                {/* Upload Footer (Only for Teachers) */}
                {user && (selectedCategory !== 'Links' || showLinkForm) && (
                    <div className="p-4 border-t border-gray-100 bg-gray-50 space-y-3">
                        {/* Category Selector for New Uploads */}
                        <div className="flex items-center gap-2 text-sm text-gray-600 mb-1">
                            <span>Upload to:</span>
                            <select
                                value={uploadCategory}
                                onChange={(e) => setUploadCategory(e.target.value)}
                                className="bg-white border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block p-1.5"
                            >
                                {availableCategories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.label}</option>
                                ))}
                            </select>
                        </div>


                        {/* Progress Bar & Cancel */}
                        {uploading && (
                            <div className="mb-3 animate-in fade-in slide-in-from-bottom-2">
                                <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                                    <span className="flex items-center gap-2">
                                        Uploading... {Math.round(progress)}%
                                    </span>
                                    <button
                                        onClick={cancelUpload}
                                        className="text-red-500 hover:text-red-700 hover:bg-red-50 px-2 py-1 rounded transition-colors text-xs font-medium"
                                    >
                                        Cancel
                                    </button>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                    <div
                                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                        style={{ width: `${progress}%` }}
                                    ></div>
                                </div>
                            </div>
                        )}

                        {/* Link Sharing Form */}
                        {showLinkForm ? (
                            <form onSubmit={handleAddLink} className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 animate-in zoom-in-95 duration-200">
                                <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">Add External Resource Link</h4>
                                <div className="space-y-3">
                                    <div className="flex gap-2">
                                        <select
                                            value={selectedUnit}
                                            onChange={(e) => setSelectedUnit(e.target.value)}
                                            className="w-1/3 p-2 text-sm border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white"
                                        >
                                            {UNIT_OPTIONS.map(opt => (
                                                <option key={opt} value={opt}>{opt}</option>
                                            ))}
                                        </select>
                                        <input
                                            type="text"
                                            placeholder="Resource Name"
                                            value={linkName}
                                            onChange={(e) => setLinkName(e.target.value)}
                                            className="flex-1 p-2 text-sm border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                            required
                                        />
                                    </div>
                                    <input
                                        type="url"
                                        placeholder="Paste Link (e.g. YouTube URL)"
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                        className="w-full p-2 text-sm border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                                        required
                                    />



                                    <div className="flex gap-2">
                                        <button
                                            type="submit"
                                            disabled={addingLink}
                                            className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {addingLink ? (
                                                <>
                                                    <Loader2 className="w-4 h-4 animate-spin" />
                                                    Adding...
                                                </>
                                            ) : (
                                                <>
                                                    <Plus className="w-4 h-4" />
                                                    Add Link
                                                </>
                                            )}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => setShowLinkForm(false)}
                                            className="px-4 py-2 text-sm font-medium text-gray-500 hover:bg-gray-100 rounded-lg transition-colors"
                                        >
                                            Cancel
                                        </button>
                                    </div>
                                </div>
                            </form>
                        ) : (
                            <div className="flex flex-col gap-2">


                                <label className={`flex items-center justify-center w-full p-3 rounded-lg border-2 border-dashed ${uploading ? 'border-gray-300 bg-gray-100 cursor-not-allowed' : 'border-red-300 bg-white hover:bg-red-50 cursor-pointer'} transition-all group`}>
                                    <div className="flex items-center gap-2 text-sm font-medium text-gray-400 group-hover:text-red-500">
                                        {uploading ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                Uploading...
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-5 h-5" />
                                                Upload Files (PDF, DOC, PPT, etc.)
                                            </>
                                        )}
                                    </div>
                                    <input
                                        type="file"
                                        multiple
                                        className="hidden"
                                        onChange={handleUpload}
                                        disabled={uploading}
                                    />
                                </label>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Hide Scrollbar Styles */}
            <style>{`
                .scrollbar-hide::-webkit-scrollbar {
                    display: none;
                }
                .scrollbar-hide {
                    -ms-overflow-style: none;
                    scrollbar-width: none;
                }
            `}</style>
        </div>
    );
};

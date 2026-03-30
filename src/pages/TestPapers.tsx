import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Upload, FileText, Download, Trash2, Loader2, File, Link, Plus, ExternalLink, ChevronLeft } from 'lucide-react';
import { FileService, type PracticalResource } from '../services/fileService';
import { AuthService } from '../services/authService';
import { Layout } from '../components/Layout';

export const TestPapers: React.FC = () => {
    const { batch, type, department } = useParams<{ batch: string; type: string; department: string }>();
    const navigate = useNavigate();

    const currentDept = department || 'aiml';

    // Convert URL param to human readable title and internal subject key
    const pageTitle = type === 'unit-test' ? 'Unit Test Papers' : 'Class Test Papers';
    const subjectKey = type === 'unit-test' ? 'UnitTest' : 'ClassTest';

    const [files, setFiles] = useState<PracticalResource[]>([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);
    const [progress, setProgress] = useState(0);
    const [user, setUser] = useState<any>(null);
    const [showLinkForm, setShowLinkForm] = useState(false);
    const [linkName, setLinkName] = useState('');
    const [linkUrl, setLinkUrl] = useState('');
    const [addingLink, setAddingLink] = useState(false);
    const activeUploadsRef = React.useRef<(() => void)[]>([]);

    const storageBatch = 'GLOBAL'; // Fits in VARCHAR(10) limit

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        setUser(currentUser);
    }, []);

    const cancelUpload = () => {
        activeUploadsRef.current.forEach(cancel => cancel());
        activeUploadsRef.current = [];
        setUploading(false);
        setProgress(0);
    };

    useEffect(() => {
        if (!batch) return;

        setLoading(true);
        // Use storageBatch instead of batch to share files across all batches
        const unsubscribeFiles = FileService.subscribeToFiles(storageBatch, subjectKey, (data) => {
            setFiles(data);
            setLoading(false);
        });

        // Fallback timeout
        const loadTimeout = setTimeout(() => {
            setLoading((prev) => {
                if (prev) return false;
                return prev;
            });
        }, 10000);

        return () => {
            unsubscribeFiles();
            clearTimeout(loadTimeout);
        };
    }, [batch, subjectKey]);

    const handleAddLink = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!linkName || !linkUrl || !user || !batch) return;

        setAddingLink(true);
        try {
            await FileService.addLink(storageBatch, subjectKey, linkName, linkUrl, user.email || 'Teacher');
            setLinkName('');
            setLinkUrl('');
            setShowLinkForm(false);
        } catch (error) {
            alert('Failed to add link. Please try again.');
        } finally {
            setAddingLink(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const fileList = e.target.files;
        if (!fileList || fileList.length === 0 || !user || !batch) return;

        try {
            setUploading(true);
            setProgress(0);

            const { promise, cancel } = FileService.uploadFile(
                storageBatch,
                subjectKey,
                fileList,
                user.email || 'Teacher',
                undefined, // No specific category for test papers
                (prog) => setProgress(prog)
            );

            activeUploadsRef.current = [cancel];
            const result = await promise;

            if (result.status === 'error' || (result.errors && result.errors.length > 0)) {
                const msg = result.message || 'Upload failed';
                const details = result.errors ? `\n${result.errors.join('\n')}` : '';
                alert(`${msg}${details}`);
            }
        } catch (error: any) {
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
            await FileService.deleteFile(fileId);
        } catch (error) {
            alert('Failed to delete resource. Please try again.');
        }
    };

    const formatSize = (bytes: number) => {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const classes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + classes[i];
    };

    return (
        <Layout>
            <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full p-4 sm:p-6 md:p-8">
                {/* Header */}
                <div className="flex items-center mb-6 md:mb-8 pb-4 md:pb-6 border-b border-gray-200">
                    <button
                        onClick={() => navigate(`/timetable/${currentDept}/${batch}`)}
                        className="p-3 -ml-2 rounded-lg hover:bg-red-50 transition-colors mr-3 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
                    >
                        <ChevronLeft className="w-6 h-6 text-red-600" />
                    </button>
                    <div>
                        <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
                            {pageTitle}
                        </h2>
                        <p className="text-gray-500 text-xs sm:text-sm mt-1">Batch {batch}</p>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 flex flex-col gap-6">
                    {/* Upload Section (Teachers Only) */}
                    {user && (
                        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
                            {uploading && (
                                <div className="mb-4 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex justify-between items-center text-xs text-gray-500 mb-1">
                                        <span className="flex items-center gap-2">Uploading... {Math.round(progress)}%</span>
                                        <button onClick={cancelUpload} className="text-red-500 hover:bg-red-50 px-2 py-1 rounded text-xs">Cancel</button>
                                    </div>
                                    <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                                        <div className="bg-red-600 h-2 rounded-full transition-all duration-300" style={{ width: `${progress}%` }}></div>
                                    </div>
                                </div>
                            )}

                            {showLinkForm ? (
                                <form onSubmit={handleAddLink} className="p-4 bg-blue-50/50 rounded-xl border border-blue-100 animate-in zoom-in-95 duration-200">
                                    <h4 className="text-xs font-bold text-blue-700 uppercase tracking-wider mb-3">Add Link</h4>
                                    <div className="space-y-3">
                                        <input
                                            type="text"
                                            placeholder="Name (e.g. Unit 1 Test)"
                                            value={linkName}
                                            onChange={(e) => setLinkName(e.target.value)}
                                            className="w-full p-2 text-sm border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                        <input
                                            type="url"
                                            placeholder="URL"
                                            value={linkUrl}
                                            onChange={(e) => setLinkUrl(e.target.value)}
                                            className="w-full p-2 text-sm border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                                            required
                                        />
                                        <div className="flex gap-2">
                                            <button type="submit" disabled={addingLink} className="flex-1 bg-blue-600 text-white py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2">
                                                {addingLink ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                                                Add
                                            </button>
                                            <button type="button" onClick={() => setShowLinkForm(false)} className="px-4 py-2 text-sm text-gray-500 hover:bg-gray-100 rounded-lg">Cancel</button>
                                        </div>
                                    </div>
                                </form>
                            ) : (
                                <div className="flex flex-col gap-2">
                                    <button onClick={() => setShowLinkForm(true)} className="flex items-center justify-center gap-2 w-full p-3 rounded-lg border-2 border-dashed border-blue-300 bg-blue-50 text-blue-700 hover:bg-blue-100 transition-all font-medium text-sm">
                                        <Link className="w-5 h-5" /> Add Link
                                    </button>
                                    <div className="relative"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-gray-200"></span></div><div className="relative flex justify-center text-xs"><span className="px-2 bg-gray-50 text-gray-400">OR</span></div></div>
                                    <label className={`flex items-center justify-center w-full p-3 rounded-lg border-2 border-dashed ${uploading ? 'border-gray-300 bg-gray-100 cursor-not-allowed' : 'border-red-300 bg-white hover:bg-red-50 cursor-pointer'} transition-all group`}>
                                        <div className="flex items-center gap-2 text-sm font-medium text-gray-400 group-hover:text-red-500">
                                            {uploading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                                            Upload Files
                                        </div>
                                        <input type="file" multiple className="hidden" onChange={handleUpload} disabled={uploading} />
                                    </label>
                                </div>
                            )}
                        </div>
                    )}

                    {/* File List */}
                    <div className="space-y-3">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                                <Loader2 className="w-8 h-8 animate-spin mb-2" />
                                <p className="text-sm">Loading...</p>
                            </div>
                        ) : files.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-400 border-2 border-dashed border-gray-100 rounded-xl">
                                <FileText className="w-12 h-12 mb-3 text-gray-200" />
                                <p className="text-sm">No papers found.</p>
                            </div>
                        ) : (
                            files.map((file) => (
                                <div key={file.id} className="group flex items-center justify-between p-3 rounded-lg border border-gray-100 hover:border-red-100 hover:bg-red-50/30 transition-all bg-white shadow-sm">
                                    <div className="flex items-center gap-3 overflow-hidden">
                                        <div className={`p-2 rounded-lg ${file.isLink ? 'bg-blue-100 text-blue-600' : 'bg-red-100 text-red-600'}`}>
                                            {file.isLink ? <Link className="w-5 h-5" /> : <File className="w-5 h-5" />}
                                        </div>
                                        <div className="min-w-0 text-left">
                                            <h4 className="text-sm font-medium text-gray-900 truncate pr-4">{file.name}</h4>
                                            <p className="text-xs text-gray-500">
                                                {file.isLink ? 'External Link' : formatSize(file.size)} • {new Date(file.uploadedAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <a href={file.url} target="_blank" rel="noopener noreferrer" className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                                            {file.isLink ? <ExternalLink className="w-4 h-4" /> : <Download className="w-4 h-4" />}
                                        </a>
                                        {user && (
                                            <button onClick={() => handleDelete(file.id)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors">
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </Layout>
    );
};

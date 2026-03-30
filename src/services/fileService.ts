const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface PracticalResource {
    id: string;
    name: string;
    url: string;
    type: string;
    uploadedAt: string; // ISO String from PHP
    uploadedBy?: string;
    size: number;
    isLink?: boolean;
    storagePath?: string;
    category?: string; // New field
}

export const FileService = {
    // Subscribe to files (Using polling)
    subscribeToFiles(batch: string, subject: string, callback: (files: PracticalResource[]) => void) {
        const GLOBAL_BATCH = 'GLOBAL';
        const fetchResources = async () => {
            try {
                // Fetch Batch + Global in parallel
                const [batchRes, globalRes] = await Promise.all([
                    fetch(`${API_BASE_URL}/resources?batch=${batch}&subject=${subject}`),
                    fetch(`${API_BASE_URL}/resources?batch=${GLOBAL_BATCH}&subject=${subject}`)
                ]);

                if (!batchRes.ok || !globalRes.ok) throw new Error("API response error");

                const batchData = await batchRes.json();
                const globalData = await globalRes.json();

                // Merge and deduplicate by ID
                const allFiles = [...batchData, ...globalData];
                const uniqueFiles = Array.from(new Map(allFiles.map(item => [item.id, item])).values());

                if (import.meta.env.DEV && uniqueFiles.length > 0) {
                    console.log(`[FileService] Fetched ${uniqueFiles.length} unique files for ${batch}/${subject}. Links:`, uniqueFiles.filter((f: any) => f.isLink || f.is_link).length);
                    console.log(`[FileService] First item:`, uniqueFiles[0]);
                }

                callback(uniqueFiles as PracticalResource[]);
            } catch (error) {
                console.error("[FileService] Error fetching from API:", error);
            }
        };

        // Initial fetch
        fetchResources();

        // Refresh every 5 seconds
        const interval = setInterval(fetchResources, 5000);

        return () => {
            clearInterval(interval);
        };
    },

    // One-time fetch
    async getFiles(batch: string, subject: string): Promise<PracticalResource[]> {
        const response = await fetch(`${API_BASE_URL}/resources?batch=${batch}&subject=${subject}`);
        if (!response.ok) throw new Error("API Connection Error");
        return await response.json();
    },

    // Delete a resource
    async deleteFile(fileId: string) {
        console.log(`[FileService] Deleting resource ${fileId}...`);
        const response = await fetch(`${API_BASE_URL}/resources/${fileId}`, {
            method: 'DELETE'
        });
        const result = await response.json();
        if (result.status === "error") throw new Error(result.message);
        return result;
    },

    // Add a resource link
    async addLink(batch: string, subject: string, name: string, url: string, uploadedBy: string, category?: string, isGlobal?: boolean) {
        const targetBatch = isGlobal ? 'GLOBAL' : batch;
        console.log(`[FileService] Sending link "${name}" to API (Batch: ${targetBatch})...`);
        const response = await fetch(`${API_BASE_URL}/links`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Bypass-Tunnel-Reminder': 'true'
            },
            body: JSON.stringify({ batch: targetBatch, subject, name, url, uploadedBy, category: category || 'General' })
        });
        const result = await response.json();
        if (result.status === "error") throw new Error(result.message);
        return result;
    },

    // File upload with progress tracking
    uploadFile(batch: string, subject: string, files: FileList, uploadedBy: string, category: string | undefined, onProgress: (progress: number) => void) {
        const GLOBAL_BATCH = 'GLOBAL';
        const targetBatch = (category && category !== 'General') ? GLOBAL_BATCH : batch;

        const formData = new FormData();
        formData.append('batch', targetBatch);
        formData.append('subject', subject);
        formData.append('uploadedBy', uploadedBy);
        formData.append('category', category || 'General');

        // Append all files
        for (let i = 0; i < files.length; i++) {
            formData.append('files[]', files[i]);
        }

        const xhr = new XMLHttpRequest();
        let cancelled = false;

        // Track upload progress
        xhr.upload.addEventListener('progress', (e) => {
            if (e.lengthComputable && !cancelled) {
                const progress = (e.loaded / e.total) * 100;
                onProgress(progress);
            }
        });

        const promise = new Promise<any>((resolve, reject) => {
            xhr.addEventListener('load', () => {
                if (cancelled) {
                    reject(new Error('Upload cancelled'));
                    return;
                }

                if (xhr.status === 200) {
                    try {
                        const response = JSON.parse(xhr.responseText);
                        if (response.status === 'success') {
                            resolve(response);
                        } else {
                            reject(new Error(response.message || 'Upload failed'));
                        }
                    } catch (e) {
                        reject(new Error('Invalid response from server'));
                    }
                } else {
                    reject(new Error(`Upload failed with status ${xhr.status}`));
                }
            });

            xhr.addEventListener('error', () => {
                if (!cancelled) {
                    reject(new Error('Network error during upload'));
                }
            });

            xhr.open('POST', `${API_BASE_URL}/upload`);
            xhr.send(formData);
        });

        const cancel = () => {
            cancelled = true;
            xhr.abort();
        };

        return { promise, cancel };
    }
};

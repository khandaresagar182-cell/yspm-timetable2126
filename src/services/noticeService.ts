const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

export interface Notice {
    id: number;
    title: string;
    content: string;
    department_id: string | null;
    created_by: string;
    created_at: string;
    updated_at: string;
    is_active: number;
    attachment_path?: string;
    attachment_name?: string;
}

export interface CreateNoticeDto {
    title: string;
    content: string;
    department_id?: string;
    created_by?: string;
    attachment?: File;
}

export const NoticeService = {
    async getNotices(departmentId?: string): Promise<Notice[]> {
        try {
            const url = departmentId
                ? `${API_BASE_URL}/notices?department_id=${departmentId}`
                : `${API_BASE_URL}/notices`;
            const response = await fetch(url);
            if (!response.ok) throw new Error('Failed to fetch notices');
            return await response.json();
        } catch (error) {
            console.error('Error fetching notices:', error);
            return [];
        }
    },

    async createNotice(notice: CreateNoticeDto): Promise<{ status: string; id?: number }> {
        try {
            const formData = new FormData();
            formData.append('title', notice.title);
            formData.append('content', notice.content);
            if (notice.department_id) formData.append('department_id', notice.department_id);
            if (notice.created_by) formData.append('created_by', notice.created_by);
            if (notice.attachment) formData.append('attachment', notice.attachment);

            const response = await fetch(`${API_BASE_URL}/notices`, {
                method: 'POST',
                body: formData // No Content-Type header needed, browser sets it for FormData
            });
            return await response.json();
        } catch (error) {
            console.error('Error creating notice:', error);
            return { status: 'error' };
        }
    },

    async updateNotice(id: number, notice: CreateNoticeDto): Promise<{ status: string }> {
        try {
            // For updates, we might stick to JSON if file update isn't critically needed yet, 
            // or switch to FormData. The backend update endpoint in index.ts (which I didn't verify closely for Update) 
            // relies on JSON body 'title', 'content'.
            // To support file update, I'd need to change the PUT endpoint too. 
            // For now, let's keep update simple (no file change support in update for this iteration unless requested).
            // Retaining JSON for update to match current backend implementation.

            const response = await fetch(`${API_BASE_URL}/notices/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Bypass-Tunnel-Reminder': 'true'
                },
                body: JSON.stringify({
                    title: notice.title,
                    content: notice.content,
                    department_id: notice.department_id,
                    created_by: notice.created_by
                })
            });
            return await response.json();
        } catch (error) {
            console.error('Error updating notice:', error);
            return { status: 'error' };
        }
    },

    async deleteNotice(id: number): Promise<{ status: string }> {
        try {
            const response = await fetch(`${API_BASE_URL}/notices/${id}`, {
                method: 'DELETE'
            });
            return await response.json();
        } catch (error) {
            console.error('Error deleting notice:', error);
            return { status: 'error' };
        }
    }
};

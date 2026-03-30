const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

interface User {
    id: string;
    email: string;
    role: string;
}

export const AuthService = {
    // Login Function
    async login(email: string, password: string): Promise<User> {


        const response = await fetch(`${API_BASE_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Bypass-Tunnel-Reminder': 'true'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (data.status === 'success') {
            const user = data.user;
            localStorage.setItem('user', JSON.stringify(user)); // Save session
            return user;
        } else {
            throw new Error(data.message || 'Login failed');
        }
    },

    // Get Current User
    getCurrentUser(): User | null {
        const userStr = localStorage.getItem('user');
        try {
            return userStr ? JSON.parse(userStr) : null;
        } catch (e) {
            if (import.meta.env.DEV) console.error("AuthService: Failed to parse user data", e);
            localStorage.removeItem('user'); // Clear corrupted data
            return null;
        }
    },

    // Logout
    logout() {
        localStorage.removeItem('user');
    }
};

import React, { useState, useEffect } from 'react';
import { AuthService } from '../services/authService';
import { useNavigate } from 'react-router-dom';
import { Trash2, UserPlus, Shield, Key } from 'lucide-react';

interface User {
    id: number;
    email: string;
    role: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const AdminDashboard: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [newUserEmail, setNewUserEmail] = useState('');
    const [newUserPassword, setNewUserPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [newPassword, setNewPassword] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        const currentUser = AuthService.getCurrentUser();
        if (!currentUser || currentUser.role !== 'admin') {
            navigate('/login');
            return;
        }
        fetchUsers();
    }, [navigate]);

    const fetchUsers = async () => {
        try {
            const response = await fetch(`${API_BASE_URL}/users`);
            const data = await response.json();
            setUsers(data);
        } catch (err) {
            setError('Failed to fetch users');
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        try {
            const response = await fetch(`${API_BASE_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: newUserEmail, password: newUserPassword, role: 'teacher' })
            });

            const result = await response.json();
            if (result.status === 'success') {
                setSuccess('User created successfully!');
                setNewUserEmail('');
                setNewUserPassword('');
                fetchUsers();
            } else {
                setError(result.message || 'Failed to create user');
            }
        } catch (err) {
            setError('Failed to create user');
        }
    };

    const handleDeleteUser = async (id: number) => {
        if (!window.confirm('Are you sure you want to delete this user?')) return;

        try {
            const response = await fetch(`${API_BASE_URL}/users/${id}`, {
                method: 'DELETE'
            });
            const result = await response.json();

            if (result.status === 'success') {
                alert("User deleted successfully"); // Feedback
                fetchUsers();
            } else {
                alert(`Failed to delete: ${result.message}`);
            }
        } catch (err) {
            alert('Failed to delete user. Please try again.');
        }
    };

    const handleUpdatePassword = async () => {
        if (!editingUser || !newPassword) return;

        try {
            const response = await fetch(`${API_BASE_URL}/users/${editingUser.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: newPassword })
            });

            const result = await response.json();
            if (result.status === 'success') {
                setSuccess(`Password updated for ${editingUser.email}`);
                setEditingUser(null);
                setNewPassword('');
                setTimeout(() => setSuccess(''), 3000);
            } else {
                alert(`Failed to update: ${result.message}`);
            }
        } catch (err) {
            alert('Failed to reset password. Please try again.');
        }
    };

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold mb-8 flex items-center gap-2">
                <Shield className="w-8 h-8 text-indigo-600" />
                Admin Dashboard
            </h1>

            {/* Create User Card */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8 max-w-2xl">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <UserPlus className="w-5 h-5" />
                    Add New Teacher
                </h2>
                <form onSubmit={handleCreateUser} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                        <input
                            type="email"
                            required
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                            value={newUserEmail}
                            onChange={(e) => setNewUserEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <input
                            type="password"
                            required
                            className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                            value={newUserPassword}
                            onChange={(e) => setNewUserPassword(e.target.value)}
                        />
                    </div>

                    {error && <p className="text-red-500 text-sm">{error}</p>}
                    {success && <p className="text-green-500 text-sm">{success}</p>}

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white py-2 rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        Create User
                    </button>
                </form>
            </div>

            {/* User List */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => (
                            <tr key={user.id}>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.id}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.email}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-green-100 text-green-800'}`}>
                                        {user.role}
                                    </span>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    <div className="flex items-center">
                                        {user.role !== 'admin' && (
                                            <button
                                                onClick={() => handleDeleteUser(user.id)}
                                                className="text-red-600 hover:text-red-900 flex items-center gap-1"
                                                title="Delete User"
                                            >
                                                <Trash2 className="w-4 h-4" /> Delete
                                            </button>
                                        )}
                                        <button
                                            onClick={() => setEditingUser(user)}
                                            className="text-indigo-600 hover:text-indigo-900 flex items-center gap-1 ml-4"
                                            title="Change Password"
                                        >
                                            <Key className="w-4 h-4" /> Pass
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Change Password Modal */}
            {editingUser && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h3 className="text-xl font-bold mb-4">Change Password</h3>
                        <p className="text-sm text-gray-600 mb-4">
                            Update password for <span className="font-semibold">{editingUser.email}</span>
                        </p>

                        <div className="mb-4">
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input
                                type="password"
                                className="w-full px-3 py-2 border rounded-md focus:ring-2 focus:ring-indigo-500"
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                placeholder="Enter new password"
                            />
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => {
                                    setEditingUser(null);
                                    setNewPassword('');
                                }}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleUpdatePassword}
                                disabled={!newPassword}
                                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 disabled:opacity-50"
                            >
                                Update Password
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminDashboard;

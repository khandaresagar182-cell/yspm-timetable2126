import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ChevronDown, ChevronLeft, LogOut } from 'lucide-react';

import { AuthService } from '../services/authService';

export const BatchSelect: React.FC = () => {
  const navigate = useNavigate();
  const { department } = useParams<{ department: string }>();
  const [user, setUser] = useState<any>(null);

  const currentDepartment = department || 'aiml';

  const departmentNames: { [key: string]: string } = {
    'aiml': 'AI & Machine Learning',
    'computer': 'Computer Engineering',
    'mechanical': 'Mechanical Engineering',
    'civil': 'Civil Engineering',
    'electrical': 'Electrical Engineering',
    'electronics': 'Electronics & Telecom'
  };

  const departmentName = departmentNames[currentDepartment] || 'Unknown Department';

  useEffect(() => {
    setUser(AuthService.getCurrentUser());
  }, []);

  const handleLogout = () => {
    AuthService.logout();
    navigate('/');
  };

  const handleSelect = (batch: string) => {
    navigate(`/timetable/${currentDepartment}/${batch}`);
  };

  // Standard Design Implementation matching DepartmentSelect.tsx
  return (
    <div className="min-h-screen bg-white">
      {/* Official Header Bar */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 border-b-4 border-amber-500 shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <img
              src={`${import.meta.env.BASE_URL}yspm-logo.png`}
              alt="YSPM Logo"
              className="w-12 h-12 object-contain"
            />
            <div>
              <h1 className="text-lg font-bold text-white leading-tight">
                YASHODA COLLEGE OF POLYTECHNIC
              </h1>
              <p className="text-xs text-blue-100">Yashoda Shikshan Prasarak Mandal, Satara</p>
            </div>
          </div>
          {/* Logout Button if user is logged in */}
          {user && (
            <button
              onClick={handleLogout}
              className="text-white hover:text-amber-400 text-sm font-medium flex items-center gap-2 transition-colors"
              title="Logout"
            >
              <span className="hidden sm:inline">Logout</span>
              <LogOut className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Breadcrumb Navigation */}
      <div className="bg-blue-50 border-b border-blue-100">
        <div className="max-w-7xl mx-auto px-6 py-3">
          <div className="flex items-center gap-2 text-sm">
            <span className="text-gray-500 cursor-pointer hover:text-blue-700" onClick={() => navigate('/')}>Home</span>
            <ChevronDown className="w-3 h-3 text-gray-400 -rotate-90" />
            <span className="text-gray-500 cursor-pointer hover:text-blue-700" onClick={() => navigate('/select-department')}>Departments</span>
            <ChevronDown className="w-3 h-3 text-gray-400 -rotate-90" />
            <span className="text-blue-800 font-medium">{departmentName}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Page Header */}
        <div className="mb-10 border-l-4 border-blue-900 pl-4">
          <h2 className="text-3xl font-bold text-blue-900 mb-2">Select Batch</h2>
          <p className="text-gray-700">Choose your batch for <strong>{departmentName}</strong> to view the timetable.</p>
        </div>

        {/* Batch Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-12 max-w-4xl">
          {['S1', 'S2', 'S3'].map((batch, index) => (
            <button
              key={batch}
              onClick={() => handleSelect(batch)}
              className="group relative p-8 bg-white rounded-xl border-2 border-gray-200 hover:border-blue-600 hover:shadow-xl transition-all duration-300 text-left overflow-hidden"
              style={{ animation: `slideUp 0.5s ease-out ${index * 0.1}s both` }}
            >
              <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                <div className="text-6xl font-black text-blue-900">{batch}</div>
              </div>

              <div className="w-14 h-14 bg-blue-50 rounded-lg flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors duration-300">
                <span className="text-2xl font-bold text-blue-700 group-hover:text-white">{batch}</span>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-1 group-hover:text-blue-700 transition-colors">
                Batch {batch}
              </h3>
              <p className="text-sm text-gray-500">View Timetable &rarr;</p>
            </button>
          ))}
        </div>

        {/* Back Button */}
        <div>
          <button
            onClick={() => navigate('/select-department')}
            className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
          >
            <ChevronLeft className="w-4 h-4" />
            Back to Departments
          </button>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white mt-auto border-t-4 border-amber-500">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center text-sm text-gray-400">
            <p>© 2026 Yashoda College of Polytechnic, Satara. All rights reserved.</p>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style>{`
          @keyframes slideUp {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
          }
      `}</style>
    </div>
  );
};

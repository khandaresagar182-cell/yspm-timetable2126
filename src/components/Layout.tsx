import React from 'react';
import { useNavigate } from 'react-router-dom';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm py-3 sm:py-4 px-4 sm:px-6 sticky top-0 z-30">
        <div
          className="flex items-center gap-2 sm:gap-3 cursor-pointer hover:opacity-80 transition-opacity max-w-5xl mx-auto"
          onClick={() => navigate('/')}
        >
          <img
            src="/yspm-logo.png"
            alt="YSPM Logo"
            className="w-8 h-8 sm:w-10 sm:h-10 object-contain"
          />
          <div>
            <h1 className="text-base sm:text-lg font-bold text-gray-900">YSPM Timetable</h1>
            <p className="text-xs text-gray-500 hidden sm:block">Department of Artificial Intelligence & Machine Learning</p>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-6 sm:py-8 text-center text-gray-600 text-sm mt-auto">
        <div className="max-w-5xl mx-auto px-4 sm:px-6">
          <p className="font-medium text-gray-700 mb-2 text-sm sm:text-base">YSPM - Department of AI & ML</p>
          <p className="text-xs sm:text-sm">&copy; {new Date().getFullYear()} YSPM. All rights reserved.</p>
          <p className="text-xs text-gray-500 mt-2">Building Tomorrow's Tech Leaders</p>
        </div>
      </footer>
    </div>
  );
};

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronDown } from 'lucide-react';
import { Layout } from '../components/Layout';

export const BatchSelect: React.FC = () => {
  const navigate = useNavigate();
  const [isOpen, setIsOpen] = React.useState(false);

  const handleSelect = (batch: string) => {
    navigate(`/timetable/${batch}`);
  };

  return (
    <Layout>
      <div className="min-h-screen bg-black flex flex-col items-center justify-center p-4 relative">
        {/* Background glow effect */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 md:w-64 md:h-64 bg-red-500/10 rounded-full blur-3xl"></div>

        {/* YSPM Logo */}
        <div className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 mb-8 md:mb-12 relative z-10">
          <img
            src={`${import.meta.env.BASE_URL}yspm-logo.png`}
            alt="YSPM Logo"
            className="w-full h-full object-contain drop-shadow-2xl"
          />
        </div>

        {/* Dropdown Menu */}
        <div className="relative z-20 w-full max-w-xs sm:max-w-sm md:w-64">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="w-full bg-white rounded-lg py-4 px-6 flex items-center justify-between shadow-lg hover:shadow-xl active:scale-95 transition-all min-h-[48px]"
          >
            <span className="text-gray-800 font-medium text-base sm:text-lg">Select Batch</span>
            <ChevronDown
              className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
            />
          </button>

          {isOpen && (
            <div className="absolute top-full left-0 w-full mt-2 bg-white/95 backdrop-blur-sm rounded-lg shadow-xl overflow-hidden animate-in fade-in slide-in-from-top-2 border border-gray-200">
              {['S1', 'S2', 'S3'].map((batch) => (
                <button
                  key={batch}
                  onClick={() => {
                    handleSelect(batch);
                    setIsOpen(false);
                  }}
                  className="w-full text-left px-6 py-4 text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors border-b border-gray-100 last:border-none active:bg-red-100 text-base sm:text-lg min-h-[48px]"
                >
                  {batch} Batch
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

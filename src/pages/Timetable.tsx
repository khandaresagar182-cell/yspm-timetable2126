import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { timetableData } from '../data/timetable';
import { DayCard } from '../components/DayCard';
import { Layout } from '../components/Layout';

export const Timetable: React.FC = () => {
  const { batch, day } = useParams<{ batch: string; day?: string }>();
  const navigate = useNavigate();

  const currentBatch = batch || 'S1';
  const schedule = timetableData[currentBatch];
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  if (!schedule) {
    return (
      <Layout>
        <div className="flex items-center justify-center h-full p-12 text-gray-500">
          Batch not found
        </div>
      </Layout>
    );
  }

  const handleBack = () => {
    if (day) {
      navigate(`/timetable/${currentBatch}`);
    } else {
      navigate('/');
    }
  };

  return (
    <Layout>
      <div className="flex-1 flex flex-col max-w-5xl mx-auto w-full p-4 sm:p-6 md:p-8">
        {/* Header with Back Button */}
        <div className="flex items-center mb-6 md:mb-8 pb-4 md:pb-6 border-b border-gray-200">
          <button
            onClick={handleBack}
            className="p-3 -ml-2 rounded-lg hover:bg-red-50 transition-colors mr-3 active:scale-95 min-w-[44px] min-h-[44px] flex items-center justify-center"
          >
            <ChevronLeft className="w-6 h-6 text-red-600" />
          </button>
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900">
              {day ? `${day}` : `Week Schedule`}
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-1">Batch {currentBatch}</p>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1">
          {day ? (
            // Single Day View
            <div className="animate-in fade-in slide-in-from-right-4 duration-300">
              <DayCard day={day} items={schedule[day] || []} />
            </div>
          ) : (
            // Day Selection View
            <div className="space-y-4 animate-in fade-in slide-in-from-left-4 duration-300">
              {/* Info Banner */}
              <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl p-5 sm:p-6 text-white mb-6 shadow-md">
                <h3 className="text-lg sm:text-xl font-bold">Select a Day</h3>
                <p className="text-red-100 text-xs sm:text-sm mt-1">
                  View your timetable for {currentBatch} Batch
                </p>
              </div>

              {/* Days Grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
                {days.map((d) => (
                  <button
                    key={d}
                    onClick={() => navigate(`/timetable/${currentBatch}/${d}`)}
                    className="bg-white rounded-xl p-5 sm:p-6 shadow-md hover:shadow-lg border border-gray-200 hover:border-red-300 transition-all flex flex-col items-start justify-between group active:scale-95 min-h-[100px]"
                  >
                    <div className="w-full">
                      <span className="font-bold text-base sm:text-lg text-gray-900 group-hover:text-red-600 transition-colors block">
                        {d}
                      </span>
                      <p className="text-xs text-gray-500 mt-2">
                        {schedule[d]?.length || 0} classes scheduled
                      </p>
                    </div>
                    <div className="w-10 h-10 rounded-full bg-red-50 group-hover:bg-red-100 flex items-center justify-center transition-colors mt-4 self-end">
                      <ChevronLeft className="w-5 h-5 text-red-500 rotate-180" />
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

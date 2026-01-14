import React from 'react';
import type { ScheduleItem as ScheduleItemType } from '../data/timetable';

interface ScheduleItemProps {
  item: ScheduleItemType;
}

export const ScheduleItem: React.FC<ScheduleItemProps> = ({ item }) => {
  const isLab = item.type === 'Lab';

  return (
    <div className="bg-white rounded-xl shadow-md p-4 sm:p-5 border border-gray-200 hover:shadow-lg hover:border-red-300 transition-all active:scale-95">
      {/* Subject and Type Row */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <div className="flex-1">
          <h4 className="font-bold text-gray-900 text-base sm:text-lg">{item.subject}</h4>
          <div className="flex items-center gap-2 mt-2">
            <span
              className={`inline-flex items-center px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold ${isLab
                  ? 'bg-blue-100 text-blue-700 border border-blue-300'
                  : 'bg-red-100 text-red-700 border border-red-300'
                }`}
            >
              {item.type}
            </span>
          </div>
        </div>
      </div>

      {/* Time Section */}
      <div className="border-t border-gray-100 pt-3">
        <div className="flex items-center gap-2">
          <span className="text-gray-500 text-sm">🕐</span>
          <span className="text-gray-700 font-medium text-sm">{item.time}</span>
        </div>
      </div>
    </div>
  );
};

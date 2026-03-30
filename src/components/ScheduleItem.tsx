import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import type { ScheduleItem as ScheduleItemType } from '../data/timetable';
import { ResourceViewer } from './ResourceViewer';
import { FolderOpen, Clock } from 'lucide-react';

interface ScheduleItemProps {
  item: ScheduleItemType;
}

export const ScheduleItem: React.FC<ScheduleItemProps> = ({ item }) => {
  const isLab = item.type === 'Lab';
  const { batch } = useParams<{ batch: string }>();
  const [showResources, setShowResources] = useState(false);

  return (
    <>
      <div className="bg-white rounded-xl shadow-md p-4 sm:p-5 border border-gray-200 hover:shadow-lg hover:border-red-300 transition-all active:scale-95 group">
        {/* Subject and Type Row */}
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1">
            <h4 className="font-bold text-gray-900 text-base sm:text-lg group-hover:text-red-600 transition-colors">{item.subject}</h4>
          </div>

          <span
            className={`cursor-default inline-flex items-center px-4 py-1.5 rounded-full text-sm font-bold shadow-sm ${isLab
              ? 'bg-blue-100 text-blue-700 border border-blue-300'
              : 'bg-red-100 text-red-700 border border-red-300'
              }`}
          >
            {item.type}
          </span>
        </div>

        {/* Time and Actions Section */}
        <div className="border-t border-gray-100 pt-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5 bg-gray-50 px-4 py-2 rounded-lg border border-gray-100">
            <Clock className="w-5 h-5 text-gray-500" />
            <span className="text-gray-800 font-bold text-base tracking-wide">{item.time}</span>
          </div>

          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowResources(true);
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors border border-transparent hover:border-red-200"
          >
            <FolderOpen className="w-3.5 h-3.5" />
            Resources
          </button>
        </div>
      </div>

      <ResourceViewer
        isOpen={showResources}
        onClose={() => setShowResources(false)}
        batch={batch || 'S1'}
        subject={item.subject}
        isLab={isLab}
      />
    </>
  );
};

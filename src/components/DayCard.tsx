import React from 'react';
import { ScheduleItem } from './ScheduleItem';
import type { ScheduleItem as ScheduleItemType } from '../data/timetable';

interface DayCardProps {
  day: string;
  items: ScheduleItemType[];
}

export const DayCard: React.FC<DayCardProps> = ({ day, items }) => {
  return (
    <div className="w-full flex flex-col space-y-6">
      {/* Day Header */}
      <div className="bg-gradient-to-r from-red-500 to-red-600 rounded-xl shadow-md p-5 sm:p-6 text-center text-white">
        <h3 className="font-bold text-xl sm:text-2xl">{day}</h3>
        <p className="text-red-100 text-xs sm:text-sm mt-2">
          {items.length} {items.length === 1 ? 'class' : 'classes'} scheduled
        </p>
      </div>

      {/* Classes List */}
      <div className="space-y-3">
        {items.length > 0 ? (
          items.map((item, index) => (
            <ScheduleItem key={index} item={item} />
          ))
        ) : (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📭</div>
            <p className="text-gray-500 font-medium">No classes scheduled</p>
            <p className="text-gray-400 text-sm mt-1">Enjoy your free day!</p>
          </div>
        )}
      </div>
    </div>
  );
};

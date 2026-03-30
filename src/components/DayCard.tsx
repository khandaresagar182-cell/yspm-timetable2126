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
      {/* Day Header */}
      <div className="bg-gradient-to-r from-blue-900 to-blue-800 rounded-xl shadow-md p-5 sm:p-6 text-center text-white border-b-4 border-amber-500">
        <h3 className="font-bold text-xl sm:text-2xl">{day}</h3>
        <p className="text-blue-100 text-xs sm:text-sm mt-2">
          {items.length} {items.length === 1 ? 'class' : 'classes'} scheduled
        </p>
      </div>

      {/* Classes List */}
      <div className="space-y-3">
        {items.length > 0 ? (
          items.map((item, index) => (
            <React.Fragment key={index}>
              <ScheduleItem item={item} />

              {/* Lunch Break after 12:00 */}
              {item.time.endsWith('12:00') && (
                <div className="w-full bg-blue-50 border border-blue-200 rounded-lg py-2 px-4 text-center text-blue-800 text-sm font-medium shadow-sm">
                  🍱 Long Recess (40 Min)
                </div>
              )}

              {/* Short Recess after 2:40 */}
              {item.time.endsWith('2:40') && (
                <div className="w-full bg-amber-50 border border-amber-200 rounded-lg py-2 px-4 text-center text-amber-800 text-sm font-medium shadow-sm">
                  🍪 Short Recess (10 Min)
                </div>
              )}
            </React.Fragment>
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

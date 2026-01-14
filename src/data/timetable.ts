export type ScheduleItem = {
  subject: string;
  type: 'Lab' | 'Class';
  time: string;
};

export type BatchSchedule = {
  [day: string]: ScheduleItem[];
};

export const timetableData: Record<string, BatchSchedule> = {
  'S1': {
    'Monday': [
      { subject: 'JPR', type: 'Lab', time: '10:00-12:00' },
      { subject: 'DCN', type: 'Lab', time: '12:40-2:40' },
      { subject: 'MML', type: 'Class', time: '2:50-3:50' },
      { subject: 'MML', type: 'Class', time: '3:50-4:50' }
    ],
    'Tuesday': [
      { subject: 'JPR', type: 'Lab', time: '10:00-12:00' },
      { subject: 'DCN', type: 'Class', time: '12:40-2:40' },
      { subject: 'JPR', type: 'Class', time: '2:50-3:50' },
      { subject: 'UID', type: 'Lab', time: '3:50-4:50' }
    ],
    'Wednesday': [
      { subject: 'MML', type: 'Lab', time: '10:00-12:00' },
      { subject: 'MIC', type: 'Lab', time: '12:40-2:40' },
      { subject: 'UID', type: 'Class', time: '2:50-3:50' },
      { subject: 'MML', type: 'Class', time: '3:50-4:50' }
    ],
    'Thursday': [
      { subject: 'DCN', type: 'Lab', time: '10:00-12:00' },
      { subject: 'MIC', type: 'Class', time: '12:40-1:40' },
      { subject: 'EVS', type: 'Class', time: '1:40-2:40' },
      { subject: 'JPR', type: 'Class', time: '3:50-4:50' },
      { subject: 'DCN', type: 'Class', time: '3:50-4:50' }
    ],
    'Friday': [
      { subject: 'UID', type: 'Lab', time: '10:00-12:00' },
      { subject: 'JPR', type: 'Class', time: '12:40-1:40' },
      { subject: 'DCN', type: 'Class', time: '1:40-2:40' },
      { subject: 'MML', type: 'Class', time: '2:50-4:50' }
    ],
    'Saturday': [
      { subject: 'MIC', type: 'Class', time: '10:00-12:00' },
      { subject: 'JPR', type: 'Class', time: '12:40-1:40' },
      { subject: 'JPR', type: 'Class', time: '1:40-2:40' },
      { subject: 'EVS', type: 'Class', time: '2:50-4:50' }
    ]
  },
  'S2': {
    'Monday': [
      { subject: 'DCN', type: 'Lab', time: '10:00-12:00' },
      { subject: 'JPR', type: 'Lab', time: '12:40-2:40' },
      { subject: 'MML', type: 'Class', time: '2:50-3:50' },
      { subject: 'MML', type: 'Class', time: '3:50-4:50' }
    ],
    'Tuesday': [
      { subject: 'UID', type: 'Lab', time: '10:00-12:00' },
      { subject: 'DCN', type: 'Class', time: '12:40-2:40' },
      { subject: 'JPR', type: 'Class', time: '2:50-3:50' },
      { subject: 'MML', type: 'Lab', time: '3:50-4:50' }
    ],
    'Wednesday': [
      { subject: 'DCN', type: 'Lab', time: '10:00-12:00' },
      { subject: 'JPR', type: 'Lab', time: '12:40-2:40' },
      { subject: 'UID', type: 'Class', time: '2:50-3:50' },
      { subject: 'MML', type: 'Class', time: '3:50-4:50' }
    ],
    'Thursday': [
      { subject: 'UID', type: 'Lab', time: '10:00-12:00' },
      { subject: 'MIC', type: 'Class', time: '12:40-1:40' },
      { subject: 'EVS', type: 'Class', time: '1:40-2:40' },
      { subject: 'DCN', type: 'Class', time: '3:50-4:50' }
    ],
    'Friday': [
      { subject: 'MIC', type: 'Lab', time: '10:00-12:00' },
      { subject: 'JPR', type: 'Class', time: '12:40-1:40' },
      { subject: 'DCN', type: 'Class', time: '1:40-2:40' },
      { subject: 'MML', type: 'Class', time: '2:50-4:50' }
    ],
    'Saturday': [
      { subject: 'MIC', type: 'Class', time: '10:00-12:00' },
      { subject: 'JPR', type: 'Class', time: '12:40-1:40' },
      { subject: 'JPR', type: 'Class', time: '1:40-2:40' },
      { subject: 'EVS', type: 'Class', time: '2:50-4:50' }
    ]
  },
  'S3': {
    'Monday': [
      { subject: 'MML', type: 'Lab', time: '10:00-12:00' },
      { subject: 'UID', type: 'Lab', time: '12:40-2:40' },
      { subject: 'MML', type: 'Class', time: '2:50-3:50' },
      { subject: 'MML', type: 'Class', time: '3:50-4:50' }
    ],
    'Tuesday': [
      { subject: 'MIC', type: 'Lab', time: '10:00-12:00' },
      { subject: 'DCN', type: 'Class', time: '12:40-2:40' },
      { subject: 'JPR', type: 'Class', time: '2:50-3:50' },
      { subject: 'DCN', type: 'Lab', time: '3:50-4:50' }
    ],
    'Wednesday': [
      { subject: 'UID', type: 'Lab', time: '10:00-12:00' },
      { subject: 'DCN', type: 'Lab', time: '12:40-2:40' },
      { subject: 'UID', type: 'Class', time: '2:50-3:50' },
      { subject: 'MML', type: 'Class', time: '3:50-4:50' }
    ],
    'Thursday': [
      { subject: 'JPR', type: 'Lab', time: '10:00-12:00' },
      { subject: 'MIC', type: 'Class', time: '12:40-1:40' },
      { subject: 'EVS', type: 'Class', time: '1:40-2:40' },
      { subject: 'DCN', type: 'Class', time: '3:50-4:50' }
    ],
    'Friday': [
      { subject: 'JPR', type: 'Lab', time: '10:00-12:00' },
      { subject: 'JPR', type: 'Class', time: '12:40-1:40' },
      { subject: 'DCN', type: 'Class', time: '1:40-2:40' },
      { subject: 'MML', type: 'Class', time: '2:50-4:50' }
    ],
    'Saturday': [
      { subject: 'MIC', type: 'Class', time: '10:00-12:00' },
      { subject: 'JPR', type: 'Class', time: '12:40-1:40' },
      { subject: 'JPR', type: 'Class', time: '1:40-2:40' },
      { subject: 'EVS', type: 'Class', time: '2:50-4:50' }
    ]
  }
};


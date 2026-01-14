# YOUWARE.md

# Class Time Table Website - YSPM

This is a responsive website for displaying class timetables for the Department of Artificial Intelligence & Machine Learning at YSPM.

## Project Overview

- **Framework**: React 18 + TypeScript + Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Routing**: React Router DOM

## Architecture

### Directory Structure
- `src/data/timetable.ts`: Contains the hardcoded timetable data for batches S1, S2, and S3.
- `src/components/`: Reusable UI components.
  - `Layout.tsx`: Common layout with Header and Footer.
  - `DayCard.tsx`: Displays the schedule for a specific day.
  - `ScheduleItem.tsx`: Displays a single class/lab entry.
- `src/pages/`: Application screens.
  - `BatchSelect.tsx`: Landing page to select the student batch.
  - `Timetable.tsx`: Handles both the Day Selection menu and the Single Day schedule view.
- `public/`: Static assets.
  - `logo.jpg`: Website logo.

### Key Features
- **Responsive Design**: Works on desktop and mobile devices.
- **Navigation Flow**: Landing Page -> Day Select -> Single Day View.
- **Clean UI**: Professional website layout with header and footer.
- **Real Assets**: Uses the official YSPM logo.

## Development

### Commands
- **Install Dependencies**: `npm install`
- **Start Dev Server**: `npm run dev`
- **Build for Production**: `npm run build`
- **Preview Build**: `npm run preview`

### Adding Data
To update the timetable, modify `src/data/timetable.ts`. The data structure is organized by Batch -> Day -> Schedule Items.

```typescript
export const timetableData = {
  'S1': {
    'Monday': [
      { subject: 'Subject Name', type: 'Lab' | 'Class', time: '10:00-12:00' },
      ...
    ],
    ...
  },
  ...
};
```

## Deployment
The project is built using Vite and outputs to the `dist/` directory. It is a Single Page Application (SPA).
- Ensure the web server serves `index.html` for all routes.

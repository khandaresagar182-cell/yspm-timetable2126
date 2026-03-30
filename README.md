
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
- **Install Dependencies (Frontend)**: `npm install`
- **Install Dependencies (Backend)**: `cd server && npm install`
- **Start Full App (Frontend + Backend)**: Run `start_app.bat` (Windows)
- **Start Dev Server (Frontend Only)**: `npm run dev`
- **Start Dev Server (Backend Only)**: `cd server && npm run dev`
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

## Deployment Guide

### Database (MySQL)
**Important**: You cannot simply upload a "db file".
1.  **Export Local DB**: Open your local database tool (e.g., phpMyAdmin) and **Export** the `yspm_timetable` database to a `.sql` file.
2.  **Import on Server**: Log in to your hosting provider's database manager and **Import** that `.sql` file.
3.  **Automatic Setup**: If deploying to a fresh database, the application will automatically create the necessary tables (`users`, `practical_resources`) when it first runs.

### Environment Variables
On your production server, create a `.env` file in the `server/` directory with specific values for that environment:
```ini
PORT=3000
DB_HOST=your_production_db_host
DB_USER=your_production_db_user
DB_PASSWORD=your_production_db_password
DB_NAME=yspm_timetable
```

### Security Updates
- **Password Hashing**: Passwords are now securely hashed using `bcrypt`.
- **Default Login**: If the `users` table is empty, a default admin will be created:
  - **Email**: `admin@yspm.com`
  - **Password**: `admin123`
- **Action Required**: Change this password immediately after first login.


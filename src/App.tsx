import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SplashScreen } from './pages/SplashScreen';
import { DepartmentSelect } from './pages/DepartmentSelect';
import { BatchSelect } from './pages/BatchSelect';
import { Timetable } from './pages/Timetable';
import AdminDashboard from './pages/AdminDashboard'; // Import default export
import { TestPapers } from './pages/TestPapers';
import ErrorBoundary from './components/ErrorBoundary';

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <Routes>
          <Route path="/" element={<SplashScreen />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/select-department" element={<DepartmentSelect />} />
          <Route path="/select-batch/:department" element={<BatchSelect />} />
          <Route path="/timetable/:department/:batch" element={<Timetable />} />
          <Route path="/timetable/:department/:batch/:day" element={<Timetable />} />
          <Route path="/resources/:department/:batch/:type" element={<TestPapers />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ErrorBoundary>
  );
}

export default App;

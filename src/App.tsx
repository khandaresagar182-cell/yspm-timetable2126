import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { SplashScreen } from './pages/SplashScreen';
import { BatchSelect } from './pages/BatchSelect';
import { Timetable } from './pages/Timetable';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<SplashScreen />} />
        <Route path="/select-batch" element={<BatchSelect />} />
        <Route path="/timetable/:batch" element={<Timetable />} />
        <Route path="/timetable/:batch/:day" element={<Timetable />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;

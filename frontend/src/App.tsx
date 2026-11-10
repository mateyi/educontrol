import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { ThemeProvider } from './contexts/ThemeContext';
import { AppLayout } from './components/layout/AppLayout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Students } from './pages/Students';
import { Teachers } from './pages/Teachers';
import { Courses } from './pages/Courses';
import { Subjects } from './pages/Subjects';
import { Grades } from './pages/Grades';
import { Attendance } from './pages/Attendance';
import { Schedule } from './pages/Schedule';
import { Assignments } from './pages/Assignments';
import { Announcements } from './pages/Announcements';
import { AdminSettings } from './pages/AdminSettings';

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  if (user?.role !== 'ADMINISTRADOR') {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/" element={<AppLayout />}>
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="students" element={<Students />} />
              <Route path="teachers" element={<Teachers />} />
              <Route path="courses" element={<Courses />} />
              <Route path="subjects" element={<Subjects />} />
              <Route path="grades" element={<Grades />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="schedules" element={<Schedule />} />
              <Route path="assignments" element={<Assignments />} />
              <Route path="announcements" element={<Announcements />} />
              <Route
                path="admin"
                element={
                  <AdminRoute>
                    <AdminSettings />
                  </AdminRoute>
                }
              />
            </Route>

            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;

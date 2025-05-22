import { ThemeProvider } from '@/components/theme-provider';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/contexts/auth-context';
import { ProtectedRoute } from '@/components/protected-route';
import LoginPage from '@/pages/login';
import DashboardPage from '@/pages/dashboard';
import EventHistoryPage from '@/pages/event-history';
import WorkerProfilePage from "@/pages/workers/profile";
import WorkersPage from "@/pages/workers";
import WorkerDetailsPage from "@/pages/workers/[id]";

function App() {
  return (
    <ThemeProvider defaultTheme="light">
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <DashboardPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/events" 
              element={
                <ProtectedRoute>
                  <EventHistoryPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/worker/:id" 
              element={
                <ProtectedRoute>
                  <WorkerProfilePage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/workers" 
              element={
                <ProtectedRoute>
                  <WorkersPage />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/workers/:id" 
              element={
                <ProtectedRoute>
                  <WorkerDetailsPage />
                </ProtectedRoute>
              } 
            />
            <Route path="/" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </Router>
        <Toaster />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
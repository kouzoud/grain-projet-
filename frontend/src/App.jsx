import React, { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import { useNotifications } from './hooks/useNotifications';

// Eager load critical pages
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';

// Lazy load secondary pages
const Dashboard = lazy(() => import('./pages/citizen/Dashboard'));
const DeclarationForm = lazy(() => import('./pages/citizen/DeclarationForm'));
const VolunteerMap = lazy(() => import('./pages/volunteer/VolunteerMap'));
const VolunteerDashboard = lazy(() => import('./pages/volunteer/VolunteerDashboard'));
const MyInterventions = lazy(() => import('./pages/volunteer/MyInterventions'));
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminCases = lazy(() => import('./pages/admin/AdminCases'));
const UserManagement = lazy(() => import('./pages/admin/UserManagement'));
const IdentityVerification = lazy(() => import('./pages/admin/IdentityVerification'));
const AdminMap = lazy(() => import('./pages/admin/AdminMap'));
const Profile = lazy(() => import('./pages/common/Profile'));

// Loading fallback component with enhanced skeleton
const PageLoader = () => (
  <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-slate-950 dark:to-slate-900">
    <div className="flex flex-col items-center gap-6">
      <div className="relative">
        <div className="animate-spin rounded-full h-16 w-16 border-4 border-gray-200 dark:border-gray-800"></div>
        <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-cyan-500 absolute top-0 left-0"></div>
      </div>
      <div className="text-center space-y-2">
        <p className="text-lg font-medium text-gray-700 dark:text-gray-300 animate-pulse">
          Chargement...
        </p>
        <div className="flex gap-1 justify-center">
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
          <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
        </div>
      </div>
    </div>
  </div>
);

// Wrapper component to enable notifications for authenticated users
const AppContent = () => {
  const token = localStorage.getItem('token');
  // Enable notifications only when user is authenticated
  useNotifications(!!token);

  return (
    <Suspense fallback={<PageLoader />}>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Protected Routes */}
        <Route element={<Layout />}>
          <Route path="/profile" element={<Profile />} />

          {/* Citizen Routes */}
          <Route element={<ProtectedRoute allowedRoles={['CITOYEN']} />}>
            <Route path="/citizen/dashboard" element={<Dashboard />} />
            <Route path="/citizen/declare" element={<DeclarationForm />} />
            <Route path="/citizen/edit/:id" element={<DeclarationForm />} />
          </Route>

          {/* Volunteer Routes */}
          <Route element={<ProtectedRoute allowedRoles={['BENEVOLE']} />}>
            <Route path="/volunteer/dashboard" element={<VolunteerDashboard />} />
            <Route path="/volunteer/map" element={<VolunteerMap />} />
            <Route path="/volunteer/missions" element={<MyInterventions />} />
          </Route>

          {/* Admin Routes */}
          <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
            <Route path="/admin/dashboard" element={<AdminDashboard />} />
            <Route path="/admin/cases" element={<AdminCases />} />
            <Route path="/admin/users" element={<UserManagement />} />
            <Route path="/admin/verification" element={<IdentityVerification />} />
            <Route path="/admin/map" element={<AdminMap />} />
          </Route>
        </Route>
      </Routes>
    </Suspense>
  );
};

function App() {
  return (
    <ThemeProvider>
      <Router>
        <AppContent />
      </Router>
    </ThemeProvider>
  );
}

export default App;

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/auth/Login';
import Register from './pages/auth/Register';
import Dashboard from './pages/citizen/Dashboard';
import DeclarationForm from './pages/citizen/DeclarationForm';
import VolunteerMap from './pages/volunteer/VolunteerMap';
import VolunteerDashboard from './pages/volunteer/VolunteerDashboard';
import MyInterventions from './pages/volunteer/MyInterventions';
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminCases from './pages/admin/AdminCases';
import UserManagement from './pages/admin/UserManagement';
import IdentityVerification from './pages/admin/IdentityVerification';
import AdminMap from './pages/admin/AdminMap';
import Profile from './pages/common/Profile';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';

function App() {
  return (
    <ThemeProvider>
      <Router>
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
      </Router>
    </ThemeProvider>
  );
}

export default App;

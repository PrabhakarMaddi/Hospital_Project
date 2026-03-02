import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './hooks/useAuth';
import { ThemeProvider } from './context/ThemeContext';
import Login from './pages/Login';
import DashboardLayout from './components/DashboardLayout';
import PatientRegistration from './pages/receptionist/PatientRegistration';
import TokenGeneration from './pages/receptionist/TokenGeneration';
import DoctorQueue from './pages/doctor/DoctorQueue';
import LiveQueue from './pages/public/LiveQueue';

// ProtectedRoute MUST be inside AuthProvider to access context
const ProtectedRoute = ({ children, role }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-[#0f172a] flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!user) return <Navigate to="/login" replace />;

    if (role && user.role !== role) {
        return <Navigate to={`/${user.role}`} replace />;
    }

    return children;
};

function AppRoutes() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route
                path="/admin"
                element={
                    <ProtectedRoute role="admin">
                        <DashboardLayout role="admin" />
                    </ProtectedRoute>
                }
            >
                <Route index element={<div className="text-2xl font-bold text-white">Admin Dashboard Overview</div>} />
                <Route path="departments" element={<div className="text-white">Departments Management</div>} />
                <Route path="staff" element={<div className="text-white">Staff Management</div>} />
            </Route>

            <Route
                path="/doctor"
                element={
                    <ProtectedRoute role="doctor">
                        <DashboardLayout role="doctor" />
                    </ProtectedRoute>
                }
            >
                <Route index element={<div className="text-2xl font-bold text-slate-800 dark:text-white">Doctor Dashboard Overview</div>} />
                <Route path="queue" element={<DoctorQueue />} />
            </Route>

            <Route
                path="/receptionist"
                element={
                    <ProtectedRoute role="receptionist">
                        <DashboardLayout role="receptionist" />
                    </ProtectedRoute>
                }
            >
                <Route index element={<div className="text-2xl font-bold text-slate-800 dark:text-white">Receptionist Dashboard Overview</div>} />
                <Route path="registration" element={<PatientRegistration />} />
                <Route path="queue" element={<TokenGeneration />} />
            </Route>

            <Route path="/live-queue" element={<LiveQueue />} />

            <Route path="/" element={<Navigate to="/login" replace />} />
            <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <ThemeProvider>
            <Router>
                <AuthProvider>
                    <AppRoutes />
                </AuthProvider>
            </Router>
        </ThemeProvider>
    );
}

export default App;

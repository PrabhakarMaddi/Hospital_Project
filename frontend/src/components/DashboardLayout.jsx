import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useTheme } from '../context/ThemeContext';
import {
    LayoutDashboard,
    Users,
    BedDouble,
    Activity,
    LogOut,
    Bell,
    Search,
    ShieldCheck,
    Stethoscope,
    ClipboardList,
    Menu,
    X,
    Sun,
    Moon,
} from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, label, active, onClick }) => (
    <Link
        to={to}
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-sm ${active
                ? 'bg-blue-50 dark:bg-blue-600/10 text-blue-600 dark:text-blue-400 font-medium border border-blue-200 dark:border-blue-500/20'
                : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
    >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span>{label}</span>
    </Link>
);

const DashboardLayout = ({ role }) => {
    const { user, logout } = useAuth();
    const { isDark, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const location = useLocation();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const closeSidebar = () => setSidebarOpen(false);

    const getSidebarLinks = () => {
        const common = [{ to: `/${role}`, icon: LayoutDashboard, label: 'Overview' }];
        if (role === 'admin') return [
            ...common,
            { to: '/admin/departments', icon: Activity, label: 'Departments' },
            { to: '/admin/staff', icon: ShieldCheck, label: 'Staff Management' },
            { to: '/admin/wards', icon: BedDouble, label: 'Ward Management' },
            { to: '/admin/reports', icon: ClipboardList, label: 'Reports' },
        ];
        if (role === 'doctor') return [
            ...common,
            { to: '/doctor/queue', icon: Users, label: 'My Queue' },
            { to: '/doctor/patients', icon: Stethoscope, label: 'Patients' },
        ];
        if (role === 'receptionist') return [
            ...common,
            { to: '/receptionist/registration', icon: Users, label: 'Registration' },
            { to: '/receptionist/queue', icon: ClipboardList, label: 'Queue Mgmt' },
            { to: '/receptionist/beds', icon: BedDouble, label: 'Bed Booking' },
        ];
        return common;
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full p-5">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-8 px-2">
                <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Activity className="text-white w-5 h-5" />
                </div>
                <span className="text-lg font-bold tracking-tight text-slate-800 dark:text-white">SHFMS</span>
            </div>

            {/* Role badge */}
            <div className="mb-4 px-2">
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold">
                    {role} Portal
                </span>
            </div>

            {/* Nav Links */}
            <nav className="flex-1 space-y-1">
                {getSidebarLinks().map((link) => (
                    <SidebarLink
                        key={link.to}
                        {...link}
                        active={location.pathname === link.to}
                        onClick={closeSidebar}
                    />
                ))}
            </nav>

            {/* User + Logout */}
            <div className="pt-5 border-t border-slate-200 dark:border-white/5 space-y-2">
                <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-slate-50 dark:bg-white/5">
                    <div className="w-8 h-8 bg-blue-100 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-blue-600 dark:text-slate-300 text-sm flex-shrink-0">
                        {user?.name?.charAt(0)?.toUpperCase()}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium text-slate-800 dark:text-slate-200 leading-none truncate">{user?.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5 capitalize">{role}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all w-full text-sm"
                >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-800 dark:text-slate-200 flex transition-colors duration-300">
            {/* ─── Desktop Sidebar ────────────────────────── */}
            <aside className="hidden lg:flex w-60 xl:w-64 border-r border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/50 flex-col sticky top-0 h-screen flex-shrink-0 shadow-sm">
                <SidebarContent />
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden" onClick={closeSidebar} />
            )}

            {/* Mobile sidebar drawer */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-white/5 flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                <button className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200" onClick={closeSidebar}>
                    <X className="w-5 h-5" />
                </button>
                <SidebarContent />
            </aside>

            {/* ─── Main Content ───────────────────────────── */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 border-b border-slate-200 dark:border-white/5 bg-white dark:bg-slate-900/50 backdrop-blur-md flex items-center justify-between px-4 md:px-6 sticky top-0 z-20 gap-4 shadow-sm dark:shadow-none">
                    {/* Hamburger */}
                    <button
                        className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="w-5 h-5" />
                    </button>

                    {/* Search */}
                    <div className="flex items-center gap-3 bg-slate-100 dark:bg-white/5 px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 flex-1 max-w-sm">
                        <Search className="w-4 h-4 text-slate-400 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Search patients, doctors..."
                            className="bg-transparent outline-none w-full text-sm text-slate-700 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600"
                        />
                    </div>

                    {/* Right actions */}
                    <div className="flex items-center gap-2 md:gap-3 flex-shrink-0">
                        {/* Theme toggle */}
                        <button
                            onClick={toggleTheme}
                            className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all"
                            title="Toggle theme"
                        >
                            {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
                        </button>

                        {/* Notification */}
                        <button className="relative p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-all">
                            <Bell className="w-5 h-5" />
                            <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-blue-600 rounded-full"></span>
                        </button>

                        {/* Avatar */}
                        <div className="flex items-center gap-2 pl-3 border-l border-slate-200 dark:border-white/10">
                            <div className="hidden sm:block text-right">
                                <p className="text-xs font-semibold text-slate-700 dark:text-slate-200 leading-none">{user?.name}</p>
                                <p className="text-[11px] text-slate-400 mt-0.5 capitalize">{role}</p>
                            </div>
                            <div className="w-8 h-8 bg-blue-100 dark:bg-slate-700 rounded-full flex items-center justify-center font-bold text-blue-600 dark:text-slate-300 text-sm">
                                {user?.name?.charAt(0)?.toUpperCase()}
                            </div>
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <div className="p-4 md:p-6 lg:p-8 flex-1">
                    <Outlet />
                </div>
            </main>
        </div>
    );
};

export default DashboardLayout;

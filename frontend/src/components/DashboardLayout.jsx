import React, { useState } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
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
} from 'lucide-react';

const SidebarLink = ({ to, icon: Icon, label, active, onClick }) => (
    <Link
        to={to}
        onClick={onClick}
        className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${active
                ? 'bg-blue-600/10 text-blue-500 font-medium border border-blue-500/20'
                : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'
            }`}
    >
        <Icon className="w-5 h-5 flex-shrink-0" />
        <span className="text-sm">{label}</span>
    </Link>
);

const DashboardLayout = ({ role }) => {
    const { user, logout } = useAuth();
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

        if (role === 'admin') {
            return [
                ...common,
                { to: '/admin/departments', icon: Activity, label: 'Departments' },
                { to: '/admin/staff', icon: ShieldCheck, label: 'Staff Management' },
                { to: '/admin/wards', icon: BedDouble, label: 'Ward Management' },
                { to: '/admin/reports', icon: ClipboardList, label: 'Reports' },
            ];
        }
        if (role === 'doctor') {
            return [
                ...common,
                { to: '/doctor/queue', icon: Users, label: 'My Queue' },
                { to: '/doctor/patients', icon: Stethoscope, label: 'Patients' },
            ];
        }
        if (role === 'receptionist') {
            return [
                ...common,
                { to: '/receptionist/registration', icon: Users, label: 'Registration' },
                { to: '/receptionist/queue', icon: ClipboardList, label: 'Queue Mgmt' },
                { to: '/receptionist/beds', icon: BedDouble, label: 'Bed Booking' },
            ];
        }
        return common;
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full p-6">
            {/* Logo */}
            <div className="flex items-center gap-3 mb-10 px-2">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center flex-shrink-0">
                    <Activity className="text-white w-6 h-6" />
                </div>
                <span className="text-xl font-bold tracking-tight">SHFMS</span>
            </div>

            {/* Role badge */}
            <div className="mb-6 px-2">
                <span className="text-xs uppercase tracking-widest text-slate-500 font-semibold">
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

            {/* User Info + Sign Out */}
            <div className="pt-6 border-t border-white/5 space-y-3">
                <div className="flex items-center gap-3 px-4 py-2">
                    <div className="w-9 h-9 bg-gradient-to-tr from-slate-700 to-slate-600 rounded-full border border-white/10 flex items-center justify-center font-bold text-slate-300 text-sm flex-shrink-0">
                        {user?.name?.charAt(0)}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-medium leading-none truncate">{user?.name}</p>
                        <p className="text-xs text-slate-500 mt-1 capitalize">{role}</p>
                    </div>
                </div>
                <button
                    onClick={handleLogout}
                    className="flex items-center gap-3 px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 transition-all w-full"
                >
                    <LogOut className="w-5 h-5" />
                    <span className="text-sm">Sign Out</span>
                </button>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 flex">
            {/* ─── Desktop Sidebar ────────────────────────────────────── */}
            <aside className="hidden lg:flex w-64 xl:w-72 border-r border-white/5 bg-slate-900/50 backdrop-blur-xl flex-col sticky top-0 h-screen flex-shrink-0">
                <SidebarContent />
            </aside>

            {/* ─── Mobile Sidebar Overlay ─────────────────────────────── */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* ─── Mobile Sidebar Drawer ──────────────────────────────── */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-72 border-r border-white/5 bg-slate-900 flex flex-col transition-transform duration-300 ease-in-out lg:hidden ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Close button inside drawer */}
                <button
                    className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white"
                    onClick={closeSidebar}
                >
                    <X className="w-5 h-5" />
                </button>
                <SidebarContent />
            </aside>

            {/* ─── Main Content ────────────────────────────────────────── */}
            <main className="flex-1 flex flex-col min-w-0">
                {/* Header */}
                <header className="h-16 md:h-20 border-b border-white/5 bg-slate-900/30 backdrop-blur-md flex items-center justify-between px-4 md:px-8 sticky top-0 z-20 gap-4">
                    {/* Hamburger (mobile only) */}
                    <button
                        className="lg:hidden p-2 rounded-xl text-slate-400 hover:bg-white/5 hover:text-slate-200 transition-all flex-shrink-0"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu className="w-6 h-6" />
                    </button>

                    {/* Search */}
                    <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-xl border border-white/10 flex-1 max-w-sm md:max-w-md">
                        <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Search patients, doctors..."
                            className="bg-transparent outline-none w-full text-sm placeholder:text-slate-600"
                        />
                    </div>

                    {/* Right side */}
                    <div className="flex items-center gap-3 md:gap-6 flex-shrink-0">
                        <button className="relative p-2 text-slate-400 hover:text-slate-200 transition-colors">
                            <Bell className="w-5 h-5 md:w-6 md:h-6" />
                            <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-[#0f172a]"></span>
                        </button>

                        {/* User avatar (desktop shows name too) */}
                        <div className="flex items-center gap-3 pl-3 md:pl-6 border-l border-white/10">
                            <div className="hidden md:block text-right">
                                <p className="text-sm font-medium leading-none">{user?.name}</p>
                                <p className="text-xs text-slate-500 mt-1 capitalize">{role}</p>
                            </div>
                            <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-tr from-slate-700 to-slate-600 rounded-full border border-white/10 flex items-center justify-center font-bold text-slate-300 text-sm">
                                {user?.name?.charAt(0)}
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

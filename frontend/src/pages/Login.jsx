import React, { useState } from 'react';
import { useAuth } from '../hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Building2, Lock, Mail, Loader2, Activity } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            const user = await login(email, password);
            if (user.role === 'admin') navigate('/admin');
            else if (user.role === 'doctor') navigate('/doctor');
            else if (user.role === 'receptionist') navigate('/receptionist');
            else navigate('/');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-slate-200 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background gradient blobs */}
            <div className="absolute top-[-20%] left-[-10%] w-[60%] sm:w-[40%] h-[60%] sm:h-[40%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse pointer-events-none" />
            <div className="absolute bottom-[-20%] right-[-10%] w-[60%] sm:w-[40%] h-[60%] sm:h-[40%] bg-emerald-600/20 rounded-full blur-[120px] animate-pulse pointer-events-none" />

            <div className="w-full max-w-sm sm:max-w-md z-10">
                <div className="backdrop-blur-xl bg-white/5 border border-white/10 rounded-2xl sm:rounded-3xl p-6 sm:p-8 shadow-2xl">
                    {/* Logo & Title */}
                    <div className="flex flex-col items-center mb-8">
                        <div className="w-14 h-14 sm:w-16 sm:h-16 bg-gradient-to-tr from-blue-600 to-emerald-500 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/20">
                            <Building2 className="text-white w-8 h-8 sm:w-10 sm:h-10" />
                        </div>
                        <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent text-center">
                            SHFMS Login
                        </h1>
                        <p className="text-slate-400 mt-2 text-sm text-center">Enter credentials to access your dashboard</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">
                        {error && (
                            <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm text-center">
                                {error}
                            </div>
                        )}

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-300 ml-1">Email Address</label>
                            <div className="relative group">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-600 text-sm"
                                    placeholder="name@hospital.com"
                                    required
                                />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="text-sm font-medium text-slate-300 ml-1">Password</label>
                            <div className="relative group">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-3 pl-11 pr-4 outline-none focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 transition-all placeholder:text-slate-600 text-sm"
                                    placeholder="••••••••"
                                    required
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-60 text-white font-semibold py-3.5 rounded-xl shadow-lg shadow-blue-600/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 text-sm"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Sign In to Dashboard'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/5 text-center">
                        <p className="text-slate-500 text-xs sm:text-sm">
                            Forgot password?{' '}
                            <span className="text-blue-400 hover:underline cursor-pointer">Contact IT Admin</span>
                        </p>
                    </div>
                </div>

                {/* Branding footer */}
                <div className="flex items-center justify-center gap-2 mt-6 text-slate-600 text-xs">
                    <Activity className="w-3.5 h-3.5" />
                    <span>Smart Hospital Flow Management System</span>
                </div>
            </div>
        </div>
    );
};

export default Login;

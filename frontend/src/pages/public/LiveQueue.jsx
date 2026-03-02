import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import socket from '../../services/socket';
import { useTheme } from '../../context/ThemeContext';
import { Monitor, Clock, Play, AlertCircle, Activity, Loader2, Calendar } from 'lucide-react';

const LiveQueue = () => {
    const { isDark } = useTheme();
    const [tokens, setTokens] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ total: 0, waiting: 0, calling: 0, completed: 0 });

    const fetchData = async () => {
        try {
            const [queueRes, statsRes] = await Promise.all([
                api.get('/tokens'),
                api.get('/tokens/stats')
            ]);
            setTokens(queueRes.data);
            setStats(statsRes.data);
        } catch (err) {
            console.error('Failed to fetch data', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
        socket.on('token:updated', fetchData);
        const interval = setInterval(fetchData, 30000);
        return () => {
            socket.off('token:updated');
            clearInterval(interval);
        };
    }, []);

    const callingTokens = tokens.filter(t => t.status === 'Calling');
    const waitingTokens = tokens.filter(t => t.status === 'Waiting');

    if (loading) return (
        <div className={`min-h-screen ${isDark ? 'bg-[#0f172a] text-white' : 'bg-white text-slate-900'} flex items-center justify-center transition-colors duration-300`}>
            <div className="flex flex-col items-center gap-4">
                <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
                <p className="text-sm font-medium animate-pulse text-slate-500">Connecting to Queue Engine...</p>
            </div>
        </div>
    );

    return (
        <div className={`min-h-screen transition-colors duration-500 ${isDark ? 'bg-[#0f172a] text-slate-200' : 'bg-white text-slate-800'} relative overflow-hidden flex flex-col`}>
            {/* Background Blobs for Uniformity with Login Page */}
            <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-100/40 dark:bg-blue-600/5 rounded-full blur-[100px] pointer-events-none" />
            <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-emerald-50/40 dark:bg-emerald-600/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Header - Styled like Dashboard Header */}
            <header className={`sticky top-0 z-40 h-20 border-b border-slate-200 dark:border-white/5 bg-white/80 dark:bg-[#1e293b]/80 backdrop-blur-md flex items-center px-8 transition-all`}>
                <div className="max-w-[1600px] w-full mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                            <Monitor className="text-white w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold tracking-tight text-slate-800 dark:text-white leading-tight">OPD Live Queue</h1>
                            <div className="flex items-center gap-2 mt-0.5">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Real-time Feed Active</span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden md:flex items-center gap-8">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-0.5">Current Date</span>
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                <Calendar className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-bold">{new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}</span>
                            </div>
                        </div>
                        <div className="w-px h-10 bg-slate-200 dark:bg-white/10" />
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold mb-0.5">System Time</span>
                            <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                                <Clock className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-bold tabular-nums">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            <main className="flex-1 max-w-[1600px] w-full mx-auto p-8 lg:p-12 z-10">
                <div className="grid grid-cols-1 xl:grid-cols-12 gap-10">

                    {/* LEFT AREA: MAIN QUEUE LISTS */}
                    <div className="xl:col-span-8 space-y-12">

                        {/* CURRENTLY CALLING */}
                        <section>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg text-emerald-600">
                                    <Activity className="w-5 h-5" />
                                </div>
                                <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white uppercase transition-colors">Consultations In Progress</h2>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                {callingTokens.length > 0 ? callingTokens.map(token => (
                                    <div key={token._id} className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl p-8 sm:p-10 shadow-xl shadow-slate-200/40 dark:shadow-none hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group overflow-hidden relative">
                                        <div className="absolute top-0 right-0 p-6 opacity-5 group-hover:opacity-10 transition-opacity">
                                            <Play className="w-24 h-24 rotate-45" />
                                        </div>
                                        <div className="relative z-10">
                                            <div className="flex justify-between items-start mb-10">
                                                <div className="space-y-1">
                                                    <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-100 dark:border-emerald-500/20">Active Now</span>
                                                    <h3 className="text-2xl font-bold text-slate-800 dark:text-white mt-4">{token.patient.name}</h3>
                                                    <p className="text-sm text-slate-400 font-medium">{token.department}</p>
                                                </div>
                                                {token.priority === 'Emergency' && (
                                                    <span className="bg-red-50 dark:bg-red-500/10 text-red-600 text-[10px] font-black px-3 py-1 rounded-full border border-red-100 dark:border-red-500/20 uppercase animate-pulse">Emergency</span>
                                                )}
                                            </div>
                                            <div className="flex items-end gap-3">
                                                <div className="flex flex-col">
                                                    <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-widest mb-1 leading-none">Token</span>
                                                    <span className="text-7xl font-bold tracking-tighter tabular-nums text-blue-600 leading-none">{token.tokenNumber}</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )) : (
                                    <div className="md:col-span-2 py-24 bg-white/50 dark:bg-white/5 border-2 border-dashed border-slate-200 dark:border-white/5 rounded-3xl flex flex-col items-center justify-center opacity-50 backdrop-blur-sm">
                                        <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-2xl flex items-center justify-center mb-4">
                                            <Clock className="w-8 h-8 text-slate-300 dark:text-slate-700" />
                                        </div>
                                        <p className="text-lg font-bold text-slate-400 uppercase tracking-widest">Waiting for next patient</p>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* UPCOMING WAITLIST */}
                        <section>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-blue-50 dark:bg-blue-500/10 rounded-lg text-blue-600">
                                    <Play className="w-5 h-5 fill-current" />
                                </div>
                                <h2 className="text-lg font-bold tracking-tight text-slate-800 dark:text-white uppercase">Waitlist Sequence</h2>
                            </div>
                            <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-3xl overflow-hidden shadow-lg dark:shadow-none">
                                <div className="grid grid-cols-2 lg:grid-cols-4 divide-x divide-y divide-slate-100 dark:divide-white/5">
                                    {waitingTokens.length > 0 ? waitingTokens.slice(0, 12).map((token, i) => (
                                        <div key={token._id} className={`p-8 hover:bg-slate-50 dark:hover:bg-white/5 transition-all duration-300 relative group`}>
                                            <div className="flex items-center justify-between mb-4">
                                                <span className={`text-[11px] font-bold uppercase tracking-widest opacity-30 ${token.priority === 'Emergency' ? 'text-red-500 opacity-100' : ''}`}>#{i + 1}</span>
                                                {token.priority === 'Emergency' && <AlertCircle className="w-4 h-4 text-red-500" />}
                                            </div>
                                            <div className="flex items-baseline gap-2">
                                                <span className="text-[10px] font-bold text-slate-300 uppercase leading-none">Tk</span>
                                                <span className="text-4xl font-bold tracking-tight tabular-nums text-slate-800 dark:text-white leading-none">{token.tokenNumber}</span>
                                            </div>
                                            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-widest mt-4 truncate">{token.department}</p>
                                        </div>
                                    )) : (
                                        <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-40">
                                            <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Queue represents empty sequence</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* RIGHT AREA: METRICS & STATUS */}
                    <div className="xl:col-span-4 space-y-8">
                        {/* Metrics Card */}
                        <section className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-[2.5rem] p-10 lg:p-12 shadow-2xl shadow-blue-500/5 backdrop-blur-sm">
                            <div className="flex flex-col h-full">
                                <div className="mb-10">
                                    <div className="w-12 h-12 bg-blue-50 dark:bg-blue-500/10 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                                        <Activity className="w-6 h-6" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-2">Queue Dashboard</h3>
                                    <p className="text-sm text-slate-500 dark:text-slate-400 font-medium">Monitoring OPD flow throughput for today's session.</p>
                                </div>

                                <div className="space-y-12">
                                    {/* Stat 1 */}
                                    <div className="group">
                                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Total Served</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-6xl font-bold tracking-tighter tabular-nums text-slate-800 dark:text-white">{stats.completed || 0}</span>
                                            <span className="text-xs font-bold text-emerald-500">Patients</span>
                                        </div>
                                        <div className="w-full h-1 bg-slate-100 dark:bg-white/5 rounded-full mt-4 overflow-hidden">
                                            <div className="h-full bg-blue-600 rounded-full w-[70%] shadow-[0_0_10px_rgba(37,99,235,0.4)]" />
                                        </div>
                                    </div>

                                    {/* Stat 2 */}
                                    <div className="group">
                                        <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-slate-400 mb-2">Currently Waiting</p>
                                        <div className="flex items-baseline gap-2">
                                            <span className="text-6xl font-bold tracking-tighter tabular-nums text-slate-800 dark:text-white">{stats.waiting || 0}</span>
                                            <span className="text-xs font-bold text-blue-500">Waitlist</span>
                                        </div>
                                        <div className="w-full h-1 bg-slate-100 dark:bg-white/5 rounded-full mt-4 overflow-hidden">
                                            <div className="h-full bg-emerald-500 rounded-full w-[45%] shadow-[0_0_10px_rgba(16,185,129,0.4)]" />
                                        </div>
                                    </div>
                                </div>

                                {/* Notice Box */}
                                <div className="mt-16 p-6 rounded-2xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5 flex gap-4">
                                    <div className="mt-1">
                                        <AlertCircle className="w-5 h-5 text-blue-600" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-widest mb-1">Queue Protocol</h4>
                                        <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400 font-medium">
                                            Emergency cases bypass standard waitlist sequence as per hospital flow directives.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* Branding Footer */}
                        <div className="text-center py-6">
                            <div className="flex items-center justify-center gap-2 text-slate-400 dark:text-slate-600 text-xs">
                                <div className="w-px h-3 bg-slate-200 dark:bg-white/10" />
                                <span className="font-bold tracking-[0.2em] uppercase text-[9px]">Hospital Flow Engine</span>
                                <div className="w-px h-3 bg-slate-200 dark:bg-white/10" />
                            </div>
                            <p className="text-[9px] font-medium text-slate-400 mt-2 tracking-widest italic opacity-20">v1.0.4 • Smart-Health Core</p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    );
};

export default LiveQueue;

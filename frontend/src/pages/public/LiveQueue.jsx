import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import socket from '../../services/socket';
import { Monitor, Clock, Play, AlertTriangle, Activity, Loader2, Calendar } from 'lucide-react';

const LiveQueue = () => {
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

        socket.on('token:updated', () => {
            fetchData();
        });

        // Periodically refresh just in case
        const interval = setInterval(fetchData, 30000);

        return () => {
            socket.off('token:updated');
            clearInterval(interval);
        };
    }, []);

    const callingTokens = tokens.filter(t => t.status === 'Calling');
    const waitingTokens = tokens.filter(t => t.status === 'Waiting').slice(0, 8); // Show only top 8 next

    if (loading) return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <Loader2 className="w-12 h-12 animate-spin text-blue-500" />
        </div>
    );

    return (
        <div className="min-h-screen bg-[#020617] text-white p-6 md:p-10 font-sans selection:bg-blue-500/30">
            {/* Header */}
            <header className="max-w-[1600px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12 border-b border-white/5 pb-8">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center shadow-2xl shadow-blue-600/20">
                        <Monitor className="w-9 h-9 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-black tracking-tight text-white uppercase italic">Live OPD Queue</h1>
                        <p className="text-slate-500 font-bold tracking-widest text-xs flex items-center gap-2 mt-1">
                            <Activity className="w-3 h-3 text-emerald-500 animate-pulse" />
                            REAL-TIME SYSTEM STATUS
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-8 bg-white/5 p-4 rounded-3xl border border-white/10 backdrop-blur-xl">
                    <div className="text-right">
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Current Date</p>
                        <p className="text-lg font-black flex items-center gap-2">
                            <Calendar className="w-4 h-4 text-blue-400" />
                            {new Date().toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'short' })}
                        </p>
                    </div>
                    <div className="w-px h-10 bg-white/10"></div>
                    <div>
                        <p className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-1">Current Time</p>
                        <p className="text-lg font-black tabular-nums">
                            {new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                    </div>
                </div>
            </header>

            <main className="max-w-[1600px] mx-auto grid grid-cols-1 xl:grid-cols-4 gap-10">
                {/* Main Queue Column */}
                <div className="xl:col-span-3 space-y-12">
                    {/* Currently Calling Section */}
                    <section>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping"></div>
                            <h2 className="text-xl font-black uppercase tracking-[0.2em] text-emerald-500">Currently Calling</h2>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {callingTokens.length > 0 ? callingTokens.map(token => (
                                <div key={token._id} className="bg-gradient-to-br from-emerald-600/20 to-emerald-900/10 border-2 border-emerald-500/50 rounded-[2.5rem] p-10 flex flex-col justify-between relative overflow-hidden group shadow-2xl shadow-emerald-500/5">
                                    <div className="flex justify-between items-start mb-10">
                                        <div className="bg-emerald-500 text-slate-900 text-xs font-black px-4 py-1.5 rounded-full flex items-center gap-2 uppercase tracking-tighter">
                                            <Play className="w-3 h-3 fill-current" />
                                            Active Token
                                        </div>
                                        {token.priority === 'Emergency' && (
                                            <div className="bg-red-600 text-white text-[10px] font-black px-3 py-1 rounded-full animate-pulse uppercase tracking-widest">
                                                Emergency
                                            </div>
                                        )}
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex items-baseline gap-4">
                                            <span className="text-slate-500 font-bold text-2xl">TOKEN</span>
                                            <h3 className="text-8xl md:text-9xl font-black tracking-tighter text-white tabular-nums">#{token.tokenNumber}</h3>
                                        </div>
                                        <div>
                                            <p className="text-emerald-400 font-bold text-lg">{token.patient.name}</p>
                                            <p className="text-slate-500 font-medium uppercase tracking-widest text-xs mt-1">Department: <span className="text-white">{token.department}</span></p>
                                        </div>
                                    </div>
                                </div>
                            )) : (
                                <div className="md:col-span-2 bg-white/5 border border-dashed border-white/20 rounded-[2.5rem] p-24 flex flex-col items-center justify-center text-center opacity-60">
                                    <Clock className="w-16 h-16 text-slate-600 mb-6" />
                                    <h3 className="text-2xl font-black text-slate-400 uppercase tracking-widest">Waiting for next patient...</h3>
                                </div>
                            )}
                        </div>
                    </section>

                    {/* Next in Line Section */}
                    <section>
                        <div className="flex items-center gap-4 mb-6">
                            <div className="w-2.5 h-2.5 bg-blue-500 rounded-full"></div>
                            <h2 className="text-xl font-black uppercase tracking-[0.2em] text-blue-500">Waitlist</h2>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            {waitingTokens.map(token => (
                                <div key={token._id} className={`p-6 rounded-3xl border ${token.priority === 'Emergency'
                                        ? 'bg-red-900/20 border-red-500/40'
                                        : 'bg-white/5 border-white/10'
                                    }`}>
                                    <p className={`text-[10px] font-black uppercase tracking-widest mb-2 ${token.priority === 'Emergency' ? 'text-red-400' : 'text-slate-500'}`}>Token</p>
                                    <h4 className="text-5xl font-black tabular-nums">#{token.tokenNumber}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-3 truncate">{token.department}</p>
                                </div>
                            ))}
                            {[...Array(Math.max(0, 4 - waitingTokens.length))].map((_, i) => (
                                <div key={i} className="p-6 rounded-3xl border border-dashed border-white/5 opacity-20 flex items-center justify-center">
                                    <span className="text-xs font-black text-slate-700 tracking-[0.3em]">EMPTY SLOT</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                {/* Vertical Sidebar Stats */}
                <div className="space-y-8">
                    <div className="bg-gradient-to-b from-blue-600 to-indigo-700 rounded-[2.5rem] p-10 shadow-3xl shadow-blue-500/10 h-full flex flex-col justify-between">
                        <div>
                            <h3 className="text-2xl font-black uppercase tracking-tighter leading-none mb-10">Queue<br />Dashboard</h3>
                            <div className="space-y-8">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200/50 mb-2 font-mono">Total Served today</p>
                                    <p className="text-6xl font-black tabular-nums">{stats.completed || 0}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-blue-200/50 mb-2 font-mono">Current Waitlist</p>
                                    <p className="text-6xl font-black tabular-nums">{stats.waiting || 0}</p>
                                </div>
                            </div>
                        </div>

                        <div className="mt-20 space-y-4">
                            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 flex items-center gap-4">
                                <AlertTriangle className="w-6 h-6 text-yellow-300" />
                                <div>
                                    <p className="text-[10px] font-bold uppercase tracking-widest text-blue-100">Staff Notice</p>
                                    <p className="text-[11px] font-medium leading-tight">Emergency priority tokens are handled first.</p>
                                </div>
                            </div>
                            <div className="text-center opacity-50 px-2 leading-tight">
                                <p className="text-[10px] font-bold tracking-widest uppercase">SHFMS Smart Hospital Flow Management</p>
                                <p className="text-[9px] mt-1 font-mono">v1.0.4 • Stable Node 5013</p>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LiveQueue;

import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import socket from '../../services/socket';
import { useAuth } from '../../hooks/useAuth';
import { Users, Play, CheckCircle, SkipForward, Clock, AlertCircle, Loader2, User, Phone, Activity } from 'lucide-react';

const DoctorQueue = () => {
    const { user } = useAuth();
    const [queue, setQueue] = useState([]);
    const [loading, setLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState(null);

    const fetchQueue = async () => {
        try {
            // Doctors usually see tokens assigned to their department or them specifically
            // For now, let's fetch all waiting/calling tokens for their department
            const res = await api.get(`/tokens?department=${user.department}`);
            setQueue(res.data);
        } catch (err) {
            console.error('Failed to fetch queue', err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchQueue();

        // Real-time updates
        socket.on('token:updated', (updatedToken) => {
            setQueue(prev => prev.map(t => t._id === updatedToken._id ? updatedToken : t));
            // Also re-fetch to ensure order
            fetchQueue();
        });

        return () => socket.off('token:updated');
    }, [user.department]);

    const handleStatusUpdate = async (tokenId, status) => {
        setActionLoading(tokenId);
        try {
            await api.patch(`/tokens/${tokenId}/status`, { status });
            // Queue will be updated via socket event
        } catch (err) {
            console.error('Status update failed', err);
        } finally {
            setActionLoading(null);
        }
    };

    const callingToken = queue.find(t => t.status === 'Calling');
    const waitingTokens = queue.filter(t => t.status === 'Waiting');

    if (loading) return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        </div>
    );

    return (
        <div className="max-w-6xl mx-auto px-4 sm:px-0">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                        <Users className="text-blue-600 w-8 h-8" />
                        My Patient Queue
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-2">Manage your active patient tokens for today.</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20 px-4 py-2 rounded-xl flex items-center gap-3">
                    <div className="w-2 h-2 bg-blue-600 rounded-full animate-pulse"></div>
                    <span className="text-sm font-semibold text-blue-700 dark:text-blue-400">{user.department}</span>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Active Patient (Calling) */}
                <div className="lg:col-span-2 space-y-6">
                    <section>
                        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 ml-1">Currently Calling</h2>
                        {callingToken ? (
                            <div className="bg-white dark:bg-white/5 border-2 border-blue-500 dark:border-blue-500/40 rounded-3xl p-8 shadow-xl shadow-blue-500/10 relative overflow-hidden group">
                                <div className="absolute top-0 right-0 p-4">
                                    <div className="flex items-center gap-2 bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-tighter">
                                        <Activity className="w-3 h-3 animate-pulse" />
                                        In Progress
                                    </div>
                                </div>

                                <div className="flex flex-col md:flex-row md:items-center gap-8">
                                    <div className="flex-1 space-y-4">
                                        <div>
                                            <p className="text-sm font-bold text-blue-600 dark:text-blue-400 mb-1">Token #{callingToken.tokenNumber}</p>
                                            <h3 className="text-4xl font-extrabold text-slate-900 dark:text-white leading-tight">{callingToken.patient.name}</h3>
                                        </div>
                                        <div className="flex flex-wrap gap-4 text-sm font-medium text-slate-500">
                                            <span className="flex items-center gap-2"><User className="w-4 h-4" />{callingToken.patient.age}y • {callingToken.patient.gender}</span>
                                            <span className="flex items-center gap-2"><Phone className="w-4 h-4" />{callingToken.patient.phone}</span>
                                            <span className="flex items-center gap-2"><Clock className="w-4 h-4" />{new Date(callingToken.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-3 min-w-[200px]">
                                        <button
                                            onClick={() => handleStatusUpdate(callingToken._id, 'Completed')}
                                            disabled={!!actionLoading}
                                            className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-500/20 transition-all flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            <CheckCircle className="w-5 h-5" />
                                            Complete Visit
                                        </button>
                                        <button
                                            onClick={() => handleStatusUpdate(callingToken._id, 'Skipped')}
                                            disabled={!!actionLoading}
                                            className="w-full bg-slate-100 dark:bg-white/5 hover:bg-slate-200 dark:hover:bg-white/10 text-slate-700 dark:text-slate-300 font-bold py-4 rounded-2xl transition-all flex items-center justify-center gap-2 active:scale-95"
                                        >
                                            <SkipForward className="w-5 h-5" />
                                            Skip Patient
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-slate-50 dark:bg-white/[0.02] border border-dashed border-slate-200 dark:border-white/10 rounded-3xl p-12 flex flex-col items-center justify-center text-center">
                                <div className="w-16 h-16 bg-slate-100 dark:bg-white/5 rounded-full flex items-center justify-center mb-4">
                                    <Clock className="w-8 h-8 text-slate-400" />
                                </div>
                                <h3 className="text-lg font-bold text-slate-800 dark:text-white">No Active Patient</h3>
                                <p className="text-sm text-slate-400 mt-2 max-w-[240px]">Call the next patient from the waiting list to start consultation.</p>
                            </div>
                        )}
                    </section>

                    <section>
                        <h2 className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-4 ml-1">Coming Up Next</h2>
                        <div className="space-y-4">
                            {waitingTokens.length > 0 ? waitingTokens.map((token, index) => (
                                <div key={token._id} className={`flex items-center justify-between p-5 rounded-2xl border transition-all ${token.priority === 'Emergency'
                                        ? 'bg-red-50 dark:bg-red-500/10 border-red-200 dark:border-red-500/20 shadow-sm'
                                        : 'bg-white dark:bg-white/5 border-slate-100 dark:border-white/5 hover:border-blue-500/50'
                                    }`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex flex-col items-center justify-center font-bold ${token.priority === 'Emergency'
                                                ? 'bg-red-600 text-white'
                                                : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                                            }`}>
                                            <span className="text-[10px] uppercase leading-none mb-0.5">TK</span>
                                            <span className="text-xl leading-none">{token.tokenNumber}</span>
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-800 dark:text-white flex items-center gap-2">
                                                {token.patient.name}
                                                {token.priority === 'Emergency' && <span className="bg-red-600 text-white text-[10px] px-2 py-0.5 rounded-full animate-pulse uppercase tracking-widest">Urgent</span>}
                                            </h4>
                                            <p className="text-xs text-slate-400 mt-1">{token.patient.age}y • {token.patient.gender} • {new Date(token.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => handleStatusUpdate(token._id, 'Calling')}
                                        disabled={!!actionLoading || !!callingToken}
                                        className="bg-blue-600 hover:bg-blue-700 disabled:opacity-30 disabled:hover:bg-blue-600 text-white p-3 rounded-xl shadow-lg shadow-blue-500/20 transition-all active:scale-95 group"
                                        title={!!callingToken ? "Complete current patient first" : "Call This Patient"}
                                    >
                                        <Play className="w-5 h-5 fill-current transition-transform group-hover:scale-110" />
                                    </button>
                                </div>
                            )) : (
                                <p className="text-center py-8 text-slate-400 text-sm font-medium italic">All caught up! No more patients in queue.</p>
                            )}
                        </div>
                    </section>
                </div>

                {/* Queue Stats Sidebar */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                        <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-6">Queue Summary</h3>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                <div className="flex items-center gap-3">
                                    <Clock className="w-4 h-4 text-blue-600" />
                                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Total Waiting</span>
                                </div>
                                <span className="text-lg font-black text-slate-800 dark:text-white">{waitingTokens.length}</span>
                            </div>
                            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                                <div className="flex items-center gap-3">
                                    <AlertCircle className="w-4 h-4 text-red-600" />
                                    <span className="text-sm font-semibold text-slate-600 dark:text-slate-300">Emergencies</span>
                                </div>
                                <span className="text-lg font-black text-red-600">{waitingTokens.filter(t => t.priority === 'Emergency').length}</span>
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-100 dark:border-white/10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                                <p className="text-xs font-bold uppercase tracking-widest text-slate-400">System Status</p>
                            </div>
                            <p className="text-[11px] leading-relaxed text-slate-500 dark:text-slate-400">
                                Socket Connection: <span className="text-emerald-500 font-bold">Stable</span><br />
                                Real-time updates are active. Any changes from the receptionist will appear instantly.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DoctorQueue;

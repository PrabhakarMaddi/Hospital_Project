import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Search, Ticket, User, UserCheck, ShieldCheck, Stethoscope, ClipboardList, AlertCircle, CheckCircle2, Loader2, ArrowRight } from 'lucide-react';

const TokenGeneration = () => {
    const [searchTerm, setSearchTerm] = useState('');
    const [patients, setPatients] = useState([]);
    const [selectedPatient, setSelectedPatient] = useState(null);
    const [loading, setLoading] = useState(false);
    const [searching, setSearching] = useState(false);
    const [tokenData, setTokenData] = useState({
        department: 'General Medicine',
        doctorId: '',
        priority: 'Normal',
    });
    const [message, setMessage] = useState({ type: '', text: '' });
    const [doctors, setDoctors] = useState([]);

    const departments = [
        'General Medicine', 'Pediatrics', 'Orthopedics', 'Cardiology',
        'Dermatology', 'ENT', 'Ophthalmology', 'Gynecology'
    ];

    useEffect(() => {
        const fetchDoctors = async () => {
            try {
                const res = await api.get('/users?role=doctor');
                setDoctors(res.data);
            } catch (err) {
                console.error('Failed to fetch doctors', err);
            }
        };
        fetchDoctors();
    }, []);

    const searchPatients = async () => {
        if (!searchTerm) return;
        setSearching(true);
        try {
            const res = await api.get(`/patients?search=${searchTerm}`);
            setPatients(res.data);
            if (res.data.length === 0) {
                setMessage({ type: 'error', text: 'No patients found. Please register first.' });
            } else {
                setMessage({ type: '', text: '' });
            }
        } catch (err) {
            setMessage({ type: 'error', text: 'Search failed.' });
        } finally {
            setSearching(false);
        }
    };

    const handleGenerateToken = async () => {
        if (!selectedPatient) return;
        setLoading(true);
        try {
            const res = await api.post('/tokens', {
                patientId: selectedPatient._id,
                ...tokenData
            });
            setMessage({
                type: 'success',
                text: `Token #${res.data.tokenNumber} generated for ${selectedPatient.name}!`
            });
            setSelectedPatient(null);
            setSearchTerm('');
            setPatients([]);
        } catch (err) {
            setMessage({ type: 'error', text: err.response?.data?.message || 'Token generation failed.' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-3">
                    <Ticket className="text-blue-600 w-8 h-8" />
                    Token Generation
                </h1>
                <p className="text-slate-500 dark:text-slate-400 mt-2">Manage OPD queue by generating tokens for registered patients.</p>
            </div>

            {message.text && (
                <div className={`mb-6 p-4 rounded-xl flex items-center gap-3 ${message.type === 'success'
                        ? 'bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-500/20'
                        : 'bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-500/20'
                    }`}>
                    {message.type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />}
                    <span className="text-sm font-medium">{message.text}</span>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Search & Selection */}
                <div className="space-y-6">
                    <div className="bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm">
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-4 block">Find Patient</label>
                        <div className="flex gap-2">
                            <div className="relative flex-1 group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-600 dark:group-focus-within:text-blue-500 transition-colors" />
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && searchPatients()}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl py-2.5 pl-11 pr-4 outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-600 text-sm transition-all"
                                    placeholder="Name or Phone..."
                                />
                            </div>
                            <button
                                onClick={searchPatients}
                                disabled={searching}
                                className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white px-4 rounded-xl transition-all flex items-center justify-center min-w-[44px]"
                            >
                                {searching ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                            </button>
                        </div>

                        {patients.length > 0 && !selectedPatient && (
                            <div className="mt-4 space-y-2 max-h-60 overflow-y-auto pr-1">
                                {patients.map(p => (
                                    <button
                                        key={p._id}
                                        onClick={() => setSelectedPatient(p)}
                                        className="w-full flex items-center justify-between p-3 rounded-xl border border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 hover:border-blue-500/50 hover:bg-blue-50/30 dark:hover:bg-blue-600/5 transition-all text-left"
                                    >
                                        <div>
                                            <p className="text-sm font-medium text-slate-800 dark:text-slate-200">{p.name}</p>
                                            <p className="text-xs text-slate-400 mt-0.5">{p.phone} • {p.age}y • {p.gender}</p>
                                        </div>
                                        <UserCheck className="w-4 h-4 text-slate-400" />
                                    </button>
                                ))}
                            </div>
                        )}

                        {selectedPatient && (
                            <div className="mt-6 p-4 rounded-xl bg-blue-50 dark:bg-blue-600/10 border border-blue-200 dark:border-blue-500/20">
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                                            <User className="text-blue-600 dark:text-blue-400 w-5 h-5" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-blue-900 dark:text-blue-200">{selectedPatient.name}</p>
                                            <p className="text-xs text-blue-600 dark:text-blue-400 font-medium">Selected Patient</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedPatient(null)}
                                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                                    >
                                        Change
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Token Configuration */}
                <div className="space-y-6">
                    <div className={`bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-2xl p-6 shadow-sm transition-opacity ${!selectedPatient ? 'opacity-50 pointer-events-none' : 'opacity-100'}`}>
                        <label className="text-sm font-semibold text-slate-700 dark:text-slate-200 mb-6 block">Token Configuration</label>

                        <div className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Department</label>
                                <select
                                    value={tokenData.department}
                                    onChange={(e) => setTokenData({ ...tokenData, department: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl py-3 px-4 outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 text-sm transition-all"
                                >
                                    {departments.map(dept => <option key={dept} value={dept}>{dept}</option>)}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Assign Doctor (Optional)</label>
                                <select
                                    value={tokenData.doctorId}
                                    onChange={(e) => setTokenData({ ...tokenData, doctorId: e.target.value })}
                                    className="w-full bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700/50 rounded-xl py-3 px-4 outline-none focus:border-blue-500 text-slate-800 dark:text-slate-200 text-sm transition-all"
                                >
                                    <option value="">Auto-Assign (Next Available)</option>
                                    {doctors.map(doc => (
                                        <option key={doc._id} value={doc._id}>Dr. {doc.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="text-xs font-bold uppercase tracking-wider text-slate-400 ml-1">Priority</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['Normal', 'Emergency'].map(p => (
                                        <button
                                            key={p}
                                            onClick={() => setTokenData({ ...tokenData, priority: p })}
                                            className={`p-3 rounded-xl border text-sm font-medium transition-all ${tokenData.priority === p
                                                    ? (p === 'Emergency'
                                                        ? 'bg-red-50 dark:bg-red-500/10 border-red-500 text-red-600 dark:text-red-400 shadow-sm'
                                                        : 'bg-blue-50 dark:bg-blue-600/10 border-blue-500 text-blue-600 dark:text-blue-400 shadow-sm')
                                                    : 'border-slate-100 dark:border-white/5 bg-slate-50/50 dark:bg-white/5 text-slate-500 dark:text-slate-400'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button
                                onClick={handleGenerateToken}
                                disabled={loading || !selectedPatient}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/25 transition-all mt-4 flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                                    <>
                                        <Ticket className="w-5 h-5" />
                                        Generate OPD Token
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TokenGeneration;

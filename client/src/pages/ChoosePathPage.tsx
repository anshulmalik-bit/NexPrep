import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { tracks, type Track, type Role } from '../data/tracks';
import { useInterviewStore } from '../store/interview-store';
import { motion, AnimatePresence } from 'framer-motion';

export function ChoosePathPage() {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'initial' | 'roles'>('initial');

    // --- SHARED LOGIC ---
    const {
        setTrackAndRole,
        setQuinnMode,
        setCompany,
        clearResume
    } = useInterviewStore();

    const startGenericRound = () => {
        setTrackAndRole('general', 'general-hr');
        setQuinnMode('SUPPORTIVE');
        setCompany(null, null, null);
        clearResume();
        navigate('/calibration');
    };

    // --- DASHBOARD LOGIC (For Specific Roles) ---
    // Only show specific tracks in the dashboard since "Generic" was already a separate choice
    const specificTracks = useMemo(() => tracks.filter(t => t.id !== 'general'), []);
    const [selectedTrack, setSelectedTrack] = useState<Track>(specificTracks[0]);

    const handleRoleSelect = (role: Role) => {
        setTrackAndRole(selectedTrack.id, role.id);
        navigate('/setup');
    };

    // --- VIEW 1: INITIAL SELECTION ("The Page You Wanted Kept") ---
    if (viewMode === 'initial') {
        return (
            <div className="min-h-screen bg-canvas pt-[72px] flex items-center justify-center p-4">
                <div className="max-w-4xl w-full">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl font-bold text-text mb-3">How would you like to practice?</h1>
                        <p className="text-xl text-text-secondary">Choose the mode that fits your goal today</p>
                    </div>

                    <div className="grid md:grid-cols-2 gap-6">
                        {/* Option 1: Quick Generic HR */}
                        <button
                            onClick={startGenericRound}
                            className="group relative overflow-hidden bg-white hover:bg-gradient-to-br hover:from-primary/5 hover:to-primary/10 border-2 border-slate-100 hover:border-primary/30 rounded-3xl p-8 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="text-9xl">🤝</span>
                            </div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                                    🤝
                                </div>
                                <h3 className="text-2xl font-bold text-text mb-2 group-hover:text-primary transition-colors">Generic HR Round</h3>
                                <p className="text-text-secondary mb-6 leading-relaxed">
                                    Quick behavioral interview practice. Standard questions like "Tell me about yourself".
                                </p>
                                <ul className="space-y-2 mb-8 text-sm text-text-secondary">
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-500">✓</span> Instant Start (No Setup)
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-500">✓</span> Silent Mode capable
                                    </li>
                                </ul>
                                <span className="inline-flex items-center font-semibold text-primary group-hover:translate-x-1 transition-transform">
                                    Start Now &rarr;
                                </span>
                            </div>
                        </button>

                        {/* Option 2: Specific Role */}
                        <button
                            onClick={() => setViewMode('roles')}
                            className="group relative overflow-hidden bg-white hover:bg-gradient-to-br hover:from-accent/5 hover:to-accent/10 border-2 border-slate-100 hover:border-accent/30 rounded-3xl p-8 text-left transition-all duration-300 hover:shadow-xl hover:-translate-y-1"
                        >
                            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                                <span className="text-9xl">💼</span>
                            </div>
                            <div className="relative z-10">
                                <div className="w-16 h-16 bg-accent/10 rounded-2xl flex items-center justify-center text-3xl mb-6 group-hover:scale-110 transition-transform duration-300">
                                    💼
                                </div>
                                <h3 className="text-2xl font-bold text-text mb-2 group-hover:text-accent transition-colors">Specific Role</h3>
                                <p className="text-text-secondary mb-6 leading-relaxed">
                                    Deep dive simulation for a specific job title (e.g., "Senior React Developer").
                                </p>
                                <ul className="space-y-2 mb-8 text-sm text-text-secondary">
                                    <li className="flex items-center gap-2">
                                        <span className="text-accent">✓</span> 50+ Roles Available
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <span className="text-accent">✓</span> Role-Specific Analysis
                                    </li>
                                </ul>
                                <span className="inline-flex items-center font-semibold text-accent group-hover:translate-x-1 transition-transform">
                                    Select Role &rarr;
                                </span>
                            </div>
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // --- VIEW 2: DASHBOARD (For Efficient Role Selection) ---
    return (
        <div className="min-h-screen bg-slate-50 flex flex-col pt-[72px]">
            {/* Minimal Header */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-[72px] z-20 shadow-sm">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setViewMode('initial')}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-slate-400 hover:text-slate-600"
                        title="Back to Mode Selection"
                    >
                        &larr;
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-800">Select Specific Role</h1>
                        <p className="text-sm text-slate-500">Choose a career track and target role</p>
                    </div>
                </div>
                <div className="text-sm text-slate-400 font-mono hidden sm:block">
                    {specificTracks.reduce((acc, t) => acc + t.roles.length, 0)} ROLES AVAILABLE
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden flex-col lg:flex-row">
                {/* 1. Mobile Tab Bar (Specific Tracks Only) */}
                <div className="lg:hidden bg-white border-b border-slate-200 overflow-x-auto scrollbar-hide flex-shrink-0">
                    <div className="flex p-2 gap-2 min-w-max">
                        {specificTracks.map((track) => {
                            const isSelected = selectedTrack.id === track.id;
                            return (
                                <button
                                    key={track.id}
                                    onClick={() => setSelectedTrack(track)}
                                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all
                                        ${isSelected
                                            ? 'bg-slate-800 text-white shadow-md'
                                            : 'bg-white text-slate-600 border border-slate-200'
                                        }`}
                                >
                                    <span>{track.emoji}</span>
                                    <span>{track.name}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* 2. Left Sidebar (Desktop Only) */}
                <div className="hidden lg:flex w-72 bg-white border-r border-slate-200 overflow-y-auto flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-10">
                    <div className="p-4 flex-1">
                        <div className="space-y-1">
                            {specificTracks.map((track) => {
                                const isSelected = selectedTrack.id === track.id;
                                return (
                                    <button
                                        key={track.id}
                                        onClick={() => setSelectedTrack(track)}
                                        className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-all group relative
                                            ${isSelected
                                                ? 'bg-slate-800 text-white shadow-lg'
                                                : 'hover:bg-slate-100 text-slate-600'
                                            }`}
                                    >
                                        <div className="flex items-center gap-3 relative z-10">
                                            <span className={`text-lg transition-transform ${isSelected ? 'scale-110' : ''}`}>
                                                {track.emoji}
                                            </span>
                                            <span className="font-medium truncate">{track.name}</span>
                                        </div>
                                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full relative z-10 
                                            ${isSelected
                                                ? 'bg-white/20 text-white'
                                                : 'bg-slate-100 text-slate-400 group-hover:bg-white'
                                            }`}>
                                            {track.roles.length}
                                        </span>
                                    </button>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* 2. Main Content (Roles Grid) */}
                <div className="flex-1 overflow-y-auto bg-slate-50 p-6 md:p-8">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedTrack.id}
                            initial={{ opacity: 0, x: 10 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -10 }}
                            transition={{ duration: 0.2 }}
                            className="max-w-6xl mx-auto"
                        >
                            {/* Track Header */}
                            <div className="mb-8 flex items-end justify-between border-b border-slate-200 pb-6">
                                <div>
                                    <div className="flex items-center gap-2 text-slate-400 text-sm font-medium mb-2 uppercase tracking-widest">
                                        Selected Track
                                    </div>
                                    <h2 className="text-3xl font-bold text-slate-900 flex items-center gap-3">
                                        <span className="text-4xl">{selectedTrack.emoji}</span>
                                        {selectedTrack.name}
                                    </h2>
                                    <p className="text-slate-500 mt-2 max-w-2xl text-lg">
                                        {selectedTrack.description}
                                    </p>
                                </div>
                            </div>

                            {/* Dense Roles Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                                {selectedTrack.roles.map((role) => (
                                    <button
                                        key={role.id}
                                        onClick={() => handleRoleSelect(role)}
                                        className="bg-white border border-slate-200 rounded-xl p-5 text-left hover:border-primary/50 hover:shadow-md hover:-translate-y-0.5 transition-all group relative overflow-hidden"
                                    >
                                        <div className="absolute top-4 right-4 text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
                                            ➔
                                        </div>

                                        <h3 className="font-bold text-slate-800 text-lg mb-1 group-hover:text-primary transition-colors pr-8">
                                            {role.name}
                                        </h3>
                                        <p className="text-slate-500 text-sm leading-relaxed line-clamp-2">
                                            {role.description}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            </div>
        </div>
    );
}

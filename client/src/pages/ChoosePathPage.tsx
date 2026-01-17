import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tracks, type Track, type Role } from '../data/tracks';
import { useInterviewStore } from '../store/interview-store';
import { NeuralKnot } from '../components/NeuralKnot';

export function ChoosePathPage() {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState<'initial' | 'roles'>('initial');

    const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const {
        setTrackAndRole,
        setQuinnMode,
        setCompany,
        clearResume
    } = useInterviewStore();

    // ... (keep quick start logic but extract it for reuse/clarity)
    const startGenericRound = () => {
        setTrackAndRole('general', 'general-hr');
        setQuinnMode('SUPPORTIVE');
        setCompany(null, null, null);
        clearResume();
        navigate('/calibration');
    };

    const handleContinue = () => {
        if (selectedTrack && selectedRole) {
            setTrackAndRole(selectedTrack.id, selectedRole.id);
            navigate('/setup');
        }
    };

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
                                    <li className="flex items-center gap-2">
                                        <span className="text-green-500">✓</span> Full Feedback Report
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
                                        <span className="text-accent">✓</span> Upload your Resume
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

    return (
        <div className="min-h-screen bg-canvas pt-[72px]">
            <div className="container py-12">
                {/* Header with Back Button */}
                <div className="flex items-center gap-4 mb-8">
                    <button
                        onClick={() => setViewMode('initial')}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors text-text-secondary"
                    >
                        &larr; Back
                    </button>
                    <div>
                        <h1 className="text-2xl font-bold text-text">Select Specific Role</h1>
                        <p className="text-text-secondary">Choose your career track and target role</p>
                    </div>
                </div>

                {/* Mobile: Horizontal Scrollable Track Pills */}
                <div className="lg:hidden mb-8 -mx-4 px-4">
                    {/* Wrapper with overflow-visible for shadow, inner scroll */}
                    <div className="overflow-x-auto pb-6 pt-3 -mb-2 scrollbar-hide">
                        <div className="flex gap-3 px-1">
                            {tracks.filter(t => t.id !== 'general').map((track) => (
                                <button
                                    key={track.id}
                                    onClick={() => {
                                        setSelectedTrack(track);
                                        setSelectedRole(null);
                                    }}
                                    className={`flex-shrink-0 px-4 py-2.5 rounded-full font-medium text-sm whitespace-nowrap transition-all duration-200
                                        ${selectedTrack?.id === track.id
                                            ? 'bg-gradient-to-r from-primary to-primary-light text-white'
                                            : 'bg-white border border-slate-200 text-text hover:border-primary/30'
                                        }`}
                                    style={selectedTrack?.id === track.id ? {
                                        filter: 'drop-shadow(0 4px 12px rgba(99, 102, 241, 0.4))'
                                    } : {}}
                                >
                                    <span className="mr-1.5">{track.emoji}</span>
                                    {track.name}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Desktop: Two Column Layout */}
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left: Track Grid (Desktop) */}
                    <div className="hidden lg:block lg:w-1/2">
                        <h3 className="text-lg font-semibold text-text mb-4">Select Track</h3>

                        <div className="grid grid-cols-2 gap-4">
                            {tracks.filter(t => t.id !== 'general').map((track) => (
                                <button
                                    key={track.id}
                                    onClick={() => {
                                        setSelectedTrack(track);
                                        setSelectedRole(null);
                                    }}
                                    className={`glass-card p-6 text-left transition-all duration-300 group relative z-0 hover:z-10
                                        ${selectedTrack?.id === track.id
                                            ? 'ring-2 ring-primary shadow-frost-lg z-10'
                                            : 'hover:shadow-frost-lg hover:-translate-y-1'
                                        }`}
                                >
                                    <div className="flex items-start gap-4">
                                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl transition-transform duration-300 group-hover:scale-110
                                            ${selectedTrack?.id === track.id
                                                ? 'bg-gradient-to-br from-primary to-primary-light'
                                                : 'bg-gradient-to-br from-primary/10 to-accent/10'
                                            }`}
                                        >
                                            {track.emoji}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-semibold text-text mb-1 truncate">{track.name}</h4>
                                            <p className="text-sm text-text-secondary line-clamp-2">{track.description}</p>
                                        </div>
                                    </div>
                                    {selectedTrack?.id === track.id && (
                                        <div className="mt-3 flex items-center text-sm text-primary font-medium">
                                            <span className="mr-2">✓</span> Selected
                                        </div>
                                    )}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Right: Role List */}
                    <div className="lg:w-1/2 pb-28 lg:pb-0">
                        <h3 className="text-lg font-semibold text-text mb-4">
                            {selectedTrack ? `Roles in ${selectedTrack.name}` : 'Select a track to see roles'}
                        </h3>

                        {selectedTrack ? (
                            <div className="space-y-3">
                                {selectedTrack.roles.map((role) => (
                                    <button
                                        key={role.id}
                                        onClick={() => setSelectedRole(role)}
                                        className={`w-full glass-card p-4 text-left transition-all duration-200 active:scale-[0.98]
                                            ${selectedRole?.id === role.id
                                                ? 'outline outline-2 outline-accent shadow-frost-lg bg-accent/5'
                                                : 'hover:shadow-frost hover:-translate-y-1'
                                            }`}
                                    >
                                        <div className="flex items-center justify-between">
                                            <div className="flex-1 min-w-0 pr-3">
                                                <h5 className="font-medium text-text">{role.name}</h5>
                                                <p className="text-sm text-text-secondary mt-0.5">{role.description}</p>
                                            </div>
                                            {selectedRole?.id === role.id && (
                                                <div className="flex-shrink-0 w-6 h-6 rounded-full bg-accent flex items-center justify-center text-white text-sm">
                                                    ✓
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="glass-card p-12 text-center">
                                <div className="mx-auto mb-4 opacity-50 flex justify-center">
                                    <NeuralKnot size="sm" state="idle" />
                                </div>
                                <p className="text-text-secondary">
                                    Choose a career track to see available roles
                                </p>
                            </div>
                        )}

                        {/* Bottom padding to account for fixed button */}
                        <div className="h-32"></div>

                        {/* Unified Fixed Bottom Bar */}
                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-frost-lg z-40">
                            <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
                                <div className="text-sm font-medium">
                                    {selectedTrack ? (
                                        <>
                                            <span className="text-text-secondary">Selected: </span>
                                            <span className="text-text">{selectedTrack.name}</span>
                                            {selectedRole && (
                                                <span className="text-primary"> → {selectedRole.name}</span>
                                            )}
                                        </>
                                    ) : (
                                        <span className="text-text-muted">Select a track to begin</span>
                                    )}
                                </div>

                                <button
                                    onClick={handleContinue}
                                    disabled={!selectedTrack || !selectedRole}
                                    className={`w-full sm:w-auto px-8 py-3 rounded-xl font-semibold text-lg transition-all duration-300
                                ${selectedTrack && selectedRole
                                            ? 'btn-cta shadow-lg hover:shadow-xl hover:-translate-y-0.5'
                                            : 'bg-slate-100 text-text-muted cursor-not-allowed'
                                        }`}
                                >
                                    {selectedTrack && selectedRole
                                        ? `Continue as ${selectedRole.name} →`
                                        : 'Select Track & Role'
                                    }
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { tracks, type Track, type Role } from '../data/tracks';
import { useInterviewStore } from '../store/interview-store';
import { NeuralKnot } from '../components/NeuralKnot';

export function ChoosePathPage() {
    const navigate = useNavigate();
    const [selectedTrack, setSelectedTrack] = useState<Track | null>(null);
    const [selectedRole, setSelectedRole] = useState<Role | null>(null);
    const { setTrackAndRole } = useInterviewStore();

    const handleContinue = () => {
        if (selectedTrack && selectedRole) {
            setTrackAndRole(selectedTrack.id, selectedRole.id);
            navigate('/setup');
        }
    };

    return (
        <div className="min-h-screen bg-canvas pt-[72px]">
            <div className="container py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="page-title">Choose Your Path</h1>
                    <p className="page-subtitle">
                        Select your career track and target role to get personalized interview questions
                    </p>
                </div>

                {/* Mobile: Horizontal Scrollable Track Pills */}
                <div className="lg:hidden mb-8 -mx-4 px-4">
                    {/* Wrapper with overflow-visible for shadow, inner scroll */}
                    <div className="overflow-x-auto pb-6 pt-3 -mb-2 scrollbar-hide">
                        <div className="flex gap-3 px-1">
                            {tracks.map((track) => (
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
                            {tracks.map((track) => (
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
                            <div className="space-y-3 lg:max-h-[calc(100vh-400px)] lg:overflow-y-auto lg:pr-4 lg:pb-4 lg:pl-1 lg:pt-1 scrollbar-hide lg:scrollbar-default">
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
                                <div className="mx-auto mb-4 opacity-50">
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
                        <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-frost-lg z-50">
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

import { Link, useNavigate } from 'react-router-dom';
import { useInterviewStore } from '../store/interview-store';
import { tracks } from '../data/tracks';

export function TracksPage() {
    const navigate = useNavigate();
    const { setTrack } = useInterviewStore();

    const handleSelectTrack = (trackId: string) => {
        setTrack(trackId);
        navigate(`/tracks/${trackId}`);
    };

    const trackIcons: Record<string, string> = {
        tech: '💻',
        mba: '📊',
        hr: '👥',
        analytics: '📈',
        sales: '🎯',
        operations: '⚙️',
        creative: '🎨',
    };

    return (
        <div className="min-h-screen bg-canvas pt-[72px]">
            <div className="container py-8 lg:py-12">
                {/* Header */}
                <div className="text-center mb-10">
                    <Link
                        to="/"
                        className="inline-flex items-center text-text-secondary hover:text-primary transition-colors mb-4"
                    >
                        ← Back
                    </Link>
                    <h1 className="page-title">Choose Your Path</h1>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Tracks Section */}
                    <div>
                        <h2 className="text-lg font-semibold text-text mb-4">Tracks</h2>
                        <div className="grid grid-cols-2 gap-3">
                            {tracks.map((track) => (
                                <button
                                    key={track.id}
                                    onClick={() => handleSelectTrack(track.id)}
                                    className="glass-card p-6 text-center hover:shadow-frost-lg hover:border-primary/30 transition-all group"
                                >
                                    <span className="text-3xl block mb-2 group-hover:scale-110 transition-transform">
                                        {trackIcons[track.id] || '📋'}
                                    </span>
                                    <span className="text-sm font-medium text-text">{track.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Roles Preview Section */}
                    <div className="glass-card p-6">
                        <h2 className="text-lg font-semibold text-text mb-4">Roles</h2>
                        <p className="text-text-secondary text-sm mb-4">
                            Select a track to see available roles
                        </p>
                        <div className="space-y-2 opacity-50">
                            {['Frontend Developer', 'Backend Developer', 'Product Manager', 'And more...'].map((role) => (
                                <div key={role} className="flex items-center gap-2 text-text-muted text-sm">
                                    <span className="w-4 h-4 rounded-full border-2 border-slate-300" />
                                    {role}
                                </div>
                            ))}
                        </div>
                        <button
                            className="btn-primary w-full mt-6 opacity-50 cursor-not-allowed"
                            disabled
                        >
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

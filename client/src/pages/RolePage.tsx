import { Link, useNavigate, useParams } from 'react-router-dom';
import { tracks } from '../data/tracks';
import { useInterviewStore } from '../store/interview-store';

export function RolePage() {
    const { trackId } = useParams<{ trackId: string }>();
    const navigate = useNavigate();
    const { roleId, setRole } = useInterviewStore();

    const track = tracks.find((t) => t.id === trackId);

    if (!track) {
        return (
            <div className="min-h-screen bg-canvas pt-[72px] flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold text-text mb-4">Track not found</h1>
                    <Link to="/choose-path" className="btn-primary">
                        Back to Tracks
                    </Link>
                </div>
            </div>
        );
    }

    const handleSelectRole = (id: string) => {
        setRole(id);
        navigate('/setup/company');
    };

    return (
        <div className="min-h-screen bg-canvas pt-[72px]">
            <div className="container py-8 lg:py-12">
                {/* Header */}
                <div className="text-center mb-10">
                    <Link
                        to="/choose-path"
                        className="inline-flex items-center text-text-secondary hover:text-primary transition-colors mb-4"
                    >
                        ← Back to Tracks
                    </Link>
                    <div className="flex items-center justify-center gap-2 mb-4">
                        <span className="text-3xl">{track.emoji}</span>
                        <span className="text-lg font-medium text-text-secondary">{track.name}</span>
                    </div>
                    <h1 className="page-title mb-2">Select Your Role</h1>
                    <p className="page-subtitle">
                        Choose the specific position you're preparing for
                    </p>
                </div>

                {/* Roles Grid */}
                <div className="max-w-3xl mx-auto grid sm:grid-cols-2 gap-4">
                    {track.roles.map((role) => (
                        <button
                            key={role.id}
                            onClick={() => handleSelectRole(role.id)}
                            className={`glass-card p-5 text-left transition-all ${roleId === role.id
                                    ? 'ring-2 ring-primary bg-primary/5'
                                    : 'hover:shadow-frost-lg hover:border-primary/30'
                                }`}
                        >
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">👤</span>
                                <div className="flex-1">
                                    <h3 className="font-semibold text-text mb-1">{role.name}</h3>
                                    <p className="text-sm text-text-secondary line-clamp-2">{role.description}</p>
                                </div>
                                {roleId === role.id && (
                                    <span className="text-primary text-xl">✓</span>
                                )}
                            </div>
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

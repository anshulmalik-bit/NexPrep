import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterviewStore } from '../store/interview-store';
import { tracks } from '../data/tracks';
import './ChoosePathPage.css';

export function ChoosePathPage() {
    const navigate = useNavigate();
    const { setTrack, setRole } = useInterviewStore();
    const [selectedTrack, setSelectedTrack] = useState<string | null>(null);
    const [selectedRole, setSelectedRole] = useState<string | null>(null);

    const trackIcons: Record<string, { icon: string; color: string }> = {
        tech: { icon: '💻', color: '#0EA5E9' },
        mba: { icon: '📊', color: '#8B5CF6' },
        hr: { icon: '👥', color: '#10B981' },
        analytics: { icon: '📈', color: '#F59E0B' },
        sales: { icon: '🎯', color: '#EF4444' },
        operations: { icon: '⚙️', color: '#6366F1' },
        creative: { icon: '🎨', color: '#EC4899' },
    };

    const selectedTrackData = tracks.find(t => t.id === selectedTrack);

    const handleContinue = () => {
        if (selectedTrack && selectedRole) {
            setTrack(selectedTrack);
            setRole(selectedRole);
            navigate('/setup/company');
        }
    };

    return (
        <div className="choose-path-page page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">Choose Your Path</h1>
                </div>

                <div className="choose-path__layout">
                    {/* Track Selection */}
                    <div className="choose-path__section">
                        <h3 className="choose-path__section-title">Tracks</h3>
                        <div className="tracks-grid">
                            {tracks.map((track) => (
                                <button
                                    key={track.id}
                                    className={`track-card press-effect ${selectedTrack === track.id ? 'track-card--selected' : ''}`}
                                    onClick={() => {
                                        setSelectedTrack(track.id);
                                        setSelectedRole(null);
                                    }}
                                >
                                    <div
                                        className="track-card__icon"
                                        style={{ '--track-color': trackIcons[track.id]?.color || '#0EA5E9' } as React.CSSProperties}
                                    >
                                        {trackIcons[track.id]?.icon || '📋'}
                                    </div>
                                    <span className="track-card__name">{track.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Role Selection */}
                    <div className="choose-path__section">
                        <h3 className="choose-path__section-title">Roles</h3>
                        {selectedTrackData ? (
                            <div className="roles-list">
                                {selectedTrackData.roles.map((role) => (
                                    <button
                                        key={role.id}
                                        className={`role-item press-effect ${selectedRole === role.id ? 'role-item--selected' : ''}`}
                                        onClick={() => setSelectedRole(role.id)}
                                    >
                                        <div className="role-item__radio">
                                            {selectedRole === role.id && <div className="role-item__radio-dot" />}
                                        </div>
                                        <span className="role-item__name">{role.name}</span>
                                    </button>
                                ))}
                            </div>
                        ) : (
                            <div className="roles-placeholder">
                                <p>Select a track to see available roles</p>
                            </div>
                        )}

                        <button
                            className={`btn btn--primary btn--lg choose-path__continue ${!selectedRole ? 'btn--disabled' : ''}`}
                            disabled={!selectedRole}
                            onClick={handleContinue}
                        >
                            Continue →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

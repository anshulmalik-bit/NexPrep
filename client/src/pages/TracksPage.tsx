import { Link, useNavigate } from 'react-router-dom';
import { useInterviewStore } from '../store/interview-store';
import { tracks } from '../data/tracks';
import './TracksPage.css';

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
        <div className="tracks-page">
            <div className="container">
                <div className="tracks-header">
                    <Link to="/" className="back-link">← Back</Link>
                    <h1 className="page-title">Choose Your Path</h1>
                </div>

                <div className="tracks-layout">
                    <div className="tracks-section">
                        <h2 className="tracks-section__title">Tracks</h2>
                        <div className="tracks-grid">
                            {tracks.map((track) => (
                                <button
                                    key={track.id}
                                    className="track-card"
                                    onClick={() => handleSelectTrack(track.id)}
                                >
                                    <div className="track-card__icon">
                                        {trackIcons[track.id] || '📋'}
                                    </div>
                                    <span className="track-card__name">{track.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="roles-section">
                        <h2 className="roles-section__title">Roles</h2>
                        <p className="roles-section__hint">Select a track to see available roles</p>
                        <div className="roles-placeholder">
                            <div className="role-item role-item--placeholder">
                                <span className="role-check">○</span> Frontend Developer
                            </div>
                            <div className="role-item role-item--placeholder">
                                <span className="role-check">○</span> Backend Developer
                            </div>
                            <div className="role-item role-item--placeholder">
                                <span className="role-check">○</span> Product Manager
                            </div>
                            <div className="role-item role-item--placeholder">
                                <span className="role-check">○</span> And more...
                            </div>
                        </div>
                        <button className="btn btn--pill btn--gradient btn--disabled" disabled>
                            Next
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

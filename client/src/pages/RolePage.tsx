import { useNavigate, useParams } from 'react-router-dom';
import { tracks } from '../data/tracks';
import { useInterviewStore } from '../store/interview-store';
import { SelectionCard } from '../components/Card';
import { Button } from '../components/Button';
import './RolePage.css';

export function RolePage() {
    const { trackId } = useParams<{ trackId: string }>();
    const navigate = useNavigate();
    const { roleId, setRole } = useInterviewStore();

    const track = tracks.find((t) => t.id === trackId);

    if (!track) {
        return (
            <div className="container text-center py-24">
                <h1>Track not found</h1>
                <Button to="/tracks" variant="secondary">
                    Back to Tracks
                </Button>
            </div>
        );
    }

    const handleSelectRole = (id: string) => {
        setRole(id);
        navigate('/setup/company');
    };

    return (
        <div className="role-page">
            <div className="container">
                <div className="page-header text-center">
                    <Button to="/tracks" variant="ghost" className="back-btn">
                        ← Back to Tracks
                    </Button>
                    <div className="page-header__track">
                        <span className="page-header__emoji">{track.emoji}</span>
                        <span className="page-header__track-name">{track.name}</span>
                    </div>
                    <h1 className="page-title">Select Your Role</h1>
                    <p className="page-subtitle">
                        Choose the specific position you're preparing for
                    </p>
                </div>

                <div className="roles-grid">
                    {track.roles.map((role) => (
                        <SelectionCard
                            key={role.id}
                            emoji="👤"
                            name={role.name}
                            meta={role.description}
                            selected={roleId === role.id}
                            onClick={() => handleSelectRole(role.id)}
                        />
                    ))}
                </div>
            </div>
        </div>
    );
}

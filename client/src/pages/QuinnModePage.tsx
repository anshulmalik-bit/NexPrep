import { useNavigate } from 'react-router-dom';
import type { QuinnMode } from '../store/interview-store';
import { useInterviewStore } from '../store/interview-store';
import './QuinnModePage.css';

export function QuinnModePage() {
    const navigate = useNavigate();
    const { setQuinnMode, quinnMode } = useInterviewStore();

    const handleSelect = (mode: QuinnMode) => {
        setQuinnMode(mode);
    };

    const handleContinue = () => {
        if (quinnMode) {
            navigate('/interview');
        }
    };

    return (
        <div className="quinn-mode-overlay">
            <div className="quinn-mode-modal glass-card">
                <button className="quinn-mode-modal__close" onClick={() => navigate(-1)}>
                    ✕
                </button>

                <h2 className="quinn-mode-modal__title">
                    How do you want Quinn to guide you today?
                </h2>

                <div className="quinn-mode-options">
                    <button
                        className={`quinn-mode-option quinn-mode-option--supportive ${quinnMode === 'SUPPORTIVE' ? 'quinn-mode-option--selected' : ''}`}
                        onClick={() => handleSelect('SUPPORTIVE')}
                    >
                        <div className="quinn-mode-option__icon">
                            <svg viewBox="0 0 40 40" fill="none">
                                <path d="M10 25c5-8 15-8 20 0" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
                            </svg>
                        </div>
                        <h3>Supportive Quinn</h3>
                        <p>Warm, encouraging, gentle feedback.</p>
                    </button>

                    <button
                        className={`quinn-mode-option quinn-mode-option--direct ${quinnMode === 'DIRECT' ? 'quinn-mode-option--selected' : ''}`}
                        onClick={() => handleSelect('DIRECT')}
                    >
                        <div className="quinn-mode-option__icon">
                            <svg viewBox="0 0 40 40" fill="none">
                                <path d="M10 20h20M25 15l5 5-5 5" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
                            </svg>
                        </div>
                        <h3>Direct Quinn</h3>
                        <p>Dry humor, honest critique, concise.</p>
                    </button>
                </div>

                <button
                    className={`btn btn--primary btn--lg quinn-mode-modal__continue ${!quinnMode ? 'btn--disabled' : ''}`}
                    disabled={!quinnMode}
                    onClick={handleContinue}
                >
                    Continue
                </button>
            </div>
        </div>
    );
}

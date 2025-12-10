import { useInterviewStore } from '../store/interview-store';
import type { QuinnMode } from '../store/interview-store';
import { Card } from './Card';
import './QuinnModeSelector.css';

interface QuinnModeSelectorProps {
    onSelect: (mode: QuinnMode) => void;
}

export function QuinnModeSelector({ onSelect }: QuinnModeSelectorProps) {
    const { quinnMode, setQuinnMode } = useInterviewStore();

    const handleSelect = (mode: QuinnMode) => {
        setQuinnMode(mode);
        onSelect(mode);
    };

    return (
        <div className="quinn-mode-selector">
            <Card
                className={`quinn-mode-card quinn-mode-card--supportive ${quinnMode === 'SUPPORTIVE' ? 'card--selected' : ''}`}
                interactive
                hover
                onClick={() => handleSelect('SUPPORTIVE')}
            >
                <div className="quinn-mode-card__avatar">🤗</div>
                <h3 className="quinn-mode-card__title">Supportive Quinn</h3>
                <p className="quinn-mode-card__description">
                    Warm, patient, and encouraging. I'll guide you with empathy and celebrate your progress along the way.
                </p>
                <ul className="quinn-mode-card__traits">
                    <li>✨ Gentle encouragement</li>
                    <li>💪 Constructive feedback</li>
                    <li>🌟 Celebrates growth</li>
                </ul>
            </Card>

            <Card
                className={`quinn-mode-card quinn-mode-card--direct ${quinnMode === 'DIRECT' ? 'card--selected' : ''}`}
                interactive
                hover
                onClick={() => handleSelect('DIRECT')}
            >
                <div className="quinn-mode-card__avatar">😏</div>
                <h3 className="quinn-mode-card__title">Direct Quinn</h3>
                <p className="quinn-mode-card__description">
                    Concise, sharp, and witty. I'll give you straight answers with a side of dry humor. No sugarcoating.
                </p>
                <ul className="quinn-mode-card__traits">
                    <li>🎯 No-nonsense feedback</li>
                    <li>⚡ Quick and efficient</li>
                    <li>🔥 Keeps you on your toes</li>
                </ul>
            </Card>
        </div>
    );
}

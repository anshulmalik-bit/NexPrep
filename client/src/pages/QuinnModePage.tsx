import { useNavigate } from 'react-router-dom';
import type { QuinnMode } from '../store/interview-store';
import { useInterviewStore } from '../store/interview-store';
import { NeuralKnot } from '../components/NeuralKnot';

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
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="glass-card-strong max-w-md w-full p-6 lg:p-8 relative">
                <button
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-text-muted hover:text-text transition-colors"
                    onClick={() => {
                        // Fallback to /setup if no history
                        if (window.history.length > 1) {
                            navigate(-1);
                        } else {
                            navigate('/setup');
                        }
                    }}
                    aria-label="Close modal"
                >
                    ✕
                </button>

                <div className="text-center mb-6">
                    <div className="mx-auto mb-4 flex justify-center">
                        <NeuralKnot size="sm" state="idle" />
                    </div>
                    <h2 className="text-xl font-bold text-text">
                        How do you want Quinn to guide you today?
                    </h2>
                </div>

                <div className="grid gap-3 mb-6">
                    <button
                        onClick={() => handleSelect('SUPPORTIVE')}
                        className={`p-4 rounded-xl text-left transition-all ${quinnMode === 'SUPPORTIVE'
                            ? 'ring-2 ring-primary bg-primary/5'
                            : 'bg-slate-50 hover:bg-slate-100'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                                <span className="text-green-600 text-xl">😊</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-text">Supportive Quinn</h3>
                                <p className="text-sm text-text-secondary">Warm, encouraging, gentle feedback.</p>
                            </div>
                            {quinnMode === 'SUPPORTIVE' && (
                                <span className="ml-auto text-primary">✓</span>
                            )}
                        </div>
                    </button>

                    <button
                        onClick={() => handleSelect('DIRECT')}
                        className={`p-4 rounded-xl text-left transition-all ${quinnMode === 'DIRECT'
                            ? 'ring-2 ring-primary bg-primary/5'
                            : 'bg-slate-50 hover:bg-slate-100'
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <span className="text-orange-600 text-xl">🎯</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-text">Direct Quinn</h3>
                                <p className="text-sm text-text-secondary">Dry humor, honest critique, concise.</p>
                            </div>
                            {quinnMode === 'DIRECT' && (
                                <span className="ml-auto text-primary">✓</span>
                            )}
                        </div>
                    </button>
                </div>

                <button
                    onClick={handleContinue}
                    disabled={!quinnMode}
                    className="btn-cta w-full py-4 rounded-full disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Continue
                </button>
            </div>
        </div>
    );
}

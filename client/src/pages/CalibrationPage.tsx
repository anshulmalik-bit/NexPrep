import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { NeuralKnot } from '../components/NeuralKnot';

export function CalibrationPage() {
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);

    const [micStatus, setMicStatus] = useState<'pending' | 'testing' | 'ready' | 'error'>('pending');
    const [cameraStatus, setCameraStatus] = useState<'pending' | 'testing' | 'ready' | 'error'>('pending');
    const [audioLevel, setAudioLevel] = useState(0);
    const [showConsent, setShowConsent] = useState(false);
    const [consentGiven, setConsentGiven] = useState(false);

    useEffect(() => {
        // Start tests after a short delay
        const timer = setTimeout(() => {
            testMicrophone();
            testCamera();
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    const testMicrophone = async () => {
        setMicStatus('testing');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

            // Create audio context for level visualization
            const audioContext = new AudioContext();
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);
            analyser.fftSize = 256;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);

            const updateLevel = () => {
                analyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                setAudioLevel(average / 128); // Normalize to 0-1
                if (micStatus === 'testing' || micStatus === 'ready') {
                    requestAnimationFrame(updateLevel);
                }
            };
            updateLevel();

            setMicStatus('ready');
        } catch {
            setMicStatus('error');
        }
    };

    const testCamera = async () => {
        setCameraStatus('testing');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
            setCameraStatus('ready');
        } catch {
            setCameraStatus('error');
        }
    };

    const handleContinue = () => {
        if (!consentGiven) {
            setShowConsent(true);
        } else {
            navigate('/interview');
        }
    };

    const handleConsentAccept = () => {
        setConsentGiven(true);
        setShowConsent(false);
        navigate('/interview');
    };

    const isReady = micStatus === 'ready' && cameraStatus === 'ready';

    return (
        <div className="min-h-screen bg-canvas pt-[72px]">
            <div className="container py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="page-title">System Calibration</h1>
                    <p className="page-subtitle">
                        Let's make sure everything is working before we start
                    </p>
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Microphone Test */}
                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-text flex items-center gap-2">
                                    🎤 Microphone
                                </h3>
                                <StatusBadge status={micStatus} />
                            </div>

                            <div className="bg-slate-50 rounded-xl p-6 min-h-[200px] flex flex-col items-center justify-center">
                                {micStatus === 'pending' && (
                                    <p className="text-text-secondary">Waiting to test...</p>
                                )}
                                {micStatus === 'testing' && (
                                    <>
                                        <div className="loading-spinner mb-4" />
                                        <p className="text-text-secondary">Accessing microphone...</p>
                                    </>
                                )}
                                {micStatus === 'ready' && (
                                    <>
                                        {/* Audio Level Visualization */}
                                        <div className="voice-waveform mb-4">
                                            {[...Array(5)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="voice-waveform__bar"
                                                    style={{
                                                        height: `${20 + audioLevel * 80 * (0.5 + Math.random() * 0.5)}%`,
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-sm text-text-secondary text-center">
                                            Say something to test your microphone
                                        </p>
                                        <p className="text-xs text-accent mt-2">✓ Microphone detected</p>
                                    </>
                                )}
                                {micStatus === 'error' && (
                                    <>
                                        <div className="text-4xl mb-4">⚠️</div>
                                        <p className="text-error text-center">
                                            Could not access microphone
                                        </p>
                                        <button
                                            onClick={testMicrophone}
                                            className="mt-4 text-sm text-primary hover:underline"
                                        >
                                            Try again
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Camera Test */}
                        <div className="glass-card p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-text flex items-center gap-2">
                                    📹 Camera
                                </h3>
                                <StatusBadge status={cameraStatus} />
                            </div>

                            <div className="relative bg-slate-900 rounded-xl overflow-hidden min-h-[200px] flex items-center justify-center">
                                {cameraStatus === 'pending' && (
                                    <p className="text-white/60">Waiting to test...</p>
                                )}
                                {cameraStatus === 'testing' && (
                                    <>
                                        <div className="loading-spinner" />
                                    </>
                                )}
                                {cameraStatus === 'ready' && (
                                    <>
                                        <video
                                            ref={videoRef}
                                            autoPlay
                                            muted
                                            playsInline
                                            className="w-full h-full object-cover"
                                        />
                                        {/* HUD Overlay */}
                                        <div className="hud-overlay absolute inset-0" />
                                        {/* Breathing Ring */}
                                        <div className="absolute inset-4 breathing-ring" />
                                        {/* Status indicator */}
                                        <div className="absolute bottom-3 left-3 px-2 py-1 bg-accent/80 text-white text-xs rounded-full">
                                            ● Live
                                        </div>
                                    </>
                                )}
                                {cameraStatus === 'error' && (
                                    <div className="text-center p-4">
                                        <div className="text-4xl mb-4">⚠️</div>
                                        <p className="text-error">Could not access camera</p>
                                        <button
                                            onClick={testCamera}
                                            className="mt-4 text-sm text-primary hover:underline"
                                        >
                                            Try again
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quinn Status */}
                    <div className="mt-8 glass-card p-6 flex items-center gap-6">
                        <div className="w-16 h-16 flex-shrink-0">
                            <NeuralKnot
                                size="md"
                                state={isReady ? 'coaching' : 'thinking'}
                            />
                        </div>
                        <div>
                            <p className="font-medium text-text">
                                {isReady
                                    ? "All systems ready! Let's begin your interview practice."
                                    : "Testing your audio and video setup..."
                                }
                            </p>
                            <p className="text-sm text-text-secondary mt-1">
                                {isReady
                                    ? "I'll be analyzing your responses to provide real-time feedback."
                                    : "Please allow access to your microphone and camera when prompted."
                                }
                            </p>
                        </div>
                    </div>

                    {/* Continue Button */}
                    <div className="mt-8 text-center">
                        <button
                            onClick={handleContinue}
                            disabled={!isReady}
                            className={`px-12 py-4 rounded-xl font-semibold text-lg transition-all duration-300
                                ${isReady
                                    ? 'btn-cta'
                                    : 'bg-slate-100 text-text-muted cursor-not-allowed'
                                }`}
                        >
                            {isReady ? 'Start Interview →' : 'Testing...'}
                        </button>

                        {!isReady && (
                            <button
                                onClick={() => navigate('/interview')}
                                className="block mx-auto mt-4 text-sm text-text-secondary hover:text-text transition-colors"
                            >
                                Skip and use text mode instead
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Consent Modal */}
            {showConsent && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
                    onClick={() => setShowConsent(false)}
                >
                    <div
                        className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-2xl shadow-frost-lg p-8 animate-slide-up"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto mb-4">
                                <NeuralKnot size="md" state="speaking" />
                            </div>
                            <h2 className="text-xl font-bold text-text">Privacy Notice</h2>
                        </div>

                        <div className="bg-slate-50 rounded-xl p-4 mb-6">
                            <p className="text-sm text-text-secondary leading-relaxed">
                                <strong className="text-text">Your privacy is important to us.</strong>
                                <br /><br />
                                We only process audio and video locally on your device for real-time feedback.
                                <strong> Nothing is stored or sent to external servers.</strong>
                            </p>
                        </div>

                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowConsent(false)}
                                className="flex-1 py-3 rounded-xl font-medium border border-slate-200 text-text hover:bg-slate-50 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleConsentAccept}
                                className="flex-1 btn-primary"
                            >
                                I Understand
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

// Status Badge Component
function StatusBadge({ status }: { status: 'pending' | 'testing' | 'ready' | 'error' }) {
    const variants = {
        pending: 'bg-slate-100 text-text-muted',
        testing: 'bg-yellow-100 text-yellow-700',
        ready: 'bg-green-100 text-green-700',
        error: 'bg-red-100 text-red-700',
    };

    const labels = {
        pending: 'Pending',
        testing: 'Testing...',
        ready: 'Ready ✓',
        error: 'Error',
    };

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-medium ${variants[status]}`}>
            {labels[status]}
        </span>
    );
}

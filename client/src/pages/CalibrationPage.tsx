import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { NeuralKnot } from '../components/NeuralKnot';
import {
    useInterviewStore,
    usePermissions,
    useAnswerMode
} from '../store/interview-store';

type TestStatus = 'idle' | 'testing' | 'ready' | 'error';

export function CalibrationPage() {
    const navigate = useNavigate();
    const videoRef = useRef<HTMLVideoElement>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    // Get state from centralized store
    const permissions = usePermissions();
    const answerMode = useAnswerMode();
    const {
        setMicPermission,
        setCamPermission,
        setCalibrationComplete,
        setCalibrationResult,
        setAnswerMode,
        updateVolume,
    } = useInterviewStore();

    // Local UI state
    const [micStatus, setMicStatus] = useState<TestStatus>('idle');
    const [cameraStatus, setCameraStatus] = useState<TestStatus>('idle');
    const [audioLevel, setAudioLevel] = useState(0);
    const [showConsent, setShowConsent] = useState(false);
    const [lightingOk, setLightingOk] = useState<boolean | null>(null);
    const [micLevelAvg, setMicLevelAvg] = useState(0);

    // Reflect store state on mount
    useEffect(() => {
        // If already calibrated, show ready state
        if (permissions.calibrationComplete) {
            if (permissions.microphone === 'granted') setMicStatus('ready');
            if (permissions.camera === 'granted') setCameraStatus('ready');
        }
    }, [permissions]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            // Stop all streams
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
            }
            if (audioContextRef.current) {
                audioContextRef.current.close();
            }
        };
    }, []);

    const testMicrophone = useCallback(async () => {
        setMicStatus('testing');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            // Update store with permission granted
            setMicPermission('granted');

            // Create audio context for level visualization
            const audioContext = new AudioContext();
            audioContextRef.current = audioContext;
            const analyser = audioContext.createAnalyser();
            const microphone = audioContext.createMediaStreamSource(stream);
            microphone.connect(analyser);
            analyser.fftSize = 256;

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            let levelSum = 0;
            let levelCount = 0;
            const startTime = Date.now();

            const updateLevel = () => {
                analyser.getByteFrequencyData(dataArray);
                const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
                const normalizedLevel = average / 128;
                setAudioLevel(normalizedLevel);

                // Update store volume
                updateVolume(Math.round(normalizedLevel * 100));

                // Accumulate for average (first 3 seconds)
                if (Date.now() - startTime < 3000) {
                    levelSum += normalizedLevel;
                    levelCount++;
                } else if (levelCount > 0) {
                    const avgLevel = (levelSum / levelCount) * 100;
                    setMicLevelAvg(avgLevel);

                    // Save calibration result to store
                    setCalibrationResult({
                        micLevel: avgLevel,
                        completedAt: new Date()
                    });
                    levelCount = 0; // Only do this once
                }

                // Continue animation if still testing/ready
                if (micStatus !== 'error') {
                    requestAnimationFrame(updateLevel);
                }
            };
            updateLevel();

            setMicStatus('ready');
        } catch (error) {
            console.error('Microphone access denied:', error);
            setMicPermission('denied');
            setMicStatus('error');
        }
    }, [micStatus, setMicPermission, setCalibrationResult, updateVolume]);

    const testCamera = useCallback(async () => {
        setCameraStatus('testing');
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    width: { ideal: 640 },
                    height: { ideal: 480 }
                }
            });

            // Merge with existing stream if any
            if (streamRef.current) {
                stream.getVideoTracks().forEach(track => streamRef.current!.addTrack(track));
            } else {
                streamRef.current = stream;
            }

            // Update store with permission granted
            setCamPermission('granted');

            if (videoRef.current) {
                videoRef.current.srcObject = stream;

                // Simple lighting check after video loads
                videoRef.current.onloadeddata = () => {
                    setTimeout(() => {
                        checkLighting();
                    }, 1000);
                };
            }

            setCameraStatus('ready');

            // Save calibration result
            setCalibrationResult({
                cameraOk: true,
                completedAt: new Date()
            });
        } catch (error) {
            console.error('Camera access denied:', error);
            setCamPermission('denied');
            setCameraStatus('error');
            setCalibrationResult({ cameraOk: false });
        }
    }, [setCamPermission, setCalibrationResult]);

    // Simple lighting check using canvas
    const checkLighting = useCallback(() => {
        if (!videoRef.current) return;

        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        canvas.width = 100;
        canvas.height = 75;
        ctx.drawImage(videoRef.current, 0, 0, 100, 75);

        const imageData = ctx.getImageData(0, 0, 100, 75);
        let totalBrightness = 0;

        for (let i = 0; i < imageData.data.length; i += 4) {
            const r = imageData.data[i];
            const g = imageData.data[i + 1];
            const b = imageData.data[i + 2];
            totalBrightness += (r + g + b) / 3;
        }

        const avgBrightness = totalBrightness / (imageData.data.length / 4);
        const isGoodLighting = avgBrightness > 60; // Threshold for acceptable lighting

        setLightingOk(isGoodLighting);
        setCalibrationResult({ cameraOk: isGoodLighting });
    }, [setCalibrationResult]);

    // Auto-start tests
    useEffect(() => {
        const timer = setTimeout(() => {
            if (micStatus === 'idle') testMicrophone();
            if (cameraStatus === 'idle') testCamera();
        }, 500);

        return () => clearTimeout(timer);
    }, []);

    // Attach stream to video element when it becomes available
    useEffect(() => {
        if (cameraStatus === 'ready' && videoRef.current && streamRef.current) {
            videoRef.current.srcObject = streamRef.current;

            // Re-attach lighting check
            videoRef.current.onloadeddata = () => {
                setTimeout(() => {
                    checkLighting();
                }, 1000);
            };
        }
    }, [cameraStatus, checkLighting]);

    const handleContinue = () => {
        // Mark calibration as complete in store
        setCalibrationComplete(true);

        if (!showConsent) {
            setShowConsent(true);
        }
    };

    const handleConsentAccept = () => {
        setShowConsent(false);
        navigate('/interview');
    };

    const handleSkipToTextMode = () => {
        // Set answer mode to TEXT in store
        setAnswerMode('TEXT');
        setCalibrationComplete(true);
        navigate('/interview');
    };

    const handleRerunCalibration = () => {
        setMicStatus('idle');
        setCameraStatus('idle');
        setAudioLevel(0);
        setMicLevelAvg(0);
        setLightingOk(null);

        // Stop existing streams
        if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop());
            streamRef.current = null;
        }

        // Re-test
        setTimeout(() => {
            testMicrophone();
            testCamera();
        }, 300);
    };

    const isReady = micStatus === 'ready' && cameraStatus === 'ready';
    const hasErrors = micStatus === 'error' || cameraStatus === 'error';

    // Determine mic level status
    const getMicLevelStatus = () => {
        if (micLevelAvg === 0) return null;
        if (micLevelAvg < 10) return { status: 'error' as const, message: 'Very low - move closer to mic or use headphones' };
        if (micLevelAvg < 30) return { status: 'warn' as const, message: 'Low - try speaking louder' };
        return { status: 'good' as const, message: 'Great - we can hear you clearly!' };
    };

    const micLevelStatus = getMicLevelStatus();

    return (
        <div className="min-h-screen bg-canvas pt-[72px]">
            <div className="container py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="text-3xl font-bold text-text mb-2">System Calibration</h1>
                    <p className="text-text-secondary">
                        Let's make sure everything is working before we start
                    </p>
                    {answerMode !== 'TEXT' && (
                        <p className="text-sm text-primary mt-2">
                            Mode: {answerMode} Interview
                        </p>
                    )}
                </div>

                <div className="max-w-4xl mx-auto">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Microphone Test */}
                        <div className="bg-white rounded-2xl shadow-frost border border-slate-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-text flex items-center gap-2">
                                    🎤 Microphone
                                </h3>
                                <StatusBadge status={micStatus} />
                            </div>

                            <div className="bg-slate-50 rounded-xl p-6 min-h-[200px] flex flex-col items-center justify-center">
                                {micStatus === 'idle' && (
                                    <button
                                        onClick={testMicrophone}
                                        className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
                                    >
                                        Test Microphone
                                    </button>
                                )}
                                {micStatus === 'testing' && (
                                    <>
                                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mb-4" />
                                        <p className="text-text-secondary">Accessing microphone...</p>
                                    </>
                                )}
                                {micStatus === 'ready' && (
                                    <>
                                        {/* Audio Level Visualization */}
                                        <div className="flex items-end gap-1 h-16 mb-4">
                                            {[...Array(7)].map((_, i) => (
                                                <div
                                                    key={i}
                                                    className="w-3 bg-gradient-to-t from-primary to-accent rounded-full transition-all duration-75"
                                                    style={{
                                                        height: `${20 + audioLevel * 80 * (0.5 + Math.random() * 0.5)}%`,
                                                    }}
                                                />
                                            ))}
                                        </div>
                                        <p className="text-sm text-text-secondary text-center mb-2">
                                            Say something to test your microphone
                                        </p>
                                        {micLevelStatus && (
                                            <p className={`text-xs mt-2 ${micLevelStatus.status === 'good' ? 'text-accent' :
                                                micLevelStatus.status === 'warn' ? 'text-warning' : 'text-error'
                                                }`}>
                                                {micLevelStatus.status === 'good' ? '✓' : '⚠️'} {micLevelStatus.message}
                                            </p>
                                        )}
                                    </>
                                )}
                                {micStatus === 'error' && (
                                    <>
                                        <div className="text-4xl mb-4">⚠️</div>
                                        <p className="text-error text-center mb-2">
                                            Could not access microphone
                                        </p>
                                        <p className="text-xs text-text-muted text-center mb-4">
                                            Please allow microphone access in your browser settings
                                        </p>
                                        <button
                                            onClick={testMicrophone}
                                            className="text-sm text-primary hover:underline"
                                        >
                                            Try again
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Camera Test */}
                        <div className="bg-white rounded-2xl shadow-frost border border-slate-100 p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-semibold text-text flex items-center gap-2">
                                    📹 Camera
                                </h3>
                                <StatusBadge status={cameraStatus} />
                            </div>

                            <div className="relative bg-slate-900 rounded-xl overflow-hidden min-h-[200px] flex items-center justify-center">
                                {cameraStatus === 'idle' && (
                                    <button
                                        onClick={testCamera}
                                        className="px-6 py-3 bg-primary text-white rounded-xl font-medium hover:bg-primary-dark transition-colors"
                                    >
                                        Test Camera
                                    </button>
                                )}
                                {cameraStatus === 'testing' && (
                                    <div className="w-8 h-8 border-2 border-white border-t-transparent rounded-full animate-spin" />
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
                                        <div className="absolute inset-0 pointer-events-none"
                                            style={{
                                                backgroundImage: `linear-gradient(to right, rgb(20 184 166 / 0.2) 1px, transparent 1px),
                                                                  linear-gradient(to bottom, rgb(20 184 166 / 0.2) 1px, transparent 1px)`,
                                                backgroundSize: '30px 30px'
                                            }}
                                        />
                                        {/* Lighting indicator */}
                                        {lightingOk !== null && (
                                            <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-xs font-medium ${lightingOk ? 'bg-accent/80 text-white' : 'bg-warning/80 text-white'
                                                }`}>
                                                {lightingOk ? '☀️ Good lighting' : '💡 Needs more light'}
                                            </div>
                                        )}
                                        {/* Live indicator */}
                                        <div className="absolute bottom-3 left-3 px-2 py-1 bg-accent/80 text-white text-xs rounded-full flex items-center gap-1">
                                            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                                            Live
                                        </div>
                                    </>
                                )}
                                {cameraStatus === 'error' && (
                                    <div className="text-center p-4">
                                        <div className="text-4xl mb-4">⚠️</div>
                                        <p className="text-white mb-2">Could not access camera</p>
                                        <p className="text-xs text-white/60 mb-4">
                                            Please allow camera access in your browser settings
                                        </p>
                                        <button
                                            onClick={testCamera}
                                            className="text-sm text-accent hover:underline"
                                        >
                                            Try again
                                        </button>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Quinn Status */}
                    <div className="mt-8 bg-white rounded-2xl shadow-frost border border-slate-100 p-6 flex items-center gap-6">
                        <div className="flex-shrink-0">
                            <NeuralKnot
                                size="sm"
                                state={isReady ? 'coaching' : hasErrors ? 'idle' : 'thinking'}
                            />
                        </div>
                        <div className="flex-1">
                            <p className="font-medium text-text">
                                {isReady
                                    ? "All systems ready! Let's begin your interview practice."
                                    : hasErrors
                                        ? "Some devices couldn't be accessed. You can still proceed with text mode."
                                        : "Testing your audio and video setup..."
                                }
                            </p>
                            <p className="text-sm text-text-secondary mt-1">
                                {isReady
                                    ? "I'll be analyzing your responses to provide real-time feedback."
                                    : hasErrors
                                        ? "Don't worry — text-based answers work great too!"
                                        : "Please allow access to your microphone and camera when prompted."
                                }
                            </p>
                        </div>
                        {isReady && (
                            <button
                                onClick={handleRerunCalibration}
                                className="text-sm text-text-muted hover:text-text transition-colors"
                            >
                                🔄 Re-run
                            </button>
                        )}
                    </div>

                    {/* Calibration Summary */}
                    {(micStatus === 'ready' || cameraStatus === 'ready') && (
                        <div className="mt-6 bg-slate-50 rounded-xl p-4">
                            <h4 className="text-sm font-medium text-text mb-3">Calibration Summary</h4>
                            <div className="grid grid-cols-2 gap-4 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-text-muted">Microphone</span>
                                    <span className={permissions.microphone === 'granted' ? 'text-accent' : 'text-error'}>
                                        {permissions.microphone === 'granted' ? '✓ Ready' : '✗ Denied'}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-text-muted">Camera</span>
                                    <span className={permissions.camera === 'granted' ? 'text-accent' : 'text-error'}>
                                        {permissions.camera === 'granted' ? '✓ Ready' : '✗ Denied'}
                                    </span>
                                </div>
                                {micLevelAvg > 0 && (
                                    <div className="flex justify-between">
                                        <span className="text-text-muted">Mic Level</span>
                                        <span className={micLevelAvg >= 30 ? 'text-accent' : 'text-warning'}>
                                            {Math.round(micLevelAvg)}%
                                        </span>
                                    </div>
                                )}
                                {lightingOk !== null && (
                                    <div className="flex justify-between">
                                        <span className="text-text-muted">Lighting</span>
                                        <span className={lightingOk ? 'text-accent' : 'text-warning'}>
                                            {lightingOk ? 'Good' : 'Low'}
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Bottom padding to account for fixed button */}
                    <div className="h-32"></div>
                </div>
            </div>

            {/* Continue Button - Fixed at bottom */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-frost-lg z-40">
                <div className="max-w-md mx-auto text-center space-y-3">
                    <button
                        onClick={handleContinue}
                        disabled={!isReady && !hasErrors}
                        className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300
                            ${isReady
                                ? 'bg-gradient-to-r from-primary to-accent text-white shadow-neural hover:shadow-lg transform hover:scale-[1.02]'
                                : hasErrors
                                    ? 'bg-primary text-white hover:bg-primary-dark'
                                    : 'bg-slate-100 text-text-muted cursor-not-allowed'
                            }`}
                    >
                        {isReady ? 'Join Interview →' : hasErrors ? 'Continue Anyway →' : 'Testing...'}
                    </button>

                    {(hasErrors || (!isReady && micStatus !== 'idle' && cameraStatus !== 'idle')) && (
                        <button
                            onClick={handleSkipToTextMode}
                            className="text-sm text-text-secondary hover:text-text transition-colors"
                        >
                            Skip and use text-only mode
                        </button>
                    )}
                </div>
            </div>

            {/* Consent Modal */}
            {showConsent && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
                    onClick={() => setShowConsent(false)}
                >
                    <div
                        className="w-full max-w-md bg-white rounded-2xl shadow-frost-lg p-8"
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="text-center mb-6">
                            <div className="mx-auto mb-4">
                                <NeuralKnot size="sm" state="speaking" />
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
                                className="flex-1 py-3 rounded-xl font-medium bg-primary text-white hover:bg-primary-dark transition-colors"
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
function StatusBadge({ status }: { status: TestStatus }) {
    const variants = {
        idle: 'bg-slate-100 text-text-muted',
        testing: 'bg-yellow-100 text-yellow-700',
        ready: 'bg-green-100 text-green-700',
        error: 'bg-red-100 text-red-700',
    };

    const labels = {
        idle: 'Not tested',
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

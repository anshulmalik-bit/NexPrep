import React, { useRef, useEffect, useState } from 'react';
import { useInterviewStore, useLiveMetrics, useUIState, useCalibration, usePermissions } from '../store/interview-store';

/**
 * HUD Camera Module
 * Floating camera preview with live metrics overlay.
 * Reads liveMetrics and ui state from the centralized store.
 */
export const HUDContainer: React.FC = () => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const [streamActive, setStreamActive] = useState(false);
    const liveMetrics = useLiveMetrics();
    const ui = useUIState();
    const calibration = useCalibration();
    const permissions = usePermissions();
    const { toggleHud } = useInterviewStore();

    // Initialize camera stream
    useEffect(() => {
        const startCamera = async () => {
            // Only try to get camera if permission is granted
            if (permissions.camera !== 'granted') return;

            try {
                const stream = await navigator.mediaDevices.getUserMedia({
                    video: { width: { ideal: 320 }, height: { ideal: 180 } }
                });
                streamRef.current = stream;

                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    setStreamActive(true);
                }
            } catch (error) {
                console.error('Failed to access camera for HUD:', error);
                setStreamActive(false);
            }
        };

        if (ui.hudVisible && permissions.camera === 'granted') {
            startCamera();
        }

        return () => {
            // Cleanup stream when component unmounts or HUD is hidden
            if (streamRef.current) {
                streamRef.current.getTracks().forEach(track => track.stop());
                streamRef.current = null;
                setStreamActive(false);
            }
        };
    }, [ui.hudVisible, permissions.camera]);

    // Don't render if HUD is hidden
    if (!ui.hudVisible) {
        return (
            <button
                onClick={toggleHud}
                className="fixed bottom-4 right-4 z-50 p-3 bg-surface rounded-full shadow-frost-lg
                         hover:shadow-neural transition-all duration-300"
                aria-label="Show HUD"
            >
                👁️
            </button>
        );
    }

    // Calculate overall status
    const getOverallStatus = () => {
        const scores = [
            liveMetrics.pacing >= 40 && liveMetrics.pacing <= 70,
            liveMetrics.gaze === 'on',
            liveMetrics.posture === 'good',
            liveMetrics.fillerWordCount < 5,
        ];
        const goodCount = scores.filter(Boolean).length;
        if (goodCount >= 3) return { status: 'great', color: 'text-accent', emoji: '✨' };
        if (goodCount >= 2) return { status: 'good', color: 'text-primary', emoji: '👍' };
        return { status: 'needs work', color: 'text-warning', emoji: '💪' };
    };

    const overall = getOverallStatus();

    return (
        <div className="fixed bottom-4 right-4 z-50 w-64 bg-surface/95 backdrop-blur-frost 
                       rounded-2xl shadow-frost-lg border border-slate-200 overflow-hidden
                       transition-all duration-300">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-2 bg-slate-50 border-b border-slate-100">
                <span className="text-sm font-medium text-text flex items-center gap-2">
                    📊 Live Feedback
                </span>
                <button
                    onClick={toggleHud}
                    className="p-1 hover:bg-slate-200 rounded transition-colors"
                    aria-label="Hide HUD"
                >
                    ✕
                </button>
            </div>

            {/* Camera Preview */}
            <div className="relative aspect-video bg-slate-900 flex items-center justify-center">
                {(calibration.cameraOk || permissions.camera === 'granted') && streamActive ? (
                    <div className="absolute inset-0">
                        {/* Live camera feed */}
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            playsInline
                            className="w-full h-full object-cover"
                        />

                        {/* Gaze indicator overlay */}
                        <div className={`absolute top-2 right-2 px-2 py-1 rounded-full text-xs font-medium
                                       ${liveMetrics.gaze === 'on'
                                ? 'bg-accent/80 text-white'
                                : 'bg-warning/80 text-white'}`}>
                            {liveMetrics.gaze === 'on' ? '👀 On Camera' : '👀 Look Up'}
                        </div>

                        {/* Live indicator */}
                        <div className="absolute bottom-2 left-2 px-2 py-1 bg-red-500/80 text-white text-xs rounded-full flex items-center gap-1">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            Live
                        </div>
                    </div>
                ) : permissions.camera === 'granted' ? (
                    <div className="text-center p-4">
                        <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                        <span className="text-slate-400 text-sm">Starting camera...</span>
                    </div>
                ) : (
                    <span className="text-slate-500 text-sm">Camera not enabled</span>
                )}

                {/* Teal mesh overlay effect */}
                <div className="absolute inset-0 pointer-events-none opacity-20"
                    style={{
                        backgroundImage: `linear-gradient(to right, rgb(20 184 166 / 0.3) 1px, transparent 1px),
                                          linear-gradient(to bottom, rgb(20 184 166 / 0.3) 1px, transparent 1px)`,
                        backgroundSize: '20px 20px'
                    }}
                />
            </div>

            {/* Metrics Grid */}
            <div className="p-3 space-y-2">
                {/* Overall Status */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                    <span className="text-xs text-text-muted">Overall</span>
                    <span className={`text-sm font-medium ${overall.color}`}>
                        {overall.emoji} {overall.status}
                    </span>
                </div>

                {/* Pacing */}
                <MetricRow
                    label="Pace"
                    value={liveMetrics.pacing}
                    ideal={{ min: 40, max: 70 }}
                    format={(v) => v < 40 ? 'Too slow' : v > 70 ? 'Too fast' : 'Good pace'}
                />

                {/* Volume */}
                <MetricRow
                    label="Volume"
                    value={liveMetrics.volume}
                    ideal={{ min: 40, max: 80 }}
                    format={(v) => v < 40 ? 'Too quiet' : v > 80 ? 'Too loud' : 'Good'}
                />

                {/* Filler Words */}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">Filler Words</span>
                    <span className={`text-sm font-mono ${liveMetrics.fillerWordCount < 3 ? 'text-accent' :
                        liveMetrics.fillerWordCount < 6 ? 'text-warning' : 'text-error'
                        }`}>
                        {liveMetrics.fillerWordCount}
                    </span>
                </div>

                {/* Posture */}
                <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted">Posture</span>
                    <span className={`text-sm ${liveMetrics.posture === 'good' ? 'text-accent' :
                        liveMetrics.posture === 'poor' ? 'text-warning' : 'text-text-muted'
                        }`}>
                        {liveMetrics.posture === 'good' ? '✓ Good' :
                            liveMetrics.posture === 'poor' ? '↑ Sit up' : '—'}
                    </span>
                </div>

                {/* Confidence */}
                <div className="pt-2 border-t border-slate-100">
                    <div className="flex items-center justify-between mb-1">
                        <span className="text-xs text-text-muted">Confidence</span>
                        <span className="text-sm font-medium text-primary">
                            {liveMetrics.confidence}%
                        </span>
                    </div>
                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div
                            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                            style={{ width: `${liveMetrics.confidence}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

// Helper component for metric rows with progress bars
interface MetricRowProps {
    label: string;
    value: number;
    ideal: { min: number; max: number };
    format: (value: number) => string;
}

const MetricRow: React.FC<MetricRowProps> = ({ label, value, ideal, format }) => {
    const isGood = value >= ideal.min && value <= ideal.max;

    return (
        <div className="space-y-1">
            <div className="flex items-center justify-between">
                <span className="text-xs text-text-muted">{label}</span>
                <span className={`text-xs ${isGood ? 'text-accent' : 'text-warning'}`}>
                    {format(value)}
                </span>
            </div>
            <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
                <div
                    className={`h-full transition-all duration-300 ${isGood ? 'bg-accent' : 'bg-warning'
                        }`}
                    style={{ width: `${Math.min(100, value)}%` }}
                />
            </div>
        </div>
    );
};

export default HUDContainer;

import React, { useEffect, useRef } from 'react';
import { useInterviewStore, useUIState, useLiveMetrics } from '../store/interview-store';

interface BottomSheetProps {
    children?: React.ReactNode;
}

/**
 * BottomSheet Component
 * Mobile utility panel that slides up from the bottom.
 * Uses the centralized store for open/close state.
 */
export const BottomSheet: React.FC<BottomSheetProps> = ({ children }) => {
    const ui = useUIState();
    const liveMetrics = useLiveMetrics();
    const { closeBottomSheet, setUtilityPanelTab } = useInterviewStore();
    const sheetRef = useRef<HTMLDivElement>(null);

    // Handle click outside to close
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (sheetRef.current && !sheetRef.current.contains(event.target as Node)) {
                closeBottomSheet();
            }
        };

        if (ui.bottomSheetOpen) {
            document.addEventListener('mousedown', handleClickOutside);
            // Prevent body scroll when sheet is open
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
            document.body.style.overflow = '';
        };
    }, [ui.bottomSheetOpen, closeBottomSheet]);

    // Handle escape key
    useEffect(() => {
        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                closeBottomSheet();
            }
        };

        if (ui.bottomSheetOpen) {
            document.addEventListener('keydown', handleEscape);
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
        };
    }, [ui.bottomSheetOpen, closeBottomSheet]);

    if (!ui.bottomSheetOpen) {
        return null;
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 backdrop-blur-xs  
                          animate-fade-in md:hidden"
                style={{ zIndex: 'var(--z-modal-backdrop)' }}
                aria-hidden="true"
            />

            {/* Sheet */}
            <div
                ref={sheetRef}
                className="fixed bottom-0 left-0 right-0 md:hidden
                          bg-surface rounded-t-3xl shadow-frost-lg
                          max-h-[80vh] overflow-hidden
                          animate-slide-up"
                style={{ zIndex: 'var(--z-modal)' }}
                role="dialog"
                aria-modal="true"
                aria-labelledby="bottom-sheet-title"
            >
                {/* Handle */}
                <div className="flex justify-center pt-3 pb-2">
                    <div className="w-12 h-1.5 bg-slate-300 rounded-full" />
                </div>

                {/* Header */}
                <div className="flex items-center justify-between px-4 pb-3 border-b border-slate-100">
                    <h2 id="bottom-sheet-title" className="text-lg font-semibold text-text">
                        Interview Tools
                    </h2>
                    <button
                        onClick={closeBottomSheet}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                        aria-label="Close panel"
                    >
                        ✕
                    </button>
                </div>

                {/* Tab Navigation */}
                <div className="flex border-b border-slate-100">
                    {(['feedback', 'frameworks', 'mission'] as const).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setUtilityPanelTab(tab)}
                            className={`flex-1 py-3 text-sm font-medium transition-colors
                                      ${ui.utilityPanelTab === tab
                                    ? 'text-primary border-b-2 border-primary'
                                    : 'text-text-muted hover:text-text'}`}
                        >
                            {tab === 'feedback' && '📊 Feedback'}
                            {tab === 'frameworks' && '🧠 Frameworks'}
                            {tab === 'mission' && '🎯 Mission'}
                        </button>
                    ))}
                </div>

                {/* Content */}
                <div className="p-4 overflow-y-auto max-h-[60vh]">
                    {ui.utilityPanelTab === 'feedback' && (
                        <FeedbackPanel liveMetrics={liveMetrics} />
                    )}
                    {ui.utilityPanelTab === 'frameworks' && (
                        <FrameworksPanel />
                    )}
                    {ui.utilityPanelTab === 'mission' && (
                        <MissionPanel />
                    )}
                    {children}
                </div>
            </div>
        </>
    );
};

// Feedback Panel - Live metrics summary
const FeedbackPanel: React.FC<{ liveMetrics: ReturnType<typeof useLiveMetrics> }> = ({ liveMetrics }) => (
    <div className="space-y-4">
        <div className="grid grid-cols-2 gap-3">
            <MetricCard
                label="Pace"
                value={liveMetrics.pacing}
                unit="%"
                status={liveMetrics.pacing >= 40 && liveMetrics.pacing <= 70 ? 'good' : 'warning'}
            />
            <MetricCard
                label="Volume"
                value={liveMetrics.volume}
                unit="%"
                status={liveMetrics.volume >= 40 && liveMetrics.volume <= 80 ? 'good' : 'warning'}
            />
            <MetricCard
                label="Filler Words"
                value={liveMetrics.fillerWordCount}
                status={liveMetrics.fillerWordCount < 5 ? 'good' : 'warning'}
            />
            <MetricCard
                label="Confidence"
                value={liveMetrics.confidence}
                unit="%"
                status={liveMetrics.confidence >= 60 ? 'good' : 'warning'}
            />
        </div>

        <div className="p-3 bg-canvas rounded-xl">
            <div className="flex items-center gap-2 mb-2">
                <span className={`w-2 h-2 rounded-full ${liveMetrics.gaze === 'on' ? 'bg-accent' : 'bg-warning'
                    }`} />
                <span className="text-sm text-text">
                    Eye Contact: {liveMetrics.gaze === 'on' ? 'Good' : 'Look at camera'}
                </span>
            </div>
            <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${liveMetrics.posture === 'good' ? 'bg-accent' : 'bg-warning'
                    }`} />
                <span className="text-sm text-text">
                    Posture: {liveMetrics.posture === 'good' ? 'Great!' : 'Sit up straight'}
                </span>
            </div>
        </div>
    </div>
);

// Frameworks Panel - Interview frameworks
const FrameworksPanel: React.FC = () => (
    <div className="space-y-3">
        <FrameworkCard
            title="STAR Method"
            description="Situation → Task → Action → Result"
            icon="⭐"
        />
        <FrameworkCard
            title="CAR Method"
            description="Challenge → Action → Result"
            icon="🚗"
        />
        <FrameworkCard
            title="SOAR Method"
            description="Situation → Obstacle → Action → Result"
            icon="🦅"
        />
    </div>
);

// Mission Panel - Current interview context
const MissionPanel: React.FC = () => {
    const { companyName, roleId } = useInterviewStore();

    return (
        <div className="space-y-3">
            <div className="p-3 bg-primary/5 rounded-xl border border-primary/20">
                <h3 className="text-sm font-medium text-primary mb-1">Your Goal</h3>
                <p className="text-sm text-text">
                    Demonstrate your skills for the {roleId || 'selected role'} position
                    {companyName && ` at ${companyName}`}.
                </p>
            </div>
            <div className="p-3 bg-accent/5 rounded-xl border border-accent/20">
                <h3 className="text-sm font-medium text-accent mb-1">Quinn's Advice</h3>
                <p className="text-sm text-text">
                    Focus on specific examples and quantify your impact when possible.
                </p>
            </div>
        </div>
    );
};

// Helper Components
const MetricCard: React.FC<{
    label: string;
    value: number;
    unit?: string;
    status: 'good' | 'warning';
}> = ({ label, value, unit = '', status }) => (
    <div className={`p-3 rounded-xl ${status === 'good' ? 'bg-accent/10' : 'bg-warning/10'
        }`}>
        <div className="text-xs text-text-muted mb-1">{label}</div>
        <div className={`text-xl font-bold ${status === 'good' ? 'text-accent' : 'text-warning'
            }`}>
            {value}{unit}
        </div>
    </div>
);

const FrameworkCard: React.FC<{
    title: string;
    description: string;
    icon: string;
}> = ({ title, description, icon }) => (
    <div className="p-3 bg-canvas rounded-xl flex items-start gap-3">
        <span className="text-2xl">{icon}</span>
        <div>
            <h4 className="font-medium text-text">{title}</h4>
            <p className="text-sm text-text-muted">{description}</p>
        </div>
    </div>
);

export default BottomSheet;

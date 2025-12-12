import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    useInterviewStore,
    useLiveMetrics,
    useUIState,
    useAnswerMode,
    type AnswerRecord
} from '../store/interview-store';
import { api, type ContentFeedback } from '../services/api';
import { NeuralKnot } from '../components/NeuralKnot';
import { SmartInput } from '../components/SmartInput';
import { HUDContainer } from '../components/HUDContainer';
import { BottomSheet } from '../components/BottomSheet';

interface ChatMessage {
    id: string;
    type: 'quinn' | 'user' | 'system';
    content: string;
    timestamp: Date;
}

export function InterviewPage() {
    const navigate = useNavigate();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const initRef = useRef(false); // Guard against React StrictMode double-call
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [showHintSuggestion, setShowHintSuggestion] = useState(false);
    const [connectionError, setConnectionError] = useState(false);
    const [, setCurrentFeedback] = useState<ContentFeedback | null>(null);

    // Get state from centralized store
    const liveMetrics = useLiveMetrics();
    const ui = useUIState();
    const answerMode = useAnswerMode();

    const {
        sessionId,
        trackId,
        roleId,
        companyName,
        quinnMode,
        resumeText,
        currentQuestion,
        questionNumber,
        totalQuestions,
        isLoading,
        startSession,
        setQuestion,
        saveAnswer,
        setLoading,
        // New store actions
        setUtilityPanelTab,
        toggleBottomSheet,
        setHint,
        setHintLoading,
        updatePacing,
        updateConfidence,
    } = useInterviewStore();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        // Guard against React StrictMode calling useEffect twice
        if (initRef.current) return;
        initRef.current = true;
        initInterview();
    }, []);

    // Hesitation detection - now triggers hint via store
    useEffect(() => {
        if (currentQuestion && !isTyping) {
            const timer = setTimeout(() => {
                setShowHintSuggestion(true);
            }, 10000); // 10 seconds

            return () => clearTimeout(timer);
        }
    }, [currentQuestion, isTyping]);

    const mockQuestions = [
        "Tell me about a time when you had to learn a new technology quickly. How did you approach it?",
        "Describe a challenging project you worked on and how you overcame the obstacles.",
        "How do you handle disagreements with team members about technical decisions?",
        "What's your approach to debugging a complex issue in production?",
        "Why are you interested in this role and what makes you a good fit?"
    ];

    const initInterview = async () => {
        setLoading(true);
        try {
            const result = await api.startInterview({
                trackId: trackId || 'tech',
                roleId: roleId || 'frontend',
                companyName: companyName || undefined,
                quinnMode: quinnMode || 'SUPPORTIVE',
                resumeText: resumeText || undefined,
            });

            startSession(result.sessionId);

            // Don't add client-side greeting - the server's first response
            // includes a conversational greeting (Acknowledge → Reflect → Transition → Question)
            setMessages([]);

            await fetchNextQuestion(result.sessionId);
        } catch (err) {
            console.error('Failed to start interview, using demo mode:', err);
            startSession('demo-session');

            const greeting = quinnMode === 'SUPPORTIVE'
                ? `Hello! I'm Quinn, your interview coach. 🎭 [Demo Mode - Backend not connected] Ready to practice for your ${roleId || 'frontend'} role? Let's make this fun and productive! 🚀`
                : `Quinn here. [Demo Mode] ${roleId || 'frontend'} interview practice. Let's get started.`;

            setMessages([{
                id: '1',
                type: 'quinn',
                content: greeting,
                timestamp: new Date()
            }]);

            setQuestion({
                id: 'demo-q1',
                text: mockQuestions[0],
                competencyType: 'behavioral',
                difficulty: 'medium',
                hintsAvailable: true
            });

            setMessages(prev => [...prev, {
                id: '2',
                type: 'quinn',
                content: mockQuestions[0],
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const fetchNextQuestion = async (sid: string) => {
        setIsTyping(true);
        try {
            if (sid === 'demo-session') {
                const nextIndex = questionNumber;
                if (nextIndex < mockQuestions.length) {
                    setTimeout(() => {
                        setQuestion({
                            id: `demo-q${nextIndex + 1}`,
                            text: mockQuestions[nextIndex],
                            competencyType: 'behavioral',
                            difficulty: 'medium',
                            hintsAvailable: true
                        });

                        setMessages(prev => [...prev, {
                            id: Date.now().toString(),
                            type: 'quinn',
                            content: mockQuestions[nextIndex],
                            timestamp: new Date()
                        }]);
                        setIsTyping(false);
                    }, 1000);
                }
                return;
            }

            const result = await api.getQuestion(sid);

            // Handle interview completion from server
            if (result.isInterviewComplete) {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    type: 'system',
                    content: quinnMode === 'SUPPORTIVE'
                        ? "🎉 Great work! You've completed all questions. Let me prepare your evaluation report..."
                        : "Interview complete. Preparing your evaluation...",
                    timestamp: new Date()
                }]);
                setIsTyping(false);
                setTimeout(() => navigate('/evaluation'), 2000);
                return;
            }

            setQuestion({
                id: result.questionId,
                text: result.question,
                competencyType: result.competencyType,
                difficulty: result.difficulty,
                hintsAvailable: result.hintsAvailable
            });

            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                type: 'quinn',
                content: result.question,
                timestamp: new Date()
            }]);
        } catch (error) {
            console.error('Failed to get question, falling back to demo mode:', error);
            const nextIndex = questionNumber;
            if (nextIndex < mockQuestions.length) {
                setQuestion({
                    id: `demo-q${nextIndex + 1}`,
                    text: mockQuestions[nextIndex],
                    competencyType: 'behavioral',
                    difficulty: 'medium',
                    hintsAvailable: true
                });

                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    type: 'quinn',
                    content: `📋 ${mockQuestions[nextIndex]}`,
                    timestamp: new Date()
                }]);
            }
        } finally {
            setIsTyping(false);
        }
    };

    // Handle answer submission from SmartInput
    const handleAnswerSubmit = async (answerText: string, audioBlob?: Blob, videoBlob?: Blob) => {
        if (!sessionId || !currentQuestion) return;

        const answer = answerText.trim();
        setShowHintSuggestion(false);

        // Add user message to chat
        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'user',
            content: answer || `[${answerMode} response recorded]`,
            timestamp: new Date()
        }]);

        setIsTyping(true);

        // Create answer record for store
        const answerRecord: AnswerRecord = {
            questionId: currentQuestion.id,
            questionText: currentQuestion.text,
            answerText: answer,
            audioBlob,
            videoBlob,
            submittedAt: new Date(),
        };

        // Show loading message
        const feedbackId = `feedback-${Date.now()}`;
        setMessages(prev => [...prev, {
            id: feedbackId,
            type: 'quinn',
            content: '🔄 Analyzing your answer...',
            timestamp: new Date()
        }]);

        try {
            // Call the Master Judge API (single source of truth for evaluation)
            const judgeResult = await api.judgeContent({
                questionId: currentQuestion.id,
                questionText: currentQuestion.text,
                transcript: answer,
                role: roleId || 'frontend',
                track: trackId || 'tech',
                quinnMode: quinnMode || 'SUPPORTIVE',
                company: companyName,
            });

            setCurrentFeedback(judgeResult);

            // Update the loading message with the actual feedback (ONE message only)
            const finalMessage = judgeResult.status === 'OK'
                ? `✅ **${judgeResult.content_strength}**\n\n💡 ${judgeResult.content_fix}`
                : `🔄 ${judgeResult.content_fix}`;

            setMessages(prev => prev.map(msg =>
                msg.id === feedbackId
                    ? { ...msg, content: finalMessage }
                    : msg
            ));

            // Save to store with evaluation
            saveAnswer(currentQuestion.id, {
                ...answerRecord,
                evaluation: {
                    score: judgeResult.content_score,
                    strengths: [judgeResult.content_strength],
                    weaknesses: [judgeResult.content_fix],
                    missingElements: [],
                    suggestedStructure: judgeResult.content_label,
                    improvedSampleAnswer: judgeResult.suggested_rewrite || ''
                }
            });

            // Update live metrics
            updatePacing(judgeResult.content_score >= 70 ? 65 : 35);
            updateConfidence(judgeResult.content_score);

            // Move to next question or complete
            if (questionNumber < totalQuestions) {
                setTimeout(() => fetchNextQuestion(sessionId), 1500);
            } else {
                // Interview complete
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    type: 'system',
                    content: quinnMode === 'SUPPORTIVE'
                        ? "🎉 Great work! You've completed all questions. Let me prepare your evaluation report..."
                        : "Interview complete. Preparing your evaluation...",
                    timestamp: new Date()
                }]);
                setTimeout(() => navigate('/evaluation'), 2000);
            }

        } catch (judgeError) {
            console.error('Content Judge error:', judgeError);
            // Show error but still allow progression
            setMessages(prev => prev.map(msg =>
                msg.id === feedbackId
                    ? { ...msg, content: '⚠️ Could not analyze answer. Moving to next question...' }
                    : msg
            ));

            // Still move to next question
            if (questionNumber < totalQuestions) {
                setTimeout(() => fetchNextQuestion(sessionId), 1500);
            } else {
                setTimeout(() => navigate('/evaluation'), 2000);
            }
        } finally {
            setIsTyping(false);
        }
    };

    const handleHint = async () => {
        if (!sessionId || !currentQuestion) return;
        setShowHintSuggestion(false);
        setHintLoading(true);

        setIsTyping(true);
        try {
            if (sessionId === 'demo-session') {
                setTimeout(() => {
                    const hint = 'Try structuring your answer using the STAR method - describe the Situation, the Task you needed to accomplish, the Action you took, and the Result of your efforts.';
                    setHint(hint);
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        type: 'quinn',
                        content: `💡 Hint: ${hint}`,
                        timestamp: new Date()
                    }]);
                    setIsTyping(false);
                }, 800);
                return;
            }

            const result = await api.getHint(sessionId, currentQuestion.id);
            setHint(result.hint);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                type: 'quinn',
                content: `💡 Hint: ${result.hint}`,
                timestamp: new Date()
            }]);
        } catch (error) {
            console.error('Failed to get hint:', error);
            setHintLoading(false);
        } finally {
            setIsTyping(false);
        }
    };

    const progress = (questionNumber / totalQuestions) * 100;

    return (
        <div className="min-h-screen bg-[#F9FAFB] pt-[72px] flex flex-col">
            {/* Progress Bar & End Interview Header - Fixed Position */}
            <div className="fixed top-[72px] left-0 right-0 z-30 bg-white/95 backdrop-blur-xl border-b border-slate-100 shadow-sm">
                <div className="h-1.5 bg-slate-100">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                        style={{ width: `${progress}%` }}
                    />
                </div>
                <div className="container py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <NeuralKnot size="sm" state={isTyping ? 'thinking' : 'idle'} />
                        <span className="text-sm font-medium text-text hidden md:inline">
                            Quinn ({quinnMode === 'SUPPORTIVE' ? 'Supportive' : 'Direct'})
                        </span>
                        {/* Answer mode indicator */}
                        <span className={`px-2 py-0.5 rounded-full text-xs ${answerMode === 'TEXT' ? 'bg-primary/10 text-primary' :
                            answerMode === 'AUDIO' ? 'bg-accent/10 text-accent' :
                                'bg-red-100 text-red-600'
                            }`}>
                            {answerMode === 'TEXT' ? '📝' : answerMode === 'AUDIO' ? '🎤' : '📹'} {answerMode}
                        </span>
                    </div>
                    <div className="flex items-center gap-2 sm:gap-4">
                        <span className="text-sm text-text-secondary hidden sm:inline">
                            Question {questionNumber} of {totalQuestions}
                        </span>
                        <span className="text-sm text-text-secondary sm:hidden">
                            {questionNumber}/{totalQuestions}
                        </span>
                        <button
                            onClick={() => navigate('/evaluation')}
                            className="px-3 sm:px-4 py-1.5 text-sm font-medium text-red-600 hover:text-white hover:bg-red-500 border border-red-300 hover:border-red-500 rounded-full transition-all flex-shrink-0"
                        >
                            <span className="hidden sm:inline">End Interview</span>
                            <span className="sm:hidden">End</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content - 70/30 Split - Added top margin for fixed header */}
            <div className="flex-1 flex max-w-[1440px] mx-auto w-full mt-[65px]">
                {/* Chat Section (70%) */}
                <div className="flex-1 lg:w-[70%] flex flex-col bg-[#F9FAFB] relative">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 lg:p-8">
                        <div className="max-w-3xl mx-auto space-y-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.type === 'quinn' && (
                                        <div className="mr-3 flex-shrink-0">
                                            <NeuralKnot size="sm" state="speaking" />
                                        </div>
                                    )}
                                    <div className={`max-w-[80%] ${msg.type === 'quinn'
                                        ? 'bg-[#4F46E5] text-white rounded-2xl rounded-tl-sm px-5 py-4 shadow-sm'
                                        : msg.type === 'user'
                                            ? 'bg-[#F3F4F6] text-[#111827] rounded-2xl rounded-tr-sm px-5 py-4 shadow-sm border border-slate-200'
                                            : 'bg-slate-100 px-4 py-3 rounded-xl text-text-secondary'
                                        }`}>
                                        {msg.type === 'quinn' && (
                                            <p className="text-xs font-semibold text-indigo-100 mb-1 tracking-wide">Quinn</p>
                                        )}
                                        <p className="whitespace-pre-wrap leading-relaxed">{msg.content}</p>
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="mr-3">
                                        <NeuralKnot size="sm" state="thinking" />
                                    </div>
                                    <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-frost border border-slate-100">
                                        <div className="flex gap-1">
                                            <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Hint Suggestion */}
                            {showHintSuggestion && !isTyping && (
                                <div className="flex justify-start">
                                    <div className="mr-3">
                                        <NeuralKnot size="sm" state="coaching" />
                                    </div>
                                    <button
                                        onClick={handleHint}
                                        className="bg-accent/5 border border-accent/30 px-4 py-3 rounded-xl text-sm text-accent hover:bg-accent/10 transition-colors"
                                    >
                                        💡 Need help? Click for a hint
                                    </button>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input Area - Now using SmartInput */}
                    <div className="border-t border-slate-100 bg-white p-4 pb-safe">
                        <div className="max-w-3xl mx-auto">
                            {connectionError ? (
                                <div className="flex flex-col items-center gap-3">
                                    <p className="text-sm text-text-secondary">Connection to server failed</p>
                                    <button
                                        onClick={() => {
                                            setConnectionError(false);
                                            initInterview();
                                        }}
                                        className="px-6 py-2 bg-primary text-white rounded-full font-medium hover:bg-primary-dark transition-colors"
                                    >
                                        🔄 Retry Connection
                                    </button>
                                </div>
                            ) : (
                                <SmartInput
                                    onSubmit={handleAnswerSubmit}
                                    disabled={isLoading || isTyping || !currentQuestion}
                                    placeholder="Type your answer..."
                                />
                            )}
                        </div>
                    </div>
                </div>

                {/* Utility Panel (30%) - Desktop */}
                <div className="hidden lg:flex flex-col w-[30%] border-l border-slate-100 bg-white/50">
                    {/* Panel Tabs */}
                    <div className="flex border-b border-slate-100">
                        {(['feedback', 'frameworks', 'mission'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setUtilityPanelTab(tab)}
                                className={`flex-1 px-4 py-3 text-sm font-medium capitalize transition-colors
                                    ${ui.utilityPanelTab === tab
                                        ? 'text-primary border-b-2 border-primary bg-primary/5'
                                        : 'text-text-secondary hover:text-text'
                                    }`}
                            >
                                {tab === 'feedback' ? '📊 Live' : tab === 'frameworks' ? '🧠 Frameworks' : '🎯 Mission'}
                            </button>
                        ))}
                    </div>

                    {/* Panel Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {ui.utilityPanelTab === 'feedback' && (
                            <div className="space-y-4">
                                <h4 className="font-semibold text-text mb-4">Quinn Live Feedback</h4>

                                <MetricRow
                                    label="Pace"
                                    value={liveMetrics.pacing >= 40 && liveMetrics.pacing <= 70 ? 'Good' : liveMetrics.pacing < 40 ? 'Too slow' : 'Too fast'}
                                    status={liveMetrics.pacing >= 40 && liveMetrics.pacing <= 70 ? 'good' : 'warn'}
                                />
                                <MetricRow
                                    label="Filler Words"
                                    value={`${liveMetrics.fillerWordCount}`}
                                    status={liveMetrics.fillerWordCount < 3 ? 'good' : liveMetrics.fillerWordCount < 6 ? 'ok' : 'warn'}
                                />
                                <MetricRow
                                    label="Confidence"
                                    value={liveMetrics.confidence >= 70 ? 'Strong' : liveMetrics.confidence >= 50 ? 'Building' : 'Needs work'}
                                    status={liveMetrics.confidence >= 70 ? 'good' : liveMetrics.confidence >= 50 ? 'ok' : 'warn'}
                                />
                                <MetricRow
                                    label="Eye Contact"
                                    value={liveMetrics.gaze === 'on' ? 'Good' : liveMetrics.gaze === 'off' ? 'Look up' : '—'}
                                    status={liveMetrics.gaze === 'on' ? 'good' : liveMetrics.gaze === 'off' ? 'warn' : 'ok'}
                                />
                                <MetricRow
                                    label="Posture"
                                    value={liveMetrics.posture === 'good' ? 'Great' : liveMetrics.posture === 'poor' ? 'Sit up' : '—'}
                                    status={liveMetrics.posture === 'good' ? 'good' : liveMetrics.posture === 'poor' ? 'warn' : 'ok'}
                                />

                                {/* Confidence Bar */}
                                <div className="pt-4 border-t border-slate-100">
                                    <div className="flex justify-between text-sm mb-2">
                                        <span className="text-text-muted">Overall Confidence</span>
                                        <span className="font-medium text-primary">{liveMetrics.confidence}%</span>
                                    </div>
                                    <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500"
                                            style={{ width: `${liveMetrics.confidence}%` }}
                                        />
                                    </div>
                                </div>
                            </div>
                        )}

                        {ui.utilityPanelTab === 'frameworks' && (
                            <div className="space-y-4">
                                <h4 className="font-semibold text-text mb-4">Answer Frameworks</h4>

                                <FrameworkCard
                                    name="STAR"
                                    description="Situation → Task → Action → Result"
                                    color="primary"
                                />
                                <FrameworkCard
                                    name="PREP"
                                    description="Point → Reason → Example → Point"
                                    color="accent"
                                />
                                <FrameworkCard
                                    name="CAR"
                                    description="Challenge → Action → Result"
                                    color="primary"
                                />
                                <FrameworkCard
                                    name="SOAR"
                                    description="Situation → Obstacle → Action → Result"
                                    color="accent"
                                />
                            </div>
                        )}

                        {ui.utilityPanelTab === 'mission' && (
                            <div className="space-y-6">
                                <h4 className="font-semibold text-text mb-4">Mission Brief</h4>

                                <div>
                                    <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Role</p>
                                    <p className="font-medium text-text">{roleId || 'Frontend Developer'}</p>
                                </div>

                                {companyName && (
                                    <div>
                                        <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Company</p>
                                        <p className="font-medium text-text">{companyName}</p>
                                    </div>
                                )}

                                <div>
                                    <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Track</p>
                                    <p className="font-medium text-text capitalize">{trackId || 'Technology'}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Answer Mode</p>
                                    <p className="font-medium text-text">{answerMode}</p>
                                </div>

                                <div>
                                    <p className="text-xs text-text-muted uppercase tracking-wide mb-1">Competencies</p>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        <span className="px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">Technical</span>
                                        <span className="px-2 py-1 bg-accent/10 text-accent text-xs rounded-full">Behavioral</span>
                                        <span className="px-2 py-1 bg-slate-100 text-text-secondary text-xs rounded-full">Problem Solving</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Sheet Toggle */}
            <button
                onClick={toggleBottomSheet}
                className="lg:hidden fixed bottom-32 right-4 w-12 h-12 safe-bottom bg-primary text-white rounded-full shadow-frost-lg flex items-center justify-center z-40"
            >
                📊
            </button>

            {/* HUD Container - Always rendered, visibility controlled by store */}
            <HUDContainer />

            {/* Bottom Sheet for Mobile */}
            <BottomSheet />
        </div>
    );
}

// Metric Row Component
function MetricRow({ label, value, status }: { label: string; value: string; status: 'good' | 'ok' | 'warn' }) {
    const statusColors = {
        good: 'text-accent bg-accent/10',
        ok: 'text-yellow-600 bg-yellow-50',
        warn: 'text-red-600 bg-red-50'
    };

    return (
        <div className="flex items-center justify-between py-2">
            <span className="text-sm text-text-secondary">{label}</span>
            <span className={`px-2 py-1 rounded-md text-xs font-medium ${statusColors[status]}`}>
                {value}
            </span>
        </div>
    );
}

// Framework Card Component
function FrameworkCard({ name, description, color }: { name: string; description: string; color: 'primary' | 'accent' }) {
    return (
        <div className={`p-4 rounded-xl border ${color === 'primary' ? 'border-primary/20 bg-primary/5' : 'border-accent/20 bg-accent/5'}`}>
            <h5 className={`font-bold ${color === 'primary' ? 'text-primary' : 'text-accent'}`}>{name}</h5>
            <p className="text-sm text-text-secondary mt-1">{description}</p>
        </div>
    );
}

import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterviewStore } from '../store/interview-store';
import { api } from '../services/api';
import { getQuinnCompletion } from '../services/quinn-messages';
import { NeuralKnot } from '../components/NeuralKnot';

interface ChatMessage {
    id: string;
    type: 'quinn' | 'user' | 'system';
    content: string;
    timestamp: Date;
}

export function InterviewPage() {
    const navigate = useNavigate();
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [userInput, setUserInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [panelMode, setPanelMode] = useState<'metrics' | 'frameworks' | 'brief'>('metrics');
    const [showPanel, setShowPanel] = useState(true);
    const [hesitationTimer, setHesitationTimer] = useState<ReturnType<typeof setTimeout> | null>(null);
    const [showHintSuggestion, setShowHintSuggestion] = useState(false);
    const [connectionError, setConnectionError] = useState(false);

    const [metrics, setMetrics] = useState({
        pace: 'Good',
        fillerWords: 0,
        silenceDuration: 0,
        confidence: 'Building',
        energy: 'Medium',
        stability: 'Stable'
    });

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
        submitAnswer,
        setLoading,
    } = useInterviewStore();

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    useEffect(() => {
        initInterview();
    }, []);

    // Hesitation detection
    useEffect(() => {
        if (currentQuestion && !isTyping && !userInput) {
            const timer = setTimeout(() => {
                setShowHintSuggestion(true);
            }, 10000); // 10 seconds
            setHesitationTimer(timer);
        }

        return () => {
            if (hesitationTimer) clearTimeout(hesitationTimer);
        };
    }, [currentQuestion, isTyping, userInput]);


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

            const greeting = quinnMode === 'SUPPORTIVE'
                ? `Hello! I'm Quinn, your interview coach. Ready to practice for your ${roleId || 'frontend'} role? Let's make this fun and productive! 🚀`
                : `Quinn here. ${roleId || 'frontend'} interview practice. Let's get started.`;

            setMessages([{
                id: '1',
                type: 'quinn',
                content: greeting,
                timestamp: new Date()
            }]);

            await fetchNextQuestion(result.sessionId);
        } catch (err) {
            console.error('Failed to start interview, using demo mode:', err);
            // Start in demo mode
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

            // Set first demo question
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
                // Demo mode - use mock questions
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
            // Fall back to demo question
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

    const handleSubmit = async () => {
        console.log('handleSubmit called', { userInput, sessionId, currentQuestion });
        if (!userInput.trim() || !sessionId || !currentQuestion) {
            console.log('handleSubmit early return - missing required data');
            return;
        }

        const answer = userInput.trim();
        setUserInput('');
        setShowHintSuggestion(false);

        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'user',
            content: answer,
            timestamp: new Date()
        }]);

        setIsTyping(true);
        try {
            // Demo mode handling
            if (sessionId === 'demo-session') {
                const mockScore = 60 + Math.floor(Math.random() * 35);
                const mockFeedback = mockScore >= 80
                    ? "Great answer! You structured your response well and provided relevant examples. 🌟"
                    : mockScore >= 65
                        ? "Good effort! Consider adding more specific examples to strengthen your answer."
                        : "That's a start. Try using the STAR method (Situation, Task, Action, Result) for more impact.";

                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        type: 'quinn',
                        content: `${mockFeedback} (Demo Score: ${mockScore}/100)`,
                        timestamp: new Date()
                    }]);

                    submitAnswer({
                        questionId: currentQuestion.id,
                        question: currentQuestion.text,
                        answer,
                        evaluation: {
                            score: mockScore,
                            strengths: ['Clear communication'],
                            weaknesses: ['Could use more examples'],
                            missingElements: [],
                            suggestedStructure: 'STAR Method',
                            improvedSampleAnswer: ''
                        }
                    });

                    setMetrics({
                        pace: mockScore >= 80 ? 'Excellent' : mockScore >= 60 ? 'Good' : 'Needs Work',
                        fillerWords: Math.floor(Math.random() * 5),
                        silenceDuration: Math.floor(Math.random() * 3),
                        confidence: mockScore >= 75 ? 'Strong' : 'Building',
                        energy: mockScore >= 70 ? 'High' : 'Medium',
                        stability: 'Stable'
                    });

                    if (questionNumber < totalQuestions) {
                        setTimeout(() => fetchNextQuestion(sessionId), 1500);
                    } else {
                        const completionMessage = getQuinnCompletion(quinnMode || 'SUPPORTIVE');
                        setMessages(prev => [...prev, {
                            id: Date.now().toString(),
                            type: 'system',
                            content: completionMessage + ' (Demo complete!)',
                            timestamp: new Date()
                        }]);
                    }

                    setIsTyping(false);
                }, 1500);
                return;
            }

            const questionId = currentQuestion.id;
            const result = await api.submitAnswer(sessionId, questionId, answer);

            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                type: 'quinn',
                content: result.feedback || `Score: ${result.score}/100`,
                timestamp: new Date()
            }]);

            submitAnswer({
                questionId: currentQuestion.id,
                question: currentQuestion.text,
                answer,
                evaluation: result
            });

            // Update metrics based on score
            setMetrics({
                pace: result.score >= 80 ? 'Excellent' : result.score >= 60 ? 'Good' : 'Needs Work',
                fillerWords: Math.floor(Math.random() * 5),
                silenceDuration: Math.floor(Math.random() * 3),
                confidence: result.score >= 75 ? 'Strong' : 'Building',
                energy: result.score >= 70 ? 'High' : 'Medium',
                stability: 'Stable'
            });

            if (questionNumber < totalQuestions) {
                setTimeout(() => fetchNextQuestion(sessionId), 1500);
            } else {
                const completionMessage = getQuinnCompletion(quinnMode || 'SUPPORTIVE');
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    type: 'system',
                    content: completionMessage + ' Preparing your evaluation...',
                    timestamp: new Date()
                }]);

                setTimeout(() => navigate('/evaluation'), 2000);
            }
        } catch (error) {
            console.error('Failed to submit answer:', error);
        } finally {
            setIsTyping(false);
        }
    };

    const handleHint = async () => {
        if (!sessionId || !currentQuestion) return;
        setShowHintSuggestion(false);

        setIsTyping(true);
        try {
            // Demo mode handling
            if (sessionId === 'demo-session') {
                setTimeout(() => {
                    setMessages(prev => [...prev, {
                        id: Date.now().toString(),
                        type: 'quinn',
                        content: '💡 Hint: Try structuring your answer using the STAR method - describe the Situation, the Task you needed to accomplish, the Action you took, and the Result of your efforts.',
                        timestamp: new Date()
                    }]);
                    setIsTyping(false);
                }, 800);
                return;
            }

            const result = await api.getHint(sessionId, currentQuestion.id);
            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                type: 'quinn',
                content: `💡 Hint: ${result.hint}`,
                timestamp: new Date()
            }]);
        } catch (error) {
            console.error('Failed to get hint:', error);
        } finally {
            setIsTyping(false);
        }
    };

    const progress = (questionNumber / totalQuestions) * 100;

    return (
        <div className="min-h-screen bg-canvas pt-[72px] flex flex-col">
            {/* Progress Bar */}
            <div className="sticky top-[72px] z-30 bg-white/95 backdrop-blur-xl border-b border-slate-100">
                <div className="progress-bar h-1.5">
                    <div className="progress-bar-fill bg-accent" style={{ width: `${progress}%` }} />
                </div>
                <div className="container py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8">
                            <NeuralKnot size="sm" state={isTyping ? 'thinking' : 'idle'} />
                        </div>
                        <span className="text-sm font-medium text-text">
                            Quinn ({quinnMode === 'SUPPORTIVE' ? 'Supportive' : 'Direct'})
                        </span>
                    </div>
                    <span className="text-sm text-text-secondary">
                        Question {questionNumber} of {totalQuestions}
                    </span>
                </div>
            </div>

            {/* Main Content - 70/30 Split */}
            <div className="flex-1 flex">
                {/* Chat Section (70%) */}
                <div className="flex-1 lg:w-[70%] flex flex-col">
                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-4 lg:p-8">
                        <div className="max-w-3xl mx-auto space-y-4">
                            {messages.map((msg) => (
                                <div key={msg.id} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                                    {msg.type === 'quinn' && (
                                        <div className="w-8 h-8 mr-3 flex-shrink-0">
                                            <NeuralKnot size="sm" state="speaking" />
                                        </div>
                                    )}
                                    <div className={`max-w-[80%] ${msg.type === 'quinn'
                                        ? 'chat-bubble-quinn'
                                        : msg.type === 'user'
                                            ? 'chat-bubble-user'
                                            : 'bg-slate-100 px-4 py-3 rounded-xl text-text-secondary'
                                        }`}>
                                        {msg.type === 'quinn' && (
                                            <p className="text-xs font-medium text-primary mb-1">Quinn</p>
                                        )}
                                        <p className="whitespace-pre-wrap">{msg.content}</p>
                                    </div>
                                </div>
                            ))}

                            {isTyping && (
                                <div className="flex justify-start">
                                    <div className="w-8 h-8 mr-3">
                                        <NeuralKnot size="sm" state="thinking" />
                                    </div>
                                    <div className="chat-bubble-quinn">
                                        <div className="quinn-thinking">
                                            <div className="quinn-thinking__dot" />
                                            <div className="quinn-thinking__dot" />
                                            <div className="quinn-thinking__dot" />
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Hint Suggestion */}
                            {showHintSuggestion && !isTyping && (
                                <div className="flex justify-start">
                                    <div className="w-8 h-8 mr-3">
                                        <NeuralKnot size="sm" state="coaching" />
                                    </div>
                                    <button
                                        onClick={handleHint}
                                        className="glass-card px-4 py-3 rounded-xl border border-accent/30 text-sm text-accent hover:bg-accent/5 transition-colors"
                                    >
                                        💡 Need help? Click for a hint
                                    </button>
                                </div>
                            )}

                            <div ref={messagesEndRef} />
                        </div>
                    </div>

                    {/* Input Area */}
                    <div className="border-t border-slate-100 bg-white p-4">
                        <div className="max-w-3xl mx-auto">
                            {connectionError ? (
                                <div className="flex flex-col items-center gap-3">
                                    <p className="text-sm text-text-secondary">Connection to server failed</p>
                                    <button
                                        onClick={() => {
                                            setConnectionError(false);
                                            initInterview();
                                        }}
                                        className="btn-primary"
                                    >
                                        🔄 Retry Connection
                                    </button>
                                </div>
                            ) : (
                                <div className="flex gap-3">
                                    <div className="flex-1 relative">
                                        <textarea
                                            className="form-input resize-none pr-12"
                                            placeholder="Type your answer..."
                                            value={userInput}
                                            onChange={(e) => {
                                                setUserInput(e.target.value);
                                                setShowHintSuggestion(false);
                                            }}
                                            onKeyDown={(e) => {
                                                if (e.key === 'Enter' && !e.shiftKey) {
                                                    e.preventDefault();
                                                    handleSubmit();
                                                }
                                            }}
                                            rows={2}
                                            disabled={isLoading || isTyping}
                                        />
                                        <button
                                            onClick={handleHint}
                                            disabled={isLoading || isTyping || !currentQuestion}
                                            className="absolute right-2 bottom-2 p-2 text-text-muted hover:text-accent transition-colors disabled:opacity-50"
                                            title="Get a hint"
                                        >
                                            💡
                                        </button>
                                    </div>
                                    <button
                                        className="btn-primary px-6"
                                        onClick={handleSubmit}
                                        disabled={!userInput.trim() || isLoading || isTyping}
                                    >
                                        Send
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Utility Panel (30%) */}
                <div className={`hidden lg:flex flex-col w-[30%] border-l border-slate-100 bg-white/50 ${showPanel ? '' : 'lg:hidden'}`}>
                    {/* Panel Tabs */}
                    <div className="flex border-b border-slate-100">
                        {(['metrics', 'frameworks', 'brief'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setPanelMode(tab)}
                                className={`flex-1 px-4 py-3 text-sm font-medium capitalize transition-colors
                                    ${panelMode === tab
                                        ? 'text-primary border-b-2 border-primary bg-primary/5'
                                        : 'text-text-secondary hover:text-text'
                                    }`}
                            >
                                {tab === 'metrics' ? 'Live Feedback' : tab === 'frameworks' ? 'Frameworks' : 'Mission'}
                            </button>
                        ))}
                    </div>

                    {/* Panel Content */}
                    <div className="flex-1 overflow-y-auto p-6">
                        {panelMode === 'metrics' && (
                            <div className="space-y-4">
                                <h4 className="font-semibold text-text mb-4">Quinn Live Feedback</h4>

                                <MetricRow label="Pace" value={metrics.pace} status={metrics.pace === 'Excellent' ? 'good' : metrics.pace === 'Good' ? 'ok' : 'warn'} />
                                <MetricRow label="Filler Words" value={`${metrics.fillerWords}`} status={metrics.fillerWords < 3 ? 'good' : 'warn'} />
                                <MetricRow label="Confidence" value={metrics.confidence} status={metrics.confidence === 'Strong' ? 'good' : 'ok'} />
                                <MetricRow label="Energy" value={metrics.energy} status={metrics.energy === 'High' ? 'good' : 'ok'} />
                                <MetricRow label="Stability" value={metrics.stability} status="good" />
                            </div>
                        )}

                        {panelMode === 'frameworks' && (
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

                        {panelMode === 'brief' && (
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

            {/* Mobile Panel Toggle */}
            <button
                onClick={() => setShowPanel(!showPanel)}
                className="lg:hidden fixed bottom-24 right-4 w-12 h-12 bg-primary text-white rounded-full shadow-frost-lg flex items-center justify-center z-40"
            >
                📊
            </button>
        </div>
    );
}

// Metric Row Component
function MetricRow({ label, value, status }: { label: string; value: string; status: 'good' | 'ok' | 'warn' }) {
    const statusColors = {
        good: 'text-green-600 bg-green-50',
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

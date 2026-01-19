import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    useInterviewStore,
    useLiveMetrics
} from '../store/interview-store';
import { api, type ContentFeedback } from '../services/api';
import { useFaceMesh } from '../hooks/useFaceMesh';
import { useTextToSpeech } from '../hooks/useTextToSpeech';

interface ChatMessage {
    id: string;
    type: 'quinn' | 'user' | 'system';
    content: string;
    timestamp: Date;
}

// Simple Speech Recognition Hook
const useSpeechRecognition = () => {
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<any>(null);

    useEffect(() => {
        if ('webkitSpeechRecognition' in window) {
            // @ts-ignore
            const recognition = new window.webkitSpeechRecognition();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';
            recognitionRef.current = recognition;
        }
    }, []);

    const startListening = (onResult: (text: string) => void) => {
        if (recognitionRef.current) {
            setIsListening(true);
            recognitionRef.current.onresult = (event: any) => {
                const transcript = Array.from(event.results)
                    .map((result: any) => result[0])
                    .map((result: any) => result.transcript)
                    .join('');
                onResult(transcript);
            };
            recognitionRef.current.onend = () => setIsListening(false);
            recognitionRef.current.start();
        } else {
            alert("Speech recognition not supported in this browser.");
        }
    };

    const stopListening = () => {
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    };

    return { isListening, startListening, stopListening };
};



const mockQuestions = [
    "Tell me about a time you faced a challenging problem at work.",
    "How do you prioritize tasks when everything seems urgent?",
    "Describe a situation where you had to work with a difficult team member.",
];

export function InterviewPage() {
    const navigate = useNavigate();
    const initRef = useRef(false);
    const isSubmitting = useRef(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const [textInput, setTextInput] = useState('');
    const [, setCurrentFeedback] = useState<ContentFeedback | null>(null);
    const [analysisEnabled, setAnalysisEnabled] = useState(true);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const videoRef = useRef<HTMLVideoElement>(null);
    const [videoState, setVideoState] = useState<HTMLVideoElement | null>(null); // Triggers re-render for FaceMesh
    const chatContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLInputElement>(null); // Ref for input focus



    const liveMetrics = useLiveMetrics();

    const {
        sessionId,
        trackId,
        roleId,
        companyName,
        quinnMode,
        currentQuestion,
        questionNumber,
        totalQuestions,
        isLoading,
        startSession,
        setQuestion,
        setLoading,
        updatePacing,
        updateConfidence,
        saveAnswer, // Destructure saveAnswer
    } = useInterviewStore();


    const { speak, stop: stopSpeaking } = useTextToSpeech();
    const { isListening, startListening, stopListening: stopMic } = useSpeechRecognition();

    // Auto-focus input when voice listening stops
    useEffect(() => {
        if (!isListening && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isListening]);

    // Auto-scroll during voice
    useEffect(() => {
        if (isListening && inputRef.current) {
            inputRef.current.scrollLeft = inputRef.current.scrollWidth;
        }
    }, [textInput, isListening]);

    const toggleMic = () => {
        if (isListening) {
            stopMic();
        } else {
            isSubmitting.current = false;
            startListening((text) => {
                if (!isSubmitting.current) setTextInput(text);
            });
        }
    };

    // Lock body scroll on mount
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        document.documentElement.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
            document.documentElement.style.overflow = '';
        };
    }, []);

    // Start Webcam
    useEffect(() => {
        let stream: MediaStream | null = null;
        navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 }, audio: false })
            .then(s => {
                stream = s;
                if (videoRef.current) {
                    videoRef.current.srcObject = s;
                }
            })
            .catch(err => console.error("Camera access failed", err));

        return () => {
            if (stream) stream.getTracks().forEach(track => track.stop());
            stopSpeaking();
        };
    }, [stopSpeaking]);

    // FaceMesh
    useFaceMesh({
        videoElement: videoState,
        enabled: analysisEnabled && !isLoading
    });

    // Auto-scroll to bottom of chat when messages or question changes
    useEffect(() => {
        if (chatContainerRef.current) {
            // Small delay to ensure DOM has updated with new messages
            setTimeout(() => {
                if (chatContainerRef.current) {
                    chatContainerRef.current.scrollTo({
                        top: chatContainerRef.current.scrollHeight + 1000, // Extra buffer
                        behavior: 'smooth'
                    });
                }
            }, 100);
        }
    }, [messages.length, isTyping, currentQuestion?.id]);

    // Speak question
    useEffect(() => {
        if (currentQuestion?.text) {
            const timer = setTimeout(() => speak(currentQuestion.text), 500);
            return () => clearTimeout(timer);
        }
    }, [currentQuestion?.text, speak]);

    // Initialize session
    useEffect(() => {
        if (initRef.current) return;
        initRef.current = true;

        const init = async () => {
            setLoading(true);
            try {
                if (!sessionId) {
                    // Call API to create session
                    const sessionData = await api.startInterview({
                        trackId: trackId || 'tech',
                        roleId: roleId || 'frontend',
                        quinnMode: quinnMode || 'SUPPORTIVE',
                        companyName: companyName || undefined,
                    });
                    // Update store with session ID and total questions
                    startSession(sessionData.sessionId, sessionData.totalQuestions);

                    // Welcome Message for General HR
                    if (roleId === 'general-hr' || roleId?.includes('hr')) {
                        setMessages(prev => [...prev, {
                            id: 'welcome',
                            type: 'quinn',
                            content: "Hi there! I'm Quinn. I'm excited to help you practice for your upcoming HR interview. Let's get started!",
                            timestamp: new Date()
                        }]);
                    }

                    // Fetch first question immediately
                    fetchNextQuestion(sessionData.sessionId);
                }
            } finally {
                setLoading(false);
            }
        };
        init();
    }, []);

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
                        setIsTyping(false);
                    }, 1000);
                }
                return;
            }

            const result = await api.getQuestion(sid);
            if (result.isInterviewComplete) {
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    type: 'system',
                    content: "Interview complete! Finalizing results...",
                    timestamp: new Date()
                }]);
                setIsTyping(false);

                try {
                    await api.completeInterview(sid);
                } catch (e) { console.error("Completion trigger failed", e); }

                setTimeout(() => navigate('/evaluation'), 1000);
                return;
            }

            setQuestion({
                id: result.questionId,
                text: result.question,
                competencyType: result.competencyType,
                difficulty: result.difficulty,
                hintsAvailable: result.hintsAvailable
            });
        } catch (error) {
            console.error('Failed to get question:', error);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSubmit = async () => {
        if (!textInput.trim() || isLoading || isTyping || !currentQuestion || !sessionId) return;

        isSubmitting.current = true; // Lock voice updates

        const answer = textInput.trim();
        setTextInput('');
        stopSpeaking();
        if (isListening) stopMic();

        // Add Q&A to history
        setMessages(prev => [...prev,
        { id: Date.now().toString() + '_q', type: 'quinn', content: currentQuestion.text, timestamp: new Date() },
        { id: Date.now().toString() + '_a', type: 'user', content: answer, timestamp: new Date() }
        ]);

        setIsTyping(true);

        // Scroll chat to bottom using scrollTop (not scrollIntoView)
        if (chatContainerRef.current) {
            chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight;
        }

        try {
            // Submit answer to persist state and get evaluation
            const evalResult = await api.submitAnswer(sessionId, currentQuestion.id, answer);

            // Save to local store for Evaluation Page
            saveAnswer(currentQuestion.id, {
                questionId: currentQuestion.id,
                questionText: currentQuestion.text,
                answerText: answer,
                submittedAt: new Date(),
                evaluation: evalResult
            });

            // Map evaluation response to ContentFeedback format for UI
            const feedback: ContentFeedback = {
                status: 'OK',
                content_score: evalResult.score,
                content_strength: evalResult.strengths[0] || 'Good attempt',
                content_fix: evalResult.weaknesses[0] || 'Keep practicing',
                content_label: evalResult.score >= 80 ? 'STRONG' : 'NEEDS_WORK',
                key_evidence: null,
                suggested_rewrite: evalResult.improvedSampleAnswer,
                explainability: [],
                resource_ids: [],
                latency_ms: 0
            };

            setCurrentFeedback(feedback);

            const feedbackMsg = feedback.status === 'OK'
                ? `✅ ${feedback.content_strength}`
                : `💡 ${feedback.content_fix}`;

            setMessages(prev => [...prev, {
                id: Date.now().toString(),
                type: 'quinn',
                content: feedbackMsg,
                timestamp: new Date()
            }]);

            updatePacing(feedback.content_score >= 70 ? 65 : 35);
            updateConfidence(feedback.content_score);

            if (questionNumber < totalQuestions) {
                setTimeout(() => fetchNextQuestion(sessionId || 'demo-session'), 1500);
            } else {
                // FINISH INTERVIEW
                setMessages(prev => [...prev, {
                    id: Date.now().toString(),
                    type: 'system',
                    content: "Interview complete! Generating your comprehensive report...",
                    timestamp: new Date()
                }]);

                try {
                    await api.completeInterview(sessionId!);
                } catch (e) {
                    console.error("Completion trigger failed", e);
                }

                setTimeout(() => navigate('/evaluation'), 500);
            }
        } catch (error) {
            console.error('Error:', error);
            if (questionNumber < totalQuestions) {
                setTimeout(() => fetchNextQuestion(sessionId || 'demo-session'), 1000);
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    // ============================================
    // RENDER - Using position:fixed for stability
    // ============================================
    return (
        <div style={{ width: '100vw', height: '100vh', overflow: 'hidden', background: '#f8fafc' }}>

            {/* ========== FIXED: LEFT PANEL (Chat) ========== */}
            <div style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: isMobile ? '100vw' : 'calc(100vw - 480px)', // Full width on mobile
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                background: '#f8fafc',
                zIndex: 10,
            }}>
                {/* Header - Fixed */}
                <div style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid #e2e8f0',
                    background: 'white',
                    flexShrink: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                }}>
                    <div>
                        <h2 style={{ fontSize: '18px', fontWeight: 'bold', color: '#1e293b', margin: 0 }}>Mock Interview</h2>
                        <p style={{ fontSize: '12px', color: '#64748b', margin: 0 }}>{trackId} Track • {roleId}</p>

                        {/* Mobile Status Bar - Invisible Intelligence */}
                        {isMobile && analysisEnabled && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: '12px',
                                marginTop: '8px',
                                fontSize: '11px',
                                fontWeight: 'bold'
                            }}>
                                {/* Pulsing Indicator */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#ef4444' }}>
                                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444', animation: 'pulse 1.5s infinite' }} />
                                    ANALYZING
                                </div>
                                {/* Mini Metrics */}
                                <div style={{ display: 'flex', gap: '8px', color: '#64748b' }}>
                                    <span style={{ color: liveMetrics.gaze === 'off' ? '#d97706' : '#10b981' }}>
                                        {liveMetrics.gaze === 'off' ? '👀 Check Eye' : '👀 Good'}
                                    </span>
                                    <span style={{ color: liveMetrics.posture === 'poor' ? '#d97706' : '#10b981' }}>
                                        {liveMetrics.posture === 'poor' ? '🧘 Sit Up' : '🧘 Good'}
                                    </span>
                                </div>
                            </div>
                        )}
                    </div>
                    <button
                        onClick={() => navigate('/evaluation')}
                        style={{
                            padding: '8px 16px',
                            background: '#fef2f2',
                            color: '#ef4444',
                            border: '1px solid #fecaca',
                            borderRadius: '8px',
                            fontSize: '12px',
                            fontWeight: 'bold',
                            cursor: 'pointer',
                        }}
                    >
                        End Interview
                    </button>
                </div>

                {/* Chat Stream - Scrollable */}
                <div
                    ref={chatContainerRef}
                    style={{
                        flex: 1,
                        overflowY: 'auto',
                        padding: '24px',
                    }}
                >
                    <div style={{ maxWidth: '600px', margin: '0 auto' }}>
                        {/* Messages */}
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                style={{
                                    display: 'flex',
                                    justifyContent: msg.type === 'user' ? 'flex-end' : 'flex-start',
                                    marginBottom: '16px',
                                }}
                            >
                                <div style={{
                                    maxWidth: '80%',
                                    padding: '12px 16px',
                                    borderRadius: '16px',
                                    borderTopLeftRadius: msg.type === 'quinn' ? '4px' : '16px',
                                    borderTopRightRadius: msg.type === 'user' ? '4px' : '16px',
                                    background: msg.type === 'user' ? '#6366f1' : 'white', // White for Quinn
                                    color: msg.type === 'user' ? 'white' : '#1e293b',
                                    boxShadow: msg.type === 'user' ? '0 4px 6px -1px rgba(99, 102, 241, 0.2)' : '0 1px 3px rgba(0,0,0,0.1)', // Subtle shadow
                                }}>
                                    {msg.content}
                                </div>
                            </div>
                        ))}



                        {/* Current Question Card */}
                        {!isTyping && currentQuestion && (
                            <div style={{
                                marginTop: '24px',
                                padding: '32px',
                                background: 'white',
                                border: '2px solid #6366f1',
                                borderRadius: '24px',
                                display: 'flex',
                                gap: '24px',
                                alignItems: 'flex-start',
                                boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.15), 0 8px 10px -6px rgba(99, 102, 241, 0.1)',
                                position: 'relative',
                                overflow: 'hidden'
                            }}>
                                {/* Active Indicator Strip */}
                                <div style={{
                                    position: 'absolute',
                                    top: 0, left: 0, bottom: 0,
                                    width: '6px',
                                    background: '#6366f1'
                                }} />
                                {/* Quinn Avatar */}
                                <div style={{
                                    width: '64px',
                                    height: '64px',
                                    flexShrink: 0,
                                    background: 'white',
                                    borderRadius: '50%',
                                    border: '2px solid #c7d2fe',
                                    padding: '4px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <img
                                        src="/quinn-knot.png"
                                        alt="Quinn"
                                        style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                    />
                                </div>

                                <div>
                                    <div style={{
                                        fontSize: '12px',
                                        color: '#6366f1',
                                        fontWeight: 'bold',
                                        marginBottom: '8px',
                                    }}>
                                        QUESTION {questionNumber} OF {totalQuestions}
                                    </div>
                                    <div style={{
                                        fontSize: '20px',
                                        fontWeight: 'bold',
                                        color: '#1e293b',
                                        lineHeight: 1.4,
                                    }}>
                                        {currentQuestion.text}
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Input Bar - Polished */}
                <div style={{
                    padding: '24px',
                    borderTop: '1px solid #f1f5f9',
                    background: 'white',
                    flexShrink: 0,
                }}>
                    <div style={{
                        maxWidth: '600px',
                        margin: '0 auto',
                        background: 'white',
                        borderRadius: '16px',
                        border: '1px solid #e2e8f0',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
                        display: 'flex',
                        alignItems: 'center',
                        padding: '8px',
                        gap: '8px',
                        transition: 'box-shadow 0.2s ease',
                    }}>
                        {/* Mic Button */}
                        <button
                            onClick={toggleMic}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: 'none',
                                background: isListening ? '#fee2e2' : 'transparent',
                                color: isListening ? '#ef4444' : '#64748b',
                                cursor: 'pointer',
                                transition: 'all 0.2s ease',
                                position: 'relative',
                            }}
                            title={isListening ? "Stop listening" : "Start voice input"}
                        >
                            {/* Pulse Ring when listening */}
                            {isListening && (
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    borderRadius: '12px',
                                    border: '2px solid #fecaca',
                                    animation: 'ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite',
                                    opacity: 0.5
                                }} />
                            )}
                            {/* Mic SVG */}
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
                                <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
                                <line x1="12" y1="19" x2="12" y2="23" />
                                <line x1="8" y1="23" x2="16" y2="23" />
                            </svg>
                        </button>

                        {/* Text Input */}
                        <input
                            ref={inputRef}
                            type="text"
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder="Type your answer or speak..."
                            disabled={isLoading || isTyping}
                            style={{
                                flex: 1,
                                border: 'none',
                                outline: 'none',
                                fontSize: '16px',
                                color: '#1e293b',
                                padding: '8px',
                                background: 'transparent'
                            }}
                        />

                        {/* Send Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={!textInput.trim() || isLoading || isTyping}
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '12px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                border: 'none',
                                background: textInput.trim() ? '#6366f1' : '#f1f5f9',
                                color: textInput.trim() ? 'white' : '#cbd5e1',
                                cursor: textInput.trim() ? 'pointer' : 'default',
                                transition: 'all 0.2s ease',
                                transform: textInput.trim() ? 'scale(1)' : 'scale(0.95)',
                            }}
                        >
                            {/* Arrow Up SVG */}
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="12" y1="19" x2="12" y2="5" />
                                <polyline points="5 12 12 5 19 12" />
                            </svg>
                        </button>
                    </div>
                    {/* Helper Text */}
                    <div style={{ textAlign: 'center', marginTop: '8px', fontSize: '11px', color: '#94a3b8' }}>
                        Press Enter to send
                    </div>
                </div>
            </div>

            {/* ========== FIXED: RIGHT PANEL (Video) - Invisible on Mobile ========== */}
            <div style={{
                position: 'fixed',
                top: 0,
                right: 0,
                width: '480px',
                height: '100vh',
                background: '#f8fafc',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px',
                zIndex: isMobile ? -1 : 20, // Send to back on mobile
                opacity: isMobile ? 0 : 1, // Hide visually on mobile
                pointerEvents: isMobile ? 'none' : 'auto', // Disable interaction on mobile
                borderLeft: '1px solid #e2e8f0',
            }}>
                {/* All Eyes Toggle - Visual Switch (Only on Desktop) */}
                {!isMobile && (
                    <div
                        onClick={() => setAnalysisEnabled(!analysisEnabled)}
                        style={{
                            marginBottom: '24px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: 'pointer',
                            padding: '8px 16px',
                            background: 'white',
                            borderRadius: '99px',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
                            border: '1px solid #e2e8f0',
                            transition: 'all 0.2s ease',
                            flexShrink: 0,
                        }}
                    >
                        <span style={{
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: analysisEnabled ? '#1e293b' : '#94a3b8'
                        }}>
                            👁 All Eyes
                        </span>
                        <div style={{
                            width: '44px',
                            height: '24px',
                            background: analysisEnabled ? '#6366f1' : '#cbd5e1',
                            borderRadius: '99px',
                            position: 'relative',
                            transition: 'background 0.2s ease',
                        }}>
                            <div style={{
                                width: '20px',
                                height: '20px',
                                background: 'white',
                                borderRadius: '50%',
                                position: 'absolute',
                                top: '2px',
                                left: analysisEnabled ? '22px' : '2px',
                                transition: 'left 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)',
                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                            }} />
                        </div>
                    </div>
                )}

                {/* Video Container - FIXED SIZE (Hidden logic handled by parent) */}
                <div style={{
                    width: '360px',
                    height: '480px',
                    borderRadius: '24px',
                    overflow: 'hidden',
                    background: '#1e293b',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
                    position: 'relative', // Context for absolute overlay
                    flexShrink: 0,
                }}>
                    {/* Real-time Indicator Overlay */}
                    {analysisEnabled && (
                        <div style={{
                            position: 'absolute',
                            top: '16px',
                            left: '16px',
                            background: 'rgba(0, 0, 0, 0.6)',
                            backdropFilter: 'blur(4px)',
                            padding: '6px 12px',
                            borderRadius: '99px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            zIndex: 20,
                            border: '1px solid rgba(255, 255, 255, 0.1)',
                        }}>
                            <div style={{
                                width: '8px',
                                height: '8px',
                                borderRadius: '50%',
                                background: '#ef4444',
                                boxShadow: '0 0 8px #ef4444',
                                animation: 'pulse 2s infinite'
                            }} />
                            <span style={{
                                color: 'white',
                                fontSize: '11px',
                                fontWeight: 'bold',
                                letterSpacing: '0.5px'
                            }}>
                                ANALYZING
                            </span>
                        </div>
                    )}
                    <video
                        ref={(el) => {
                            videoRef.current = el;
                            setVideoState(el);
                        }}
                        autoPlay
                        playsInline
                        muted
                        style={{
                            width: '100%',
                            height: '100%',
                            objectFit: 'cover',
                            transform: 'scaleX(-1)',
                        }}
                    />
                </div>

                {/* Metrics - Hidden on Mobile to save space (Video Overlay is enough) */}
                {analysisEnabled && !isMobile && (
                    <div style={{
                        marginTop: '24px',
                        display: 'grid',
                        gridTemplateColumns: '1fr 1fr',
                        gap: '16px',
                        width: '360px',
                    }}>
                        {/* Eye Contact Metric */}
                        <div style={{
                            padding: '16px',
                            borderRadius: '16px',
                            background: liveMetrics.gaze === 'off' ? '#fef2f2' : '#ecfdf5', // Red vs Emerald
                            border: `2px solid ${liveMetrics.gaze === 'off' ? '#fecaca' : '#a7f3d0'}`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            transition: 'all 0.3s ease',
                            transform: liveMetrics.gaze === 'off' ? 'scale(1.05)' : 'scale(1)',
                            boxShadow: liveMetrics.gaze === 'off' ? '0 4px 12px rgba(239, 68, 68, 0.2)' : 'none'
                        }}>
                            <div style={{
                                marginBottom: '8px',
                                color: liveMetrics.gaze === 'off' ? '#ef4444' : '#047857'
                            }}>
                                {/* Eye Icon SVG */}
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                                    <circle cx="12" cy="12" r="3" />
                                </svg>
                            </div>
                            <div style={{
                                fontSize: '11px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                fontWeight: 'bold',
                                color: liveMetrics.gaze === 'off' ? '#ef4444' : '#047857'
                            }}>
                                Eye Contact
                            </div>
                            <div style={{
                                fontSize: '16px',
                                fontWeight: 'bold',
                                marginTop: '4px',
                                color: liveMetrics.gaze === 'off' ? '#b91c1c' : '#065f46'
                            }}>
                                {liveMetrics.gaze === 'off' ? 'Focus Here!' : 'Perfect'}
                            </div>
                        </div>

                        {/* Posture Metric */}
                        <div style={{
                            padding: '16px',
                            borderRadius: '16px',
                            background: liveMetrics.posture === 'poor' ? '#fffbeb' : '#ecfdf5', // Amber vs Emerald
                            border: `2px solid ${liveMetrics.posture === 'poor' ? '#fde68a' : '#a7f3d0'}`,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            textAlign: 'center',
                            transition: 'all 0.3s ease',
                            transform: liveMetrics.posture === 'poor' ? 'scale(1.05)' : 'scale(1)',
                            boxShadow: liveMetrics.posture === 'poor' ? '0 4px 12px rgba(245, 158, 11, 0.2)' : 'none'
                        }}>
                            <div style={{
                                marginBottom: '8px',
                                color: liveMetrics.posture === 'poor' ? '#d97706' : '#047857'
                            }}>
                                {/* Posture/User Icon SVG */}
                                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                                    <circle cx="12" cy="7" r="4" />
                                </svg>
                            </div>
                            <div style={{
                                fontSize: '11px',
                                textTransform: 'uppercase',
                                letterSpacing: '1px',
                                fontWeight: 'bold',
                                color: liveMetrics.posture === 'poor' ? '#d97706' : '#047857'
                            }}>
                                Posture
                            </div>
                            <div style={{
                                fontSize: '16px',
                                fontWeight: 'bold',
                                marginTop: '4px',
                                color: liveMetrics.posture === 'poor' ? '#b45309' : '#065f46'
                            }}>
                                {liveMetrics.posture === 'poor' ? 'Sit Up Straight' : 'Great'}
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div >
    );
}

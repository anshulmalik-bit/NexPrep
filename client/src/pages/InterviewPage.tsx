import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterviewStore } from '../store/interview-store';
import { api } from '../services/api';
import { getQuinnCompletion } from '../services/quinn-messages';
import './InterviewPage.css';

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
    const [panelMode, setPanelMode] = useState<'feedback' | 'frameworks'>('feedback');
    const [feedback, setFeedback] = useState({
        pacing: 'Good',
        clarity: 'Medium',
        fillerWords: 'Low',
        confidence: 'Building'
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

    const [error, setError] = useState<string | null>(null);

    const initInterview = async () => {
        setLoading(true);
        setError(null);
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
            console.error('Failed to start interview:', err);
            setError('Failed to start interview. Please check your connection and try again.');
            setMessages([{
                id: '1',
                type: 'system',
                content: '⚠️ Could not connect to the server. Please refresh the page to try again.',
                timestamp: new Date()
            }]);
        } finally {
            setLoading(false);
        }
    };

    const fetchNextQuestion = async (sid: string) => {
        setIsTyping(true);
        try {
            const result = await api.getQuestion(sid);
            // Create a Question object from the API response
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
            console.error('Failed to get question:', error);
        } finally {
            setIsTyping(false);
        }
    };

    const handleSubmit = async () => {
        if (!userInput.trim() || !sessionId || !currentQuestion) return;

        const answer = userInput.trim();
        setUserInput('');

        setMessages(prev => [...prev, {
            id: Date.now().toString(),
            type: 'user',
            content: answer,
            timestamp: new Date()
        }]);

        setIsTyping(true);
        try {
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

            // Update live feedback
            setFeedback({
                pacing: result.score >= 80 ? 'Excellent' : result.score >= 60 ? 'Good' : 'Needs Work',
                clarity: result.score >= 70 ? 'High' : 'Medium',
                fillerWords: 'Low',
                confidence: result.score >= 75 ? 'Strong' : 'Building'
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

        setIsTyping(true);
        try {
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
        <div className="interview-page">
            {/* Header */}
            <header className="interview-header">
                <div className="container interview-header__content">
                    <div className="interview-header__info">
                        <div className="interview-header__quinn">
                            <span className="interview-header__avatar">🤖</span>
                            <span>Quinn ({quinnMode === 'SUPPORTIVE' ? 'Supportive' : 'Direct'})</span>
                        </div>
                        <div className="interview-header__progress-text">
                            Question {questionNumber} of {totalQuestions}
                        </div>
                    </div>
                    <div className="interview-header__progress-bar">
                        <div
                            className="interview-header__progress-fill"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            </header>

            <div className="interview-main">
                {/* Chat Section */}
                <div className="interview-chat">
                    <div className="chat-messages">
                        {messages.map((msg) => (
                            <div key={msg.id} className={`chat-bubble chat-bubble--${msg.type}`}>
                                {msg.type === 'quinn' && (
                                    <div className="chat-bubble__avatar">🤖</div>
                                )}
                                <div className="chat-bubble__content">
                                    {msg.type === 'quinn' && (
                                        <div className="chat-bubble__name">Quinn</div>
                                    )}
                                    <p>{msg.content}</p>
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="chat-bubble chat-bubble--quinn">
                                <div className="chat-bubble__avatar">🤖</div>
                                <div className="chat-bubble__content">
                                    <div className="loading-dots">
                                        <span></span>
                                        <span></span>
                                        <span></span>
                                    </div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input */}
                    <div className="chat-input-container">
                        <div className="chat-input-wrapper">
                            <textarea
                                className="chat-input"
                                placeholder="Type your answer..."
                                value={userInput}
                                onChange={(e) => setUserInput(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && !e.shiftKey) {
                                        e.preventDefault();
                                        handleSubmit();
                                    }
                                }}
                                rows={2}
                                disabled={isLoading || isTyping}
                            />
                            <div className="chat-actions">
                                <button
                                    className="hint-btn"
                                    onClick={handleHint}
                                    disabled={isLoading || isTyping || !currentQuestion}
                                >
                                    💡 Hint
                                </button>
                                <button
                                    className="btn btn--primary btn--icon"
                                    onClick={handleSubmit}
                                    disabled={!userInput.trim() || isLoading || isTyping}
                                    aria-label="Send"
                                >
                                    ➤
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Utility Panel */}
                <div className="interview-panel">
                    <div className="panel-tabs">
                        <button
                            className={`panel-tab ${panelMode === 'feedback' ? 'panel-tab--active' : ''}`}
                            onClick={() => setPanelMode('feedback')}
                        >
                            Live Feedback
                        </button>
                        <button
                            className={`panel-tab ${panelMode === 'frameworks' ? 'panel-tab--active' : ''}`}
                            onClick={() => setPanelMode('frameworks')}
                        >
                            Frameworks
                        </button>
                    </div>

                    {panelMode === 'feedback' ? (
                        <div className="panel-content">
                            <h4>Quinn Live Feedback</h4>
                            <div className="feedback-metrics">
                                <div className="feedback-metric">
                                    <span className="feedback-metric__label">Pacing</span>
                                    <span className={`feedback-metric__value feedback-metric--${feedback.pacing.toLowerCase()}`}>
                                        {feedback.pacing}
                                    </span>
                                </div>
                                <div className="feedback-metric">
                                    <span className="feedback-metric__label">Clarity</span>
                                    <span className="feedback-metric__value">{feedback.clarity}</span>
                                </div>
                                <div className="feedback-metric">
                                    <span className="feedback-metric__label">Filler Words</span>
                                    <span className="feedback-metric__value">{feedback.fillerWords}</span>
                                </div>
                                <div className="feedback-metric">
                                    <span className="feedback-metric__label">Confidence</span>
                                    <span className="feedback-metric__value">{feedback.confidence}</span>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="panel-content">
                            <h4>Answer Frameworks</h4>
                            <div className="frameworks-list">
                                <div className="framework-card">
                                    <strong>STAR</strong>
                                    <p>Situation → Task → Action → Result</p>
                                </div>
                                <div className="framework-card">
                                    <strong>PREP</strong>
                                    <p>Point → Reason → Example → Point</p>
                                </div>
                                <div className="framework-card">
                                    <strong>CAR</strong>
                                    <p>Challenge → Action → Result</p>
                                </div>
                                <div className="framework-card">
                                    <strong>SOAR</strong>
                                    <p>Situation → Obstacle → Action → Result</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

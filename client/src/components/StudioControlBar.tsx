import React, { useState, useRef, useEffect } from 'react';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

interface StudioControlBarProps {
    onSubmit: (answer: string) => void;
    disabled?: boolean;
    placeholder?: string;
    className?: string; // Allow custom positioning
}

/**
 * StudioControlBar - Premium glass-morphism control dock.
 * Features: Animated mic, smooth transitions, refined glassmorphism.
 */
export const StudioControlBar: React.FC<StudioControlBarProps> = ({
    onSubmit,
    disabled = false,
    placeholder = "Speak or type your answer...",
    className = "",
}) => {
    const [textInput, setTextInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);
    const timerRef = useRef<number | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const {
        transcript,
        startListening,
        stopListening,
        resetTranscript
    } = useSpeechRecognition();

    useEffect(() => {
        if (transcript && isRecording) {
            setTextInput(transcript);
        }
    }, [transcript, isRecording]);

    useEffect(() => {
        return () => {
            if (timerRef.current) clearInterval(timerRef.current);
            stopListening();
        };
    }, []);

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    const toggleRecording = () => {
        if (isRecording) {
            stopListening();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        } else {
            startListening();
            setIsRecording(true);
            setRecordingTime(0);
            timerRef.current = window.setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);
        }
    };

    const handleSubmit = () => {
        if (textInput.trim() && !disabled) {
            onSubmit(textInput.trim());
            setTextInput('');
            resetTranscript();
            if (isRecording) {
                stopListening();
                setIsRecording(false);
                if (timerRef.current) {
                    clearInterval(timerRef.current);
                    timerRef.current = null;
                }
            }
        }
    };

    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSubmit();
        }
    };

    return (
        <div className={`p-4 md:p-6 pointer-events-none z-20 ${className || 'absolute bottom-0 left-0 right-0'}`}>
            {/* Premium Dock - Light Theme */}
            <div className="pointer-events-auto max-w-3xl mx-auto">
                {/* Recording indicator */}
                {isRecording && (
                    <div className="flex items-center justify-center gap-2 mb-3 animate-fade-in">
                        <div className="flex items-center gap-2 px-4 py-2 bg-red-500/90 backdrop-blur-md rounded-full shadow-lg shadow-red-500/30">
                            <span className="w-2 h-2 bg-white rounded-full animate-pulse" />
                            <span className="text-sm font-medium text-white">Listening... {formatTime(recordingTime)}</span>
                        </div>
                    </div>
                )}

                {/* Main Control Bar - Light */}
                <div className="bg-white/90 backdrop-blur-xl rounded-2xl border border-slate-200 shadow-2xl 
                               overflow-hidden transition-all duration-300 hover:border-indigo-100"
                    style={{ boxShadow: '0 8px 32px rgba(99, 102, 241, 0.1), inset 0 1px 0 rgba(255,255,255,0.8)' }}
                >
                    <div className="flex items-center gap-2 p-2.5">
                        {/* Mic Button */}
                        <button
                            onClick={toggleRecording}
                            disabled={disabled}
                            className={`relative flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center 
                                       transition-all duration-300 transform active:scale-95
                                ${isRecording
                                    ? 'bg-red-500 text-white shadow-lg shadow-red-500/40'
                                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-800'
                                } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
                            title={isRecording ? "Stop Recording" : "Start Recording"}
                        >
                            {isRecording && (
                                <span className="absolute inset-0 rounded-xl bg-red-400 animate-ping opacity-20" />
                            )}
                            <svg className="w-5 h-5 relative" fill="currentColor" viewBox="0 0 20 20">
                                {isRecording ? (
                                    <rect x="6" y="6" width="8" height="8" rx="1" />
                                ) : (
                                    <path d="M7 4a3 3 0 016 0v6a3 3 0 01-6 0V4zm-2 6a5 5 0 0010 0h2a7 7 0 01-6 6.93V19h2v2H7v-2h2v-2.07A7 7 0 013 10h2z" />
                                )}
                            </svg>
                        </button>

                        {/* Input Field - Light */}
                        <div className="flex-1 relative">
                            <input
                                ref={inputRef}
                                type="text"
                                value={textInput}
                                onChange={(e) => setTextInput(e.target.value)}
                                onKeyPress={handleKeyPress}
                                placeholder={isRecording ? "Transcribing..." : placeholder}
                                disabled={disabled}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl 
                                          text-slate-800 placeholder-slate-400 text-sm md:text-base
                                          focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500
                                          focus:bg-white transition-all duration-200 disabled:opacity-50 disabled:bg-slate-50"
                            />
                        </div>

                        {/* Send Button */}
                        <button
                            onClick={handleSubmit}
                            disabled={disabled || !textInput.trim()}
                            className="flex-shrink-0 w-12 h-12 rounded-xl bg-indigo-600 text-white 
                                      flex items-center justify-center transition-all duration-300 transform
                                      hover:bg-indigo-700 active:scale-95
                                      disabled:opacity-40 disabled:cursor-not-allowed disabled:transform-none
                                      shadow-lg shadow-indigo-500/20"
                            title="Send Answer"
                        >
                            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                            </svg>
                        </button>

                        {/* Redundant controls removed */}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default StudioControlBar;

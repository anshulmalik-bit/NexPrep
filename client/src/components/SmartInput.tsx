import React, { useState, useRef, useEffect } from 'react';
import { useInterviewStore, useAnswerMode } from '../store/interview-store';

interface SmartInputProps {
    onSubmit: (answer: string, audioBlob?: Blob, videoBlob?: Blob) => void;
    disabled?: boolean;
    placeholder?: string;
}

/**
 * SmartInput Capsule - Redesigned
 * White card aesthetic with explicit Mic/Text toggle.
 */
export const SmartInput: React.FC<SmartInputProps> = ({
    onSubmit,
    disabled = false,
    placeholder = "Type your answer..."
}) => {
    const answerMode = useAnswerMode();
    const { ui, setHintLoading, setAnswerMode } = useInterviewStore();

    // Local state
    const [textInput, setTextInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);

    // Refs for media
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
        };
    }, []);

    // Format recording time
    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    // Handle text submission
    const handleTextSubmit = () => {
        if (textInput.trim() && !disabled) {
            onSubmit(textInput.trim());
            setTextInput('');
        }
    };

    // Handle key press
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleTextSubmit();
        }
    };

    // Toggle Mode
    const toggleMode = () => {
        if (answerMode === 'TEXT') {
            setAnswerMode('AUDIO');
        } else {
            setAnswerMode('TEXT');
        }
    };

    // Start audio/video recording
    const startRecording = async () => {
        try {
            const constraints: MediaStreamConstraints = {
                audio: true,
                video: answerMode === 'VIDEO',
            };

            const stream = await navigator.mediaDevices.getUserMedia(constraints);
            const mediaRecorder = new MediaRecorder(stream);
            mediaRecorderRef.current = mediaRecorder;
            chunksRef.current = [];

            mediaRecorder.ondataavailable = (e) => {
                if (e.data.size > 0) {
                    chunksRef.current.push(e.data);
                }
            };

            mediaRecorder.onstop = () => {
                const blob = new Blob(chunksRef.current, {
                    type: answerMode === 'VIDEO' ? 'video/webm' : 'audio/webm'
                });

                // Stop all tracks
                stream.getTracks().forEach(track => track.stop());

                if (answerMode === 'VIDEO') {
                    onSubmit('', undefined, blob);
                } else {
                    onSubmit('', blob);
                }
            };

            mediaRecorder.start();
            setIsRecording(true);
            setRecordingTime(0);

            // Start timer
            timerRef.current = window.setInterval(() => {
                setRecordingTime(prev => prev + 1);
            }, 1000);

        } catch (error) {
            console.error('Failed to start recording:', error);
            // Fallback to text if permission denied
            setAnswerMode('TEXT');
        }
    };

    // Stop recording
    const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            setIsRecording(false);

            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
        }
    };

    // Check if we can record
    // const canRecord = answerMode !== 'TEXT'; // Assume permission flow handles prompt

    return (
        <div className="w-full bg-white rounded-2xl border border-slate-300 shadow-sm overflow-hidden transition-all duration-300 hover:shadow-md">
            {/* Input Area */}
            <div className="p-4">
                {answerMode === 'TEXT' ? (
                    // Text Input
                    <div className="relative">
                        <textarea
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={placeholder}
                            disabled={disabled}
                            rows={3}
                            className="w-full pr-12 bg-transparent text-gray-900 placeholder-gray-400 border-none resize-none focus:ring-0 text-base"
                        />
                        {/* Mic Toggle placed inside text area top-right or bottom-right? 
                             Let's keep controls separate below for cleaner look per requirement "Mic button MUST Exist" */}

                        <div className="flex justify-between items-center mt-3 pt-3 border-t border-slate-100">
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={toggleMode}
                                    className="p-2 rounded-full text-gray-500 hover:bg-slate-100 hover:text-indigo-600 transition-colors"
                                    title="Switch to Voice Mode"
                                >
                                    🎤
                                </button>
                                <span className="text-xs text-gray-400 hidden sm:inline">Switch to Voice</span>
                            </div>

                            <button
                                onClick={handleTextSubmit}
                                disabled={disabled || !textInput.trim()}
                                className="px-6 py-2 bg-primary text-white rounded-lg font-medium text-sm
                                         hover:bg-primary-dark transition-colors duration-200
                                         disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                ) : (
                    // Audio/Video Recording
                    <div className="flex items-center justify-between px-2 py-1">
                        <div className="flex items-center gap-4">
                            <button
                                onClick={toggleMode}
                                disabled={isRecording}
                                className="p-2 rounded-full text-indigo-600 bg-indigo-50 hover:bg-indigo-100 transition-colors"
                                title="Switch to Text Mode"
                            >
                                📝
                            </button>

                            <div className="flex flex-col">
                                <span className="text-sm font-semibold text-gray-900">
                                    {isRecording ? 'Recording...' : 'Voice Mode'}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {isRecording ? formatTime(recordingTime) : 'Tap mic to speak'}
                                </span>
                            </div>
                        </div>

                        {/* Main Mic Button */}
                        <div className="relative">
                            {isRecording && (
                                <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75"></span>
                            )}
                            <button
                                onClick={isRecording ? stopRecording : startRecording}
                                disabled={disabled}
                                className={`relative w-12 h-12 rounded-full flex items-center justify-center transition-all duration-200
                                          ${isRecording
                                        ? 'bg-red-500 text-white shadow-red-200'
                                        : 'bg-primary text-white shadow-frost-lg'}
                                          shadow-lg hover:scale-105 active:scale-95`}
                            >
                                <span className="text-xl">
                                    {isRecording ? '⏹' : '🎤'}
                                </span>
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Hint Button (Subtle at bottom) */}
            <div className="px-4 pb-2">
                <button
                    onClick={() => {
                        setHintLoading(true);
                    }}
                    disabled={ui.hintLoading || disabled}
                    className="text-xs text-indigo-600 hover:text-indigo-800 font-medium py-1 px-2 rounded hover:bg-indigo-50 transition-colors inline-flex items-center gap-1"
                >
                    {ui.hintLoading ? '⏳' : '💡'} {ui.hintLoading ? 'Loading hint...' : 'Need a hint?'}
                </button>
            </div>
        </div>
    );
};

export default SmartInput;

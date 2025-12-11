import React, { useState, useRef, useEffect } from 'react';
import { useInterviewStore, useAnswerMode, usePermissions } from '../store/interview-store';

interface SmartInputProps {
    onSubmit: (answer: string, audioBlob?: Blob, videoBlob?: Blob) => void;
    disabled?: boolean;
    placeholder?: string;
}

/**
 * SmartInput Capsule
 * Adaptive input component that switches between TEXT, AUDIO, and VIDEO modes.
 * Reads answerMode and permissions from the centralized store.
 */
export const SmartInput: React.FC<SmartInputProps> = ({
    onSubmit,
    disabled = false,
    placeholder = "Type your answer here..."
}) => {
    const answerMode = useAnswerMode();
    const permissions = usePermissions();
    const { ui, setHintLoading } = useInterviewStore();

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
    const canRecord = answerMode !== 'TEXT' && (
        (answerMode === 'AUDIO' && permissions.microphone === 'granted') ||
        (answerMode === 'VIDEO' && permissions.microphone === 'granted' && permissions.camera === 'granted')
    );

    // Render based on mode
    return (
        <div className="w-full bg-surface rounded-2xl border border-slate-200 shadow-frost overflow-hidden">
            {/* Mode Indicator */}
            <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 border-b border-slate-100">
                <span className={`w-2 h-2 rounded-full ${answerMode === 'TEXT' ? 'bg-primary' :
                    answerMode === 'AUDIO' ? 'bg-accent' :
                        'bg-red-500'
                    }`} />
                <span className="text-sm text-text-secondary font-medium">
                    {answerMode === 'TEXT' && '📝 Text Mode'}
                    {answerMode === 'AUDIO' && '🎤 Audio Mode'}
                    {answerMode === 'VIDEO' && '📹 Video Mode'}
                </span>
                {isRecording && (
                    <span className="ml-auto text-sm text-red-500 font-mono animate-pulse">
                        ● REC {formatTime(recordingTime)}
                    </span>
                )}
            </div>

            {/* Input Area */}
            <div className="p-4">
                {answerMode === 'TEXT' ? (
                    // Text Input
                    <div className="space-y-3">
                        <textarea
                            value={textInput}
                            onChange={(e) => setTextInput(e.target.value)}
                            onKeyPress={handleKeyPress}
                            placeholder={placeholder}
                            disabled={disabled}
                            rows={4}
                            className="w-full px-4 py-3 bg-canvas rounded-xl border border-slate-200 
                                     focus:border-primary focus:ring-2 focus:ring-primary/20 
                                     resize-none transition-all duration-200
                                     disabled:opacity-50 disabled:cursor-not-allowed"
                        />
                        <div className="flex justify-between items-center">
                            <span className="text-xs text-text-muted">
                                {textInput.length} characters
                            </span>
                            <button
                                onClick={handleTextSubmit}
                                disabled={disabled || !textInput.trim()}
                                className="px-6 py-2 bg-primary text-white rounded-full font-medium
                                         hover:bg-primary-dark transition-colors duration-200
                                         disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                ) : (
                    // Audio/Video Recording
                    <div className="flex flex-col items-center py-6 space-y-4">
                        {!canRecord && (
                            <p className="text-sm text-warning text-center">
                                ⚠️ Please complete calibration to enable {answerMode.toLowerCase()} recording
                            </p>
                        )}

                        <button
                            onClick={isRecording ? stopRecording : startRecording}
                            disabled={disabled || !canRecord}
                            className={`w-20 h-20 rounded-full flex items-center justify-center
                                      transition-all duration-300 shadow-lg
                                      ${isRecording
                                    ? 'bg-red-500 hover:bg-red-600 animate-pulse'
                                    : 'bg-accent hover:bg-accent-dark'}
                                      disabled:opacity-50 disabled:cursor-not-allowed`}
                        >
                            {isRecording ? (
                                <span className="w-6 h-6 bg-white rounded" />
                            ) : (
                                <span className="text-3xl text-white">
                                    {answerMode === 'AUDIO' ? '🎤' : '📹'}
                                </span>
                            )}
                        </button>

                        <p className="text-sm text-text-secondary">
                            {isRecording
                                ? 'Click to stop recording'
                                : `Click to start ${answerMode.toLowerCase()} recording`}
                        </p>
                    </div>
                )}
            </div>

            {/* Hint Button */}
            <div className="px-4 pb-4">
                <button
                    onClick={() => {
                        setHintLoading(true);
                        // Hint will be fetched from API
                    }}
                    disabled={ui.hintLoading || disabled}
                    className="w-full py-2 text-sm text-primary hover:text-primary-dark
                             transition-colors duration-200 disabled:opacity-50"
                >
                    {ui.hintLoading ? '⏳ Loading hint...' : '💡 Need help? Click for a hint'}
                </button>
            </div>
        </div>
    );
};

export default SmartInput;

import React, { useState, useRef, useEffect } from 'react';
import { useInterviewStore, useAnswerMode } from '../store/interview-store';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';

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

    // Speech Recognition
    const {
        transcript,
        isListening: _isSpeechActive, // Unused but kept for debugging if needed, or just remove destructuring
        startListening: startSpeech,
        stopListening: stopSpeech,
        resetTranscript
    } = useSpeechRecognition();

    // Local state
    const [textInput, setTextInput] = useState('');
    const [isRecording, setIsRecording] = useState(false);
    const [recordingTime, setRecordingTime] = useState(0);

    // Refs for media
    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const timerRef = useRef<number | null>(null);

    // Ref for latest text input (to avoid stale closures in callbacks)
    const textInputRef = useRef(textInput);

    // Sync transcript to textInput and update Ref
    useEffect(() => {
        if (transcript && isRecording) {
            setTextInput(transcript);
        }
    }, [transcript, isRecording]);

    useEffect(() => {
        textInputRef.current = textInput;
    }, [textInput]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (timerRef.current) {
                clearInterval(timerRef.current);
            }
            if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
                mediaRecorderRef.current.stop();
            }
            stopSpeech();
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
        if (isRecording) {
            stopRecording();
            return;
        }

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
            // Optimization: In TEXT mode, just use SpeechRecognition (dictation)
            // avoiding MediaRecorder/getUserMedia conflict on mobile
            if (answerMode === 'TEXT') {
                startSpeech();
                setIsRecording(true);
                setRecordingTime(0);
                timerRef.current = window.setInterval(() => {
                    setRecordingTime(prev => prev + 1);
                }, 1000);
                return;
            }

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

                const finalAnswer = textInputRef.current; // Use Ref for latest value!

                if (answerMode === 'VIDEO') {
                    onSubmit(finalAnswer, undefined, blob);
                } else {
                    onSubmit(finalAnswer, blob);
                }

                // Clear buffers after submit logic triggers
                resetTranscript();
                setTextInput('');
            };

            mediaRecorder.start();

            // Start speech recognition separately
            startSpeech();

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
        // Handle TEXT mode separately (Dictation only)
        if (answerMode === 'TEXT') {
            stopSpeech();
            setIsRecording(false);
            if (timerRef.current) {
                clearInterval(timerRef.current);
                timerRef.current = null;
            }
            // Do NOT auto-submit. Let user review text and press Send.
            return;
        }

        if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
            mediaRecorderRef.current.stop();
            stopSpeech(); // Stop transcription
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
                <div className="relative">
                    <textarea
                        value={textInput}
                        onChange={(e) => setTextInput(e.target.value)}
                        onKeyPress={handleKeyPress}
                        placeholder={answerMode === 'TEXT' ? placeholder : isRecording ? "Listening..." : "Tap the mic to start speaking..."}
                        disabled={disabled || (isRecording && answerMode !== 'TEXT')}
                        rows={3}
                        className="w-full pr-12 bg-transparent text-gray-900 placeholder-gray-400 border-none resize-none focus:outline-none focus:ring-2 focus:ring-primary/30 rounded-lg text-base"
                    />

                    {/* Controls Area */}
                    <div className="flex justify-end items-center mt-2 pt-2 border-t border-slate-100">
                        {/* Recording Status (Left side) */}
                        <div className="flex-1">
                            {isRecording && (
                                <div className="flex items-center gap-2 animate-pulse">
                                    <span className="w-2 h-2 bg-red-500 rounded-full"></span>
                                    <span className="text-xs font-semibold text-red-500">
                                        Recording {formatTime(recordingTime)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex items-center gap-3">
                            {/* Mic Button - Always visible */}
                            <div className="relative">
                                {isRecording && (
                                    <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75"></span>
                                )}
                                <button
                                    onClick={isRecording ? stopRecording : startRecording}
                                    disabled={disabled}
                                    className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all duration-200
                                            ${isRecording
                                            ? 'bg-red-500 text-white shadow-red-200'
                                            : 'bg-slate-100 text-gray-600 hover:bg-indigo-50 hover:text-indigo-600'}
                                            active:scale-95`}
                                    title={isRecording ? "Stop Recording" : "Start Recording"}
                                >
                                    <span className="text-lg">
                                        {isRecording ? '⏹' : '🎤'}
                                    </span>
                                </button>
                            </div>

                            <button
                                onClick={handleTextSubmit}
                                disabled={disabled || (!textInput.trim() && !isRecording)}
                                className="px-6 py-2 bg-primary text-white rounded-lg font-medium text-sm
                                            hover:bg-primary-dark transition-colors duration-200
                                            disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                            >
                                Send
                            </button>
                        </div>
                    </div>
                </div>
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

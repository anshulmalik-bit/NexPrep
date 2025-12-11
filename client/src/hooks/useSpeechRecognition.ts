import { useState, useEffect, useRef, useCallback } from 'react';

// Define SpeechRecognition types as they might not be in the default TS lib
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start: () => void;
    stop: () => void;
    abort: () => void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onend: () => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
}

interface SpeechRecognitionEvent {
    results: SpeechRecognitionResultList;
    resultIndex: number;
}

interface SpeechRecognitionResultList {
    length: number;
    item(index: number): SpeechRecognitionResult;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    isFinal: boolean;
    length: number;
    item(index: number): SpeechRecognitionAlternative;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    transcript: string;
    confidence: number;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}

declare global {
    interface Window {
        SpeechRecognition: new () => SpeechRecognition;
        webkitSpeechRecognition: new () => SpeechRecognition;
    }
}

interface UseSpeechRecognitionReturn {
    transcript: string;
    isListening: boolean;
    resetTranscript: () => void;
    startListening: () => void;
    stopListening: () => void;
    hasRecognitionSupport: boolean;
}

export const useSpeechRecognition = (): UseSpeechRecognitionReturn => {
    const [transcript, setTranscript] = useState('');
    const [isListening, setIsListening] = useState(false);
    const recognitionRef = useRef<SpeechRecognition | null>(null);

    // Initialization
    useEffect(() => {
        const SpeechRecognitionCtor = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (SpeechRecognitionCtor) {
            const recognition = new SpeechRecognitionCtor();
            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = 'en-US';

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                let finalTranscript = '';
                let interimTranscript = '';

                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript;
                    } else {
                        interimTranscript += event.results[i][0].transcript;
                    }
                }

                // We update with the accumulated transcript + current interim
                // Note: This logic assumes 'transcript' state isn't needed for calculating the new one
                // because we are just concatenating what the engine gives us?
                // Actually, continuous recognition usually keeps adding to results.
                // A simpler approach for 'continuous' is to map all results.

                const currentTranscript = Array.from(event.results)
                    .map(result => result[0].transcript)
                    .join('');

                setTranscript(currentTranscript);
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error('Speech recognition error', event.error);
                setIsListening(false);
            };

            recognitionRef.current = recognition;
        }
    }, []);

    const startListening = useCallback(() => {
        if (recognitionRef.current && !isListening) {
            try {
                recognitionRef.current.start();
                setIsListening(true);
            } catch (error) {
                console.error('Failed to start recognition:', error);
            }
        }
    }, [isListening]);

    const stopListening = useCallback(() => {
        if (recognitionRef.current && isListening) {
            recognitionRef.current.stop();
            setIsListening(false);
        }
    }, [isListening]);

    const resetTranscript = useCallback(() => {
        setTranscript('');
    }, []);

    return {
        transcript,
        isListening,
        resetTranscript,
        startListening,
        stopListening,
        hasRecognitionSupport: !!(window.SpeechRecognition || window.webkitSpeechRecognition)
    };
};

import React, { useEffect, useRef } from 'react';
import { NeuralKnot } from './NeuralKnot';

interface Message {
    id: string;
    type: 'quinn' | 'user' | 'system';
    content: string;
    timestamp: Date;
}

interface ConversationStreamProps {
    messages: Message[];
    isTyping: boolean;
    currentQuestion?: string;
    questionNumber: number;
    totalQuestions: number;
}

/**
 * ConversationStream - A ChatGPT-like stream for the interview flow.
 * Features: 
 * - Integrated Quinn avatar
 * - High-visibility "Active Question" card
 * - Smooth auto-scrolling
 */
export const ConversationStream: React.FC<ConversationStreamProps> = ({
    messages,
    isTyping,
    currentQuestion,
    questionNumber,
    totalQuestions
}) => {
    const bottomRef = useRef<HTMLDivElement>(null);
    const questionRef = useRef<HTMLDivElement>(null);

    // Auto-scroll: Only scroll when NEW messages are added (not on isTyping/question changes)
    const prevMessagesLength = useRef(messages.length);
    useEffect(() => {
        // Only scroll if messages array actually grew (new content was added)
        if (messages.length > prevMessagesLength.current && bottomRef.current) {
            bottomRef.current.scrollIntoView({ behavior: 'smooth' });
        }
        prevMessagesLength.current = messages.length;
    }, [messages.length]);

    return (
        <div className="flex-1 overflow-y-auto px-4 py-6 md:px-6 scroll-smooth">
            <div className="max-w-3xl mx-auto space-y-6">
                {/* History */}
                {messages.map((msg) => {
                    const isUsers = msg.type === 'user';
                    const isSystem = msg.type === 'system';

                    if (isSystem) {
                        return (
                            <div key={msg.id} className="flex justify-center my-4">
                                <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full uppercase tracking-wider">
                                    {msg.content}
                                </span>
                            </div>
                        );
                    }

                    return (
                        <div key={msg.id} className={`flex gap-3 ${isUsers ? 'justify-end' : 'justify-start'} animate-fade-in`}>
                            {/* Avatar for Quinn Messages */}
                            {!isUsers && (
                                <div className="flex-shrink-0 mt-1">
                                    <NeuralKnot size="sm" state="idle" className="w-8 h-8 md:w-10 md:h-10 opacity-70" />
                                </div>
                            )}

                            <div className={`max-w-[85%] rounded-2xl px-5 py-4 shadow-sm border
                                ${isUsers
                                    ? 'bg-primary text-white border-primary rounded-tr-sm'
                                    : 'bg-white text-slate-700 border-slate-100 rounded-tl-sm'
                                } transition-transform hover:scale-[1.01]`}>
                                <p className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                                    {msg.content}
                                </p>
                            </div>
                        </div>
                    );
                })}

                {/* Active Question Indicator (The "Now" State) */}
                {isTyping && (
                    <div ref={questionRef} className="mt-10 mb-8 animate-fade-in">
                        <div className="relative bg-slate-50 border-2 border-slate-100 rounded-2xl p-6 md:p-8 w-full flex flex-col items-center justify-center gap-4 min-h-[240px]">
                            {/* Thinking Animation */}
                            <div className="flex items-center gap-3">
                                <NeuralKnot size="md" state="thinking" className="w-12 h-12" />
                                <div className="flex gap-2">
                                    <span className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce" />
                                    <span className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.2s]" />
                                    <span className="w-2.5 h-2.5 bg-slate-400 rounded-full animate-bounce [animation-delay:0.4s]" />
                                </div>
                            </div>
                            <p className="text-sm font-medium text-slate-400 uppercase tracking-widest animate-pulse">
                                Quinn is thinking...
                            </p>
                        </div>
                    </div>
                )}

                {/* Active Question Card Card - Distinct and Attention Grabbing */}
                {!isTyping && currentQuestion && (
                    <div ref={questionRef} className="mt-10 mb-8 animate-slide-up">
                        <div className="relative bg-gradient-to-br from-indigo-50 to-white border-2 border-indigo-100 rounded-2xl p-6 md:p-8 shadow-lg shadow-indigo-100/50 ring-4 ring-indigo-50/50 w-full">
                            <div className="absolute -top-5 left-6 bg-white border border-indigo-100 px-4 py-1.5 rounded-full shadow-sm flex items-center gap-2">
                                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse"></span>
                                <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                                    Current Question {questionNumber} of {totalQuestions}
                                </span>
                            </div>

                            <div className="flex gap-6 items-start">
                                {/* Large Quinn for Active Question */}
                                <div className="hidden md:block flex-shrink-0">
                                    <NeuralKnot size="md" state="speaking" />
                                </div>

                                <div className="flex-1">
                                    <h2 className="text-xl md:text-2xl font-bold text-slate-800 leading-snug">
                                        {currentQuestion}
                                    </h2>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div ref={bottomRef} className="h-4" />
            </div>
        </div>
    );
};

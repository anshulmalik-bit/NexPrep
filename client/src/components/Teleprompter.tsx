import React from 'react';

interface TeleprompterProps {
    text: string;
    questionNumber: number;
    totalQuestions: number;
    isVisible?: boolean;
}

/**
 * Teleprompter - Premium floating question overlay for Studio Mode.
 * Features: Gradient backdrop, progress bar, smooth typography.
 */
export const Teleprompter: React.FC<TeleprompterProps> = ({
    text,
    questionNumber,
    totalQuestions,
    isVisible = true
}) => {
    if (!isVisible || !text) return null;

    const progress = (questionNumber / totalQuestions) * 100;

    return (
        <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none">
            {/* Premium gradient backdrop */}
            <div className="bg-gradient-to-b from-black/80 via-black/50 to-transparent">
                {/* Progress Bar */}
                <div className="h-1 bg-white/10">
                    <div
                        className="h-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 transition-all duration-700 ease-out"
                        style={{ width: `${progress}%` }}
                    />
                </div>

                <div className="px-6 py-6 md:px-10 md:py-8 lg:px-16">
                    {/* Question Counter Chip */}
                    <div className="flex items-center gap-3 mb-4">
                        <span className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-sm 
                                        rounded-full border border-white/10 text-xs font-medium text-white/90">
                            <span className="w-2 h-2 bg-indigo-400 rounded-full animate-pulse" />
                            Question {questionNumber} / {totalQuestions}
                        </span>
                    </div>

                    {/* Question Text with Premium Typography */}
                    <h2 className="text-xl md:text-2xl lg:text-3xl font-semibold text-white leading-relaxed 
                                   tracking-tight max-w-4xl"
                        style={{ textShadow: '0 2px 20px rgba(0,0,0,0.5)' }}
                    >
                        {text}
                    </h2>
                </div>
            </div>
        </div>
    );
};

export default Teleprompter;

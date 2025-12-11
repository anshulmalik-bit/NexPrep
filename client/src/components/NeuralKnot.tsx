import { type FC } from 'react';
// @ts-ignore
// import quinnAvatar from '../assets/quinn-avatar.png';

export type NeuralKnotState = 'idle' | 'thinking' | 'speaking' | 'coaching' | 'warning' | 'celebrating';

interface NeuralKnotProps {
    state?: NeuralKnotState;
    size?: 'sm' | 'md' | 'lg' | 'xl' | 'hero';
    className?: string;
}

const sizeMap = {
    sm: 'w-12 h-12',
    md: 'w-24 h-24',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48',
    hero: 'w-64 h-64 md:w-80 md:h-80 lg:w-96 lg:h-96',
};

export const NeuralKnot: FC<NeuralKnotProps> = ({
    state = 'idle',
    size = 'md',
    className = '',
}) => {
    return (
        <div className={`relative rounded-full flex items-center justify-center overflow-hidden border-2 border-indigo-100 shadow-frost bg-indigo-50/50 ${sizeMap[size]} ${className}`}>
            <img
                src="/quinn-knot.png"
                alt="Quinn AI"
                className={`w-[90%] h-[90%] object-contain transition-all duration-500
                    ${state === 'speaking' ? 'scale-110 brightness-110' : 'scale-100'}
                `}
            />

            {/* Optional state overlay (subtle glow based on state) */}
            {state === 'speaking' && (
                <div className="absolute inset-0 rounded-full ring-4 ring-indigo-400/30 animate-pulse" />
            )}
            {state === 'thinking' && (
                <div className="absolute inset-0 rounded-full bg-indigo-500/10 animate-pulse" />
            )}
        </div>
    );
};

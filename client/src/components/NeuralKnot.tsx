import { type FC } from 'react';

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
        <div className={`neural-knot neural-knot--${state} ${sizeMap[size]} ${className}`}>
            {/* Core - Central glowing orb */}
            <div className="neural-knot__core" />

            {/* Orbital Rings */}
            <div className="neural-knot__ring neural-knot__ring--1" />
            <div className="neural-knot__ring neural-knot__ring--2" />
            <div className="neural-knot__ring neural-knot__ring--3" />

            {/* Flowing Threads */}
            <div className="neural-knot__thread neural-knot__thread--1" />
            <div className="neural-knot__thread neural-knot__thread--2" />
            <div className="neural-knot__thread neural-knot__thread--3" />
            <div className="neural-knot__thread neural-knot__thread--4" />
        </div>
    );
};

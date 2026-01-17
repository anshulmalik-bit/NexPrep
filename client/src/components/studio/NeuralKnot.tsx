import React from 'react';

// Ensure your file is saved at public/quinn-knot.png
const QUINN_ASSET = "/quinn-knot.png";

type NeuralKnotState = 'idle' | 'intro' | 'listening' | 'thinking' | 'speaking';

interface NeuralKnotProps {
    state?: NeuralKnotState;
}

const NeuralKnot: React.FC<NeuralKnotProps> = ({ state = 'idle' }) => {
    return (
        <div className="relative flex items-center justify-center">
            {/* THE CORE STRUCTURE (Slow Rotation) */}
            <img
                src={QUINN_ASSET}
                alt="Quinn AI"
                className={`w-[350px] h-[350px] md:w-[400px] md:h-[400px] lg:w-[450px] lg:h-[450px] object-contain transition-all duration-[2000ms]
                animate-[spin_60s_linear_infinite] 
                ${state === 'speaking' ? 'scale-105 brightness-110' : 'scale-100'}
                ${state === 'listening' ? 'scale-95 grayscale-[0.2]' : ''}
                `}
            />

            {/* THE "FLOW" LAYER (The Magic) - creates shimmering threads effect */}
            <img
                src={QUINN_ASSET}
                alt=""
                className={`absolute w-[340px] h-[340px] md:w-[390px] md:h-[390px] lg:w-[440px] lg:h-[440px] object-contain opacity-70 mix-blend-screen 
                animate-[spin_40s_linear_infinite_reverse] blur-[0.5px]
                ${state === 'thinking' ? 'animate-[spin_4s_linear_infinite_reverse] opacity-90' : ''}
                `}
            />
        </div>
    );
};

export default NeuralKnot;

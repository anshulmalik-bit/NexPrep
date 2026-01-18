import { motion } from 'framer-motion';

interface ScoreRingProps {
    score: number;
    size?: number;
    strokeWidth?: number;
    className?: string;
}

export function ScoreRing({ score, size = 120, strokeWidth = 8, className = '' }: ScoreRingProps) {
    const radius = size / 2 - strokeWidth;
    const circumference = 2 * Math.PI * radius;
    const progress = Math.min(Math.max(score, 0), 100);
    const offset = circumference - (progress / 100) * circumference;

    // Determine color based on score
    const getColor = (s: number) => {
        if (s >= 80) return '#10B981'; // Emerald-500
        if (s >= 60) return '#F59E0B'; // Amber-500
        if (s >= 40) return '#F97316'; // Orange-500
        return '#EF4444'; // Red-500
    };

    const color = getColor(score);

    return (
        <div className={`relative flex items-center justify-center ${className}`} style={{ width: size, height: size }}>
            {/* Background Circle */}
            <svg className="absolute inset-0 transform -rotate-90 w-full h-full">
                <circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke="currentColor"
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    className="text-slate-100 dark:text-slate-800"
                />
                <motion.circle
                    cx={size / 2}
                    cy={size / 2}
                    r={radius}
                    stroke={color}
                    strokeWidth={strokeWidth}
                    fill="transparent"
                    strokeDasharray={circumference}
                    initial={{ strokeDashoffset: circumference }}
                    animate={{ strokeDashoffset: offset }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                    strokeLinecap="round"
                    className="drop-shadow-lg"
                />
            </svg>

            {/* Inner "Core" Background */}
            <div className="absolute inset-4 rounded-full bg-primary/5 blur-sm" />

            {/* Inner Text */}
            <div className="flex flex-col items-center z-10">
                <motion.span
                    initial={{ opacity: 0, scale: 0.5 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.5, duration: 0.5 }}
                    className="text-5xl font-bold text-slate-900"
                >
                    {score}
                </motion.span>
                <span className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-bold mt-1">Overall</span>
            </div>
        </div>
    );
}

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { NeuralKnot } from './NeuralKnot';
import { useNavigate } from 'react-router-dom';

export function InteractiveHero() {
    const [isHovered, setIsHovered] = useState(false);
    const navigate = useNavigate();

    return (
        <div className="relative w-full max-w-4xl mx-auto flex flex-col items-center justify-center py-12 px-4">
            {/* 1. Quinn: The Alive AI Mentor */}
            <motion.div
                className="relative cursor-pointer group mb-12"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                onClick={() => navigate('/choose-path')}
                animate={{
                    y: [0, -15, 0],
                }}
                transition={{
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                }}
            >
                {/* Visual Glow / Depth */}
                <div className="absolute inset-x-0 -bottom-10 h-10 bg-indigo-500/5 blur-3xl rounded-[100%] scale-110" />

                {/* Quinn Avatar */}
                <NeuralKnot
                    size="hero"
                    state={isHovered ? 'listening' : 'idle'}
                    className="relative z-10 drop-shadow-2xl transition-transform duration-500 group-hover:scale-105"
                />

                {/* Status Indicator */}
                <div className="absolute -top-4 -right-4 flex items-center gap-2 px-3 py-1 bg-white border border-slate-100 rounded-full shadow-sm z-20">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Active Mentor</span>
                </div>

                {/* Voice Interaction Bubble */}
                <AnimatePresence>
                    {isHovered && (
                        <motion.div
                            initial={{ opacity: 0, x: 20, scale: 0.95 }}
                            animate={{ opacity: 1, x: 0, scale: 1 }}
                            exit={{ opacity: 0, x: 20, scale: 0.95 }}
                            className="absolute -right-32 top-1/2 -translate-y-1/2 hidden lg:block z-30"
                        >
                            <div className="bg-white px-6 py-4 rounded-2xl shadow-xl border border-slate-50 relative">
                                <p className="text-slate-800 font-semibold whitespace-nowrap">
                                    "Ready to practice your HR round?"
                                </p>
                                <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-4 h-4 bg-white rotate-45 border-l border-b border-slate-50" />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </motion.div>

            {/* 2. Instant CTA Section (0 Scrolls Away) */}
            <div className="flex flex-col items-center gap-6 w-full max-w-md">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => navigate('/choose-path')}
                    className="w-full btn-cta py-5 text-xl font-bold shadow-xl shadow-primary/20"
                >
                    Start Your Mock Interview
                </motion.button>

                <p className="text-slate-500 text-sm font-medium">
                    Private session • Instant feedback • No login required
                </p>

                {/* Trust Indicators */}
                <div className="flex items-center gap-8 mt-4 pt-6 border-t border-slate-100 w-full justify-center">
                    <div className="flex items-center gap-2 text-slate-400">
                        <span className="text-lg">🎯</span>
                        <span className="text-xs font-bold uppercase tracking-tighter">ATS Optimized</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                        <span className="text-lg">🧠</span>
                        <span className="text-xs font-bold uppercase tracking-tighter">Skill Assessment</span>
                    </div>
                    <div className="flex items-center gap-2 text-slate-400">
                        <span className="text-lg">📈</span>
                        <span className="text-xs font-bold uppercase tracking-tighter">Confidence Score</span>
                    </div>
                </div>
            </div>
        </div>
    );
}

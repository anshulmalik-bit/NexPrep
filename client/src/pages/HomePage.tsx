import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { InteractiveHero } from '../components/InteractiveHero';

export function HomePage() {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen bg-canvas overflow-x-hidden pt-[72px]">
            {/* 1. HERO: PROFESSIONAL ENTRY */}
            <section className="relative py-12 lg:py-24 px-4 overflow-hidden">
                {/* Subtle Background Elements */}
                <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[120px] -z-10" />
                <div className="absolute bottom-0 right-1/4 w-[500px] h-[500px] bg-accent/5 rounded-full blur-[120px] -z-10" />

                <div className="container max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/5 border border-primary/10 text-primary text-xs font-bold uppercase tracking-widest mb-6"
                        >
                            <span className="relative flex h-2 w-2">
                                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                            </span>
                            AI-Powered HR Interview Intelligence
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-5xl md:text-7xl font-bold tracking-tight mb-6 text-text"
                        >
                            Ace your next <br className="hidden md:block" />
                            <span className="text-gradient">HR Round.</span>
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.1 }}
                            className="text-xl text-text-secondary max-w-2xl mx-auto"
                        >
                            Train with <span className="text-primary font-semibold">Quinn</span>, your private AI interview coach. <br />
                            Master your behavioral responses with real-time feedback on confidence, clarity, and body language.
                        </motion.p>
                    </div>

                    {/* Interactive Hero (Includes CTA) */}
                    <div className="relative z-10">
                        <InteractiveHero />
                    </div>
                </div>
            </section>

            {/* 2. THE AI ADVANTAGE (Professional Cards) */}
            <section className="py-24 bg-surface/50 relative">
                <div className="container max-w-6xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Complete Interview Intelligence.</h2>
                        <p className="text-lg text-text-secondary max-w-2xl mx-auto">We look beyond just what you say to help you present your best professional self.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {/* Card 1: Tone & Speech */}
                        <motion.div whileHover={{ y: -8 }} className="glass-card p-10 group">
                            <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform">
                                🎙️
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Verbal Excellence</h3>
                            <p className="text-text-secondary leading-relaxed">
                                Quinn analyzes your pacing, fillers, and confidence. Get instant tips on how to sound more authoritative and clear.
                            </p>
                            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center gap-2">
                                <div className="h-1 w-12 bg-primary rounded-full" />
                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest">Acoustic Analysis</span>
                            </div>
                        </motion.div>

                        {/* Card 2: Logic & Depth */}
                        <motion.div whileHover={{ y: -8 }} className="glass-card p-10 group">
                            <div className="w-14 h-14 rounded-2xl bg-accent/10 text-accent flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform">
                                🧠
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Smart Logic</h3>
                            <p className="text-text-secondary leading-relaxed">
                                AI parses your answers for technical depth and logic. We ensure you're addressing the core of the interviewer's question.
                            </p>
                            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center gap-2">
                                <div className="h-1 w-12 bg-accent rounded-full" />
                                <span className="text-[10px] font-bold text-accent uppercase tracking-widest">Context Mapping</span>
                            </div>
                        </motion.div>

                        {/* Card 3: Body Language */}
                        <motion.div whileHover={{ y: -8 }} className="glass-card p-10 group">
                            <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-3xl mb-8 group-hover:scale-110 transition-transform">
                                👁️
                            </div>
                            <h3 className="text-2xl font-bold mb-4">Presence Tracking</h3>
                            <p className="text-text-secondary leading-relaxed">
                                Analyze eye contact, posture, and facial cues. Learn to project confidence and maintain engagement even over video.
                            </p>
                            <div className="mt-8 pt-6 border-t border-slate-50 flex items-center gap-2">
                                <div className="h-1 w-12 bg-amber-500 rounded-full" />
                                <span className="text-[10px] font-bold text-amber-600 uppercase tracking-widest">Visual Feedback</span>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </section>

            {/* 3. ATS & RESUME SCAN (Professional Visual) */}
            <section className="py-24 overflow-hidden">
                <div className="container max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                        <div>
                            <span className="text-primary font-bold text-sm tracking-widest uppercase mb-4 block">Personalized Coaching</span>
                            <h2 className="text-4xl md:text-5xl font-bold mb-8 leading-tight text-text">Resume-Tailored <br /> Simulations.</h2>
                            <p className="text-lg text-text-secondary mb-10 leading-relaxed">
                                Generic questions don't get you hired. Quinn scans your specific experience, tech stack, and projects to ask the deep-dive questions real HR managers care about.
                            </p>
                            <ul className="space-y-6">
                                {[
                                    { icon: "📄", title: "ATS Optimization", desc: "Align your verbal responses with top-tier recruiter expectations." },
                                    { icon: "✨", title: "Project Deep Dives", desc: "Get challenged on the impact and logic of your past roles." },
                                    { icon: "🎯", title: "Gap Analysis", desc: "Identify and fix weaknesses in your professional narrative." }
                                ].map((item, i) => (
                                    <li key={i} className="flex gap-4 p-4 rounded-xl hover:bg-white hover:shadow-sm transition-all border border-transparent hover:border-slate-100">
                                        <div className="text-2xl">{item.icon}</div>
                                        <div>
                                            <h4 className="font-bold text-text mb-1">{item.title}</h4>
                                            <p className="text-sm text-text-secondary">{item.desc}</p>
                                        </div>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Visual Scanning Animation (Clean & Pro) */}
                        <div className="relative">
                            <div className="bg-white rounded-3xl p-8 shadow-2xl border border-slate-100 relative overflow-hidden group">
                                <div className="space-y-4 opacity-50 group-hover:opacity-100 transition-opacity">
                                    <div className="h-8 w-1/3 bg-slate-100 rounded-lg" />
                                    <div className="h-2 w-full bg-slate-50 rounded" />
                                    <div className="h-2 w-full bg-slate-50 rounded" />
                                    <div className="h-2 w-3/4 bg-slate-50 rounded" />
                                    <div className="h-24 w-full bg-slate-50 rounded-2xl mt-8" />
                                    <div className="flex gap-4">
                                        <div className="h-10 w-24 bg-primary/5 rounded-full" />
                                        <div className="h-10 w-32 bg-accent/5 rounded-full" />
                                    </div>
                                </div>
                                {/* Scanning Effect */}
                                <motion.div
                                    className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-transparent via-primary to-transparent"
                                    animate={{ top: ['0%', '100%', '0%'] }}
                                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                                />
                                {/* Overlay Signal */}
                                <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        className="bg-white/95 backdrop-blur-md px-6 py-4 rounded-2xl shadow-xl border border-slate-100 flex items-center gap-3"
                                    >
                                        <span className="text-primary text-xl font-bold">Quinn Analysis:</span>
                                        <span className="text-slate-600 font-medium">Extracting Tech Stack...</span>
                                    </motion.div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* 4. FINAL CALL TO ACTION */}
            <section className="py-24 bg-slate-900 overflow-hidden relative">
                <div className="absolute inset-0 bg-primary/5 -z-10" />
                <div className="container max-w-4xl mx-auto px-4 text-center">
                    <h2 className="text-4xl md:text-6xl font-bold text-white mb-8">Ready to get hired?</h2>
                    <p className="text-slate-400 text-xl mb-12 max-w-2xl mx-auto">
                        Practice makes perfect. Start your secure, private AI interview session today.
                    </p>
                    <button
                        onClick={() => navigate('/choose-path')}
                        className="px-12 py-6 bg-white text-slate-950 rounded-full text-2xl font-bold hover:scale-105 transition-transform shadow-2xl"
                    >
                        Start Your Practice Round
                    </button>

                </div>
            </section>

        </div>
    );
}

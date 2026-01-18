import { motion } from 'framer-motion';

interface InsightStreamProps {
    strengths: string[];
    weaknesses: string[];
    plan: string[];
}

export function InsightStream({ strengths, weaknesses, plan }: InsightStreamProps) {
    return (
        <div className="relative max-w-4xl mx-auto py-12">
            <div className="space-y-24">
                {/* 1. Strengths Section */}
                <div>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl font-bold border border-emerald-100">
                            💪
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">Strengths</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {strengths.map((strength, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card p-6 border-l-4 border-l-emerald-500 bg-white shadow-sm"
                            >
                                <p className="text-slate-700 font-medium leading-relaxed">{strength}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* 2. Weaknesses Section */}
                <div>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center text-xl font-bold border border-rose-100">
                            🎯
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">Growth Areas</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {weaknesses.map((weakness, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card p-6 border-l-4 border-l-rose-500 bg-white shadow-sm"
                            >
                                <p className="text-slate-700 font-medium leading-relaxed">{weakness}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>

                {/* 3. Action Plan */}
                <div>
                    <div className="flex items-center gap-4 mb-8">
                        <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-primary/5 text-primary flex items-center justify-center text-xl font-bold border border-primary/10">
                            🚀
                        </div>
                        <h3 className="text-2xl font-bold text-slate-800">Action Plan</h3>
                    </div>

                    <div className="space-y-4">
                        {plan.map((step, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, x: -20 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="glass-card p-6 bg-white shadow-sm"
                            >
                                <div className="flex gap-4">
                                    <span className="font-bold text-primary/40 text-2xl">0{i + 1}</span>
                                    <p className="text-slate-700 font-medium pt-1 leading-relaxed">{step}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}

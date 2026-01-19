import { motion } from 'framer-motion';

interface ReviewMomentProps {
    index: number;
    question: string;
    answer: string;
    critique: string;
    score: number;
    starRating?: number;
}

export function ReviewMoment({ index, question, answer, critique, score, starRating }: ReviewMomentProps) {
    // Determine color based on mini-score
    const getStatusColor = (s: number) => {
        if (s >= 80) return 'emerald';
        if (s >= 60) return 'amber';
        return 'rose';
    };

    const statusStyles = {
        emerald: {
            border: 'border-emerald-400/30',
            bg: 'bg-emerald-50',
            text: 'text-emerald-600',
            marker: 'border-emerald-400/30'
        },
        amber: {
            border: 'border-amber-400/30',
            bg: 'bg-amber-50',
            text: 'text-amber-600',
            marker: 'border-amber-400/30'
        },
        rose: {
            border: 'border-rose-400/30',
            bg: 'bg-rose-50',
            text: 'text-rose-600',
            marker: 'border-rose-400/30'
        }
    };
    const color = getStatusColor(score) as keyof typeof statusStyles;

    const styles = statusStyles[color];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: index * 0.1 }}
            className="group"
        >
            <div className="flex gap-6">
                {/* Moment Marker */}
                <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-xl bg-white border-2 ${styles.marker} flex items-center justify-center text-sm font-bold shadow-sm z-10 group-last:bg-slate-900 group-last:text-white`}>
                        {index + 1}
                    </div>
                    <div className="flex-grow w-0.5 bg-slate-100 group-last:hidden" />
                </div>

                {/* Content Card */}
                <div className="flex-grow pb-12">
                    <div className="glass-card overflow-hidden transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/5">
                        {/* Question Header */}
                        <div className="p-6 bg-slate-50/50 border-b border-slate-100">
                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest block mb-2">Question Asked</span>
                            <h4 className="text-lg font-bold text-slate-800 leading-tight">
                                "{question}"
                            </h4>
                        </div>

                        {/* Answer & Critique Grid */}
                        <div className="p-6 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:divide-x divide-slate-100">
                            {/* Answer Snippet */}
                            <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Your Response</span>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${styles.bg} ${styles.text} uppercase`}>
                                        {score}/100 Score
                                    </span>
                                </div>
                                <p className="text-slate-600 text-sm leading-relaxed italic bg-slate-50/30 p-4 rounded-lg border border-slate-50">
                                    "...{answer.length > 200 ? answer.slice(0, 200) + '...' : answer}"
                                </p>
                            </div>

                            {/* Quinn's Critique */}
                            <div className="lg:pl-8 space-y-4">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-primary" />
                                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Quinn's Analysis</span>
                                </div>
                                <p className="text-slate-800 text-sm font-medium leading-relaxed">
                                    {critique}
                                </p>
                                <div className="flex items-center gap-4 pt-2">
                                    <div className="flex -space-x-1">
                                        {[1, 2, 3, 4, 5].map((star) => {
                                            const isActive = starRating !== undefined
                                                ? star <= starRating
                                                : star <= Math.round(score / 20);
                                            return (
                                                <span key={star} className={`text-xs ${isActive ? 'text-amber-400' : 'text-slate-200'}`}>
                                                    ★
                                                </span>
                                            );
                                        })}
                                    </div>
                                    <span className="text-[10px] font-medium text-slate-500">STAR Method Adherence</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}

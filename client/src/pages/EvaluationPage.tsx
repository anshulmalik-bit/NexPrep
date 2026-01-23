import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { useInterviewStore } from '../store/interview-store';
import { api } from '../services/api';
import { Confetti } from '../components/Confetti';
import { useAuthStore } from '../store/auth-store';
import { ScoreRing } from '../components/ScoreRing';
import { RadarChart } from '../components/RadarChart';
import { InsightStream } from '../components/InsightStream';
import { NeuralKnot } from '../components/NeuralKnot';
import { ReviewMoment } from '../components/ReviewMoment';
import { motion } from 'framer-motion';


export function EvaluationPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const historySessionId = searchParams.get('session');

    const { sessionId, answers, setReport, report, trackId, roleId } = useInterviewStore();
    const { history, addHistory } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);
    const reportRef = useRef<HTMLDivElement>(null);

    // Derived Score
    const [finalScore, setFinalScore] = useState(0);

    useEffect(() => {
        if (historySessionId) {
            const historicalEntry = history.find(e => e.id === historySessionId);
            if (historicalEntry) {
                setReport(historicalEntry.report);
                setFinalScore(historicalEntry.score);
                // Also set track/role in store so labels show correctly
                if (historicalEntry.trackId) useInterviewStore.getState().setTrack(historicalEntry.trackId);
                if (historicalEntry.roleId) useInterviewStore.getState().setRole(historicalEntry.roleId);
                setLoading(false);
                return;
            }
        }

        if (!sessionId) {
            navigate('/choose-path');
            return;
        }
        loadReport();
    }, [sessionId, historySessionId]);

    const loadReport = async () => {
        try {
            const [summary, skills, strengths, weaknesses, breakdown, plan] = await Promise.all([
                api.getReportSummary(sessionId!).catch(() => ({ summary: 'Analysis complete.' })),
                api.getReportSkillMatrix(sessionId!).catch(() => ({ skillMatrix: [] })),
                api.getReportStrengths(sessionId!).catch(() => ({ strengths: [] })),
                api.getReportWeaknesses(sessionId!).catch(() => ({ weaknesses: [] })),
                api.getReportBreakdown(sessionId!).catch(() => ({ breakdown: [] })),
                api.getReportPlan(sessionId!).catch(() => ({ improvementPlan: [] })),
            ]);

            const finalReport = {
                summary: summary.summary,
                skillMatrix: skills.skillMatrix || [],
                strengths: strengths.strengths || [],
                weaknesses: weaknesses.weaknesses || [],
                questionBreakdown: breakdown.breakdown || [],
                improvementPlan: plan.improvementPlan || [],
                patternDetection: [],
                resources: [],
                overallScore: (summary as any).overallScore // Capture overallScore from API
            };

            setReport(finalReport);

            const answersWithScores = answers.filter(a => a.evaluation?.score !== undefined);
            const avgFromAnswers = answersWithScores.length > 0
                ? Math.round(answersWithScores.reduce((sum, a) => sum + (a.evaluation?.score || 0), 0) / answersWithScores.length)
                : 0;

            // SIMPLIFIED LOGIC: Use explicit overall score from report (highest priority)
            const explicitScore = finalReport.overallScore;

            // Priority: 1. Explicit AI Score (Best) 2. Calculated Average (Backup) 3. Zero
            const finalScoreVal = (explicitScore !== undefined && explicitScore > -2)
                ? explicitScore // Use it if it exists (even if 0 or -1)
                : (avgFromAnswers > 0 ? avgFromAnswers : 0);

            let score = finalScoreVal;
            setFinalScore(score);

            addHistory({
                trackId: trackId || 'general',
                roleId: roleId || 'general',
                score: score >= 0 ? score : 0, // Store 0 for history sorting if failed
                report: finalReport
            });

            if (score >= 70) {
                setShowConfetti(true);
            }

        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };


    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-canvas">
                <div className="text-center">
                    <div className="text-6xl mb-6 animate-pulse">🧠</div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Analyzing Performance</h2>
                    <p className="text-slate-500">Quinn is synthesizing your feedback...</p>
                </div>
            </div>
        );
    }

    const radarData = report?.skillMatrix.map(s => ({
        subject: s.skill,
        A: s.score || 50,
        fullMark: 100
    })) || [];

    // Map real report data to "Vitals" or use intelligent defaults based on overall score
    const skillScore = (name: string) => report?.skillMatrix.find(s => s.skill.includes(name))?.score || 0;

    const vitals = [
        {
            label: 'Communication Clarity',
            value: skillScore('Communication') >= 80 ? 'High' : 'Improving',
            score: skillScore('Communication') || (finalScore >= 0 ? finalScore : 0),
            icon: '🎙️',
            color: 'bg-emerald-500'
        },
        {
            label: 'Problem Solving',
            value: skillScore('Problem') >= 80 ? 'Strong' : 'Developing',
            score: skillScore('Problem') || (finalScore > 50 ? finalScore - 5 : 0),
            icon: '🧠',
            color: 'bg-primary'
        },
        {
            label: 'Adaptability',
            value: skillScore('Adapt') >= 80 ? 'Flexible' : 'Rigid',
            score: skillScore('Adapt') || (finalScore > 60 ? finalScore - 10 : 0),
            icon: '🌊',
            color: 'bg-amber-500'
        },
    ];

    return (
        <div ref={reportRef} className="min-h-screen bg-canvas pt-[72px] pb-24 overflow-x-hidden">
            <Confetti trigger={showConfetti} />

            {/* 1. HERO: QUINN'S PERSONAL DEBRIEF */}
            <header className="relative pt-12 pb-20 px-4 overflow-hidden">
                {/* Background Atmosphere */}
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-primary/5 rounded-full blur-[120px] -z-10" />

                <div className="container max-w-5xl mx-auto">
                    <div className="flex flex-col items-center text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-8 cursor-help group relative"
                        >
                            <NeuralKnot size="lg" state={finalScore >= 70 ? 'celebrating' : 'idle'} />
                            <div className="absolute -top-4 -right-4 bg-white border border-slate-100 rounded-full px-3 py-1 shadow-sm flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Live Mentor Analysis</span>
                            </div>
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-4xl md:text-6xl font-bold tracking-tight mb-4 text-slate-900"
                        >
                            {finalScore === -1 ? 'Analysis Unavailable.' :
                                finalScore >= 80 ? 'Exceptional Performance!' :
                                    finalScore >= 60 ? 'Great Progress.' : 'A Learning Opportunity.'}
                        </motion.h1>

                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="text-sm font-bold text-primary uppercase tracking-[0.3em] mb-12"
                        >
                            {trackId || 'General'} • {roleId || 'Individual Contributor'}
                        </motion.div>

                        {/* Quinn's Closing Thoughts Popup */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="glass-card p-10 bg-white/50 border-primary/10 max-w-3xl relative"
                        >
                            <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-white text-[10px] font-bold px-4 py-1 rounded-full uppercase tracking-widest">
                                Quinn's Closing Thoughts
                            </div>
                            <p className="text-xl text-slate-700 leading-relaxed font-medium">
                                "{report?.summary}"
                            </p>
                        </motion.div>

                        {/* Download PDF Button */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5 }}
                            data-html2canvas-ignore="true"
                            className="mt-12 no-print flex flex-col md:flex-row items-center justify-center gap-4 w-full px-4"
                        >
                            {/* 1. SURVEY (Primary Call to Action) */}
                            <a
                                href="https://docs.google.com/forms"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-full md:w-auto relative group"
                            >
                                <div className="absolute inset-0 bg-emerald-500 rounded-2xl blur-lg opacity-40 group-hover:opacity-60 transition-opacity animate-pulse" />
                                <button className="relative w-full md:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-emerald-600 text-white rounded-2xl font-bold text-lg shadow-xl shadow-emerald-600/20 hover:scale-105 active:scale-95 transition-all">
                                    <span className="text-2xl">📋</span>
                                    <span>Survey</span>
                                    <span className="bg-white/20 px-2 py-0.5 rounded text-xs uppercase tracking-wider">1 min</span>
                                </button>
                            </a>

                            {/* 2. Download PDF */}
                            <button
                                onClick={async () => {
                                    if (!reportRef.current || isGeneratingPdf) return;
                                    setIsGeneratingPdf(true);
                                    try {
                                        // Safety timeout race
                                        const pdfPromise = (async () => {
                                            // Configure PDF options
                                            const opt = {
                                                margin: [10, 10, 10, 10] as [number, number, number, number],
                                                filename: `HRprep-Report-${roleId || 'interview'}-${new Date().toISOString().split('T')[0]}.pdf`,
                                                image: { type: 'jpeg' as 'jpeg', quality: 0.98 },
                                                html2canvas: {
                                                    scale: 2,
                                                    useCORS: true,
                                                    letterRendering: true,
                                                    scrollY: 0,
                                                },
                                                jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' as 'portrait' },
                                                pagebreak: { mode: ['avoid-all', 'css', 'legacy'] }
                                            };

                                            const html2pdfModule = await import('html2pdf.js');
                                            const html2pdfFunc = html2pdfModule.default || html2pdfModule;

                                            if (typeof html2pdfFunc !== 'function') {
                                                throw new Error(`html2pdf is not a function.`);
                                            }

                                            const worker = html2pdfFunc();
                                            await worker.set(opt).from(reportRef.current!).save();
                                        })();

                                        const timeoutPromise = new Promise((_, reject) =>
                                            setTimeout(() => reject(new Error('PDF generation timed out')), 15000)
                                        );

                                        await Promise.race([pdfPromise, timeoutPromise]);

                                    } catch (err) {
                                        console.error('PDF generation failed:', err);
                                        const errorMessage = err instanceof Error ? err.message : String(err);
                                        alert(`PDF Generation Error: ${errorMessage}\n\nPlease try using the browser print function instead (Ctrl+P).`);
                                    } finally {
                                        setIsGeneratingPdf(false);
                                    }
                                }}
                                disabled={isGeneratingPdf}
                                className="w-full md:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 bg-white text-slate-700 border border-slate-200 rounded-2xl font-bold text-lg shadow-sm hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-wait"
                            >
                                <span className="text-2xl">{isGeneratingPdf ? '⏳' : '📄'}</span>
                                {isGeneratingPdf ? 'Generating...' : 'Download PDF'}
                            </button>


                        </motion.div>
                    </div>
                </div>
            </header>

            {/* 2. THE DASHBOARD: PERFORMANCE AT A GLANCE */}
            <section className="py-20 bg-slate-50/50 relative">
                <div className="container max-w-6xl mx-auto px-4">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">

                        {/* Final Score Card */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="lg:col-span-4 glass-card p-10 bg-primary/5 ring-1 ring-primary/10 flex flex-col items-center justify-center text-center relative overflow-hidden"
                        >
                            {/* Subtle Radial Glow */}
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-primary/10 rounded-full blur-3xl -z-10" />

                            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-8">Performance Score</span>
                            <ScoreRing score={finalScore} size={200} strokeWidth={14} />
                            <div className="mt-8">
                                <p className="text-sm font-bold text-primary uppercase tracking-widest">
                                    {finalScore >= 90 ? 'Mastery Level' : finalScore >= 75 ? 'Role Ready' : 'Training Needed'}
                                </p>
                            </div>
                        </motion.div>

                        {/* Skill Balance (Radar) */}
                        <motion.div
                            whileHover={{ y: -5 }}
                            className="lg:col-span-8 glass-card p-10 bg-white/40 ring-1 ring-primary/5 flex flex-col md:flex-row items-center gap-12"
                        >
                            <div className="flex-grow">
                                <h3 className="text-2xl font-bold text-slate-900 mb-4">Competency Balance</h3>
                                <p className="text-slate-600 text-sm leading-relaxed mb-8 font-medium">
                                    How your responses aligned with the core requirements of the <strong>{roleId || 'Target Role'}</strong>.
                                </p>
                                <div className="space-y-4">
                                    {report?.skillMatrix.slice(0, 3).map((s, i) => (
                                        <div key={i} className="flex items-center gap-4">
                                            <div className="flex-grow">
                                                <div className="flex justify-between text-[10px] font-bold uppercase mb-1 text-slate-500">
                                                    <span>{s.skill}</span>
                                                    <span className="text-primary">{s.score}%</span>
                                                </div>
                                                <div className="h-1.5 w-full bg-slate-200/50 rounded-full overflow-hidden">
                                                    <motion.div
                                                        initial={{ width: 0 }}
                                                        whileInView={{ width: `${s.score}%` }}
                                                        className="h-full bg-primary"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="flex-shrink-0">
                                <RadarChart data={radarData.length ? radarData : [{ subject: 'General', A: finalScore, fullMark: 100 }]} size={240} />
                            </div>
                        </motion.div>
                    </div>

                    {/* INTERVIEW VITALS (The Stats Block) */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-12">
                        {vitals.map((vital, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.5 + (i * 0.1) }}
                                className="glass-card p-6 flex items-center gap-4 border-slate-100 shadow-sm"
                            >
                                <div className="text-3xl">{vital.icon}</div>
                                <div className="flex-grow">
                                    <h4 className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">{vital.label}</h4>
                                    <div className="flex items-center justify-between">
                                        <span className="text-lg font-bold text-slate-800">{vital.value}</span>
                                        <span className="text-xs font-bold text-primary">{vital.score}%</span>
                                    </div>
                                    <div className="h-1 w-full bg-slate-100 rounded-full mt-2 overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            whileInView={{ width: `${vital.score}%` }}
                                            className={`h-full ${vital.color}`}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* 3. MOMENT-BY-MOMENT REVIEW */}
            <section className="py-24">
                <div className="container max-w-4xl mx-auto px-4">
                    <div className="flex flex-col items-center text-center mb-16">
                        <span className="px-4 py-1.5 rounded-full bg-indigo-50 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
                            Moment-by-Moment Analysis
                        </span>
                        <h2 className="text-3xl md:text-5xl font-bold mb-4">Review your session.</h2>
                        <p className="text-slate-500">Every response was analyzed for logic, tone, and professional impact.</p>
                    </div>

                    <div className="space-y-4">
                        {report?.questionBreakdown.map((moment, i) => (
                            <ReviewMoment
                                key={i}
                                index={i}
                                question={moment.question}
                                answer={answers.find(a => a.questionText === moment.question)?.answerText || 'No answer recorded.'}
                                critique={moment.feedback}
                                score={moment.score}
                            />
                        ))}

                        {/* Fallback if no breakdown */}
                        {(!report?.questionBreakdown || report.questionBreakdown.length === 0) && (
                            <div className="p-20 text-center glass-card border-dashed">
                                <p className="text-slate-400 font-medium italic">Detailed question breakdown will appear for active mock interview sessions.</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* 4. GROWTH ROADMAP (Insights + Plan) */}
            <section className="py-24 bg-slate-50/50 overflow-hidden relative">
                <div className="absolute inset-0 bg-primary/5 -z-10" />
                <div className="container max-w-5xl mx-auto px-4">
                    <div className="text-center mb-16">
                        <span className="px-4 py-1.5 rounded-full bg-primary/5 text-primary text-[10px] font-bold uppercase tracking-widest mb-4">
                            Strategic Growth Path
                        </span>
                        <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-4">Your Roadmap.</h2>
                        <p className="text-slate-500">Concrete steps to transform your potential into a job offer.</p>
                    </div>
                    <InsightStream
                        strengths={report?.strengths || []}
                        weaknesses={report?.weaknesses || []}
                        plan={report?.improvementPlan || []}
                    />
                </div>
            </section>

            {/* 5. NEXT STEPS */}
            <section className="py-24 text-center">
                <div className="container max-w-4xl mx-auto px-4">
                    <div className="flex flex-col items-center">
                        <h2 className="text-4xl font-bold mb-8">Ready to try again?</h2>
                        <div className="flex flex-wrap justify-center gap-6">
                            <Link to="/choose-path" className="btn-cta px-12 py-5 rounded-2xl text-xl shadow-2xl shadow-primary/20">
                                Start Next Round
                            </Link>
                            <Link to="/history" className="px-10 py-5 bg-white text-slate-700 font-bold rounded-2xl border border-slate-200 hover:shadow-lg transition-all text-xl">
                                Full History
                            </Link>
                        </div>
                        <p className="mt-12 text-slate-400 font-medium">Session recorded. You can return to this report anytime via your history page.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

import { useState, useEffect } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useInterviewStore } from '../store/interview-store';
import { api } from '../services/api';
import { NeuralKnot } from '../components/NeuralKnot';
import { Confetti } from '../components/Confetti';
import { useAuthStore } from '../store/auth-store';

interface Slide {
    id: string;
    title: string;
    icon: string;
    type: 'score' | 'strengths' | 'weaknesses' | 'content' | 'plan' | 'resources' | 'leaderboard';
}

export function EvaluationPage() {
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const historySessionId = searchParams.get('session');

    const { sessionId, answers, quinnMode, trackId, roleId, setReport, report, atsAnalysis, companyName } = useInterviewStore();
    const { user, history, addHistory } = useAuthStore();
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [nickname, setNickname] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const [showConfetti, setShowConfetti] = useState(false);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);

    const slides: Slide[] = [
        { id: 'score', title: 'Overall Score', icon: '🏆', type: 'score' },
        { id: 'strengths', title: 'Your Strengths', icon: '💪', type: 'strengths' },
        { id: 'weaknesses', title: 'Areas to Improve', icon: '🎯', type: 'weaknesses' },
        { id: 'content', title: 'Content Analysis', icon: '📝', type: 'content' },
        { id: 'plan', title: 'Improvement Plan', icon: '🚀', type: 'plan' },
        { id: 'leaderboard', title: 'Leaderboard', icon: '🏅', type: 'leaderboard' },
    ];

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 1024);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (user?.nickname) {
            setNickname(user.nickname);
        }
    }, [user]);

    useEffect(() => {
        // If viewing from history, load that report
        if (historySessionId) {
            const historicalEntry = history.find(e => e.id === historySessionId);
            if (historicalEntry) {
                setReport(historicalEntry.report);
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

    // Calculate average score from answers, or fall back to skill matrix average
    const answersWithScores = answers.filter(a => a.evaluation?.score !== undefined);
    const avgFromAnswers = answersWithScores.length > 0
        ? Math.round(answersWithScores.reduce((sum, a) => sum + (a.evaluation?.score || 0), 0) / answersWithScores.length)
        : 0;

    // Use skill matrix average if we don't have proper answer scores
    const skillMatrixAvg = report?.skillMatrix && report.skillMatrix.length > 0
        ? Math.round(report.skillMatrix.reduce((sum: number, s: { score?: number }) => sum + (s.score || 0), 0) / report.skillMatrix.length)
        : 0;

    let baseScore = avgFromAnswers > 0 ? avgFromAnswers : skillMatrixAvg;

    // Factor in ATS Score if available (30% weight or equal weight? Let's do 50/50 split if answers are few, or weighted)
    // If we have very few answers, ATS score matters more. If we have a full interview, ATS score is a baseline.
    // Let's go with: Final = (Interview * 0.7) + (ATS * 0.3)
    let finalScore = baseScore;

    if (atsAnalysis?.resumeScore) {
        // If interview score is 0 (no answers), just use ATS score
        if (baseScore === 0) {
            finalScore = atsAnalysis.resumeScore;
        } else {
            // Weighted average: 70% Interview, 30% Resume
            finalScore = Math.round((baseScore * 0.7) + (atsAnalysis.resumeScore * 0.3));
        }
    }

    const avgScore = finalScore;

    // Trigger confetti on high score
    useEffect(() => {
        // Wait for calculation
        if (loading) return;

        // Check if score is high enough (e.g. 70+)
        if (avgScore >= 70 && !showConfetti) {
            // Delay slightly for effect
            const timer = setTimeout(() => {
                setShowConfetti(true);
            }, 800);
            return () => clearTimeout(timer);
        }
    }, [loading, avgScore]);

    const loadReport = async () => {
        try {
            // Fetch each report section with individual error handling
            const [summary, skills, strengths, weaknesses, breakdown, plan] = await Promise.all([
                api.getReportSummary(sessionId!).catch(() => ({ summary: 'Interview completed. Your performance is being evaluated.' })),
                api.getReportSkillMatrix(sessionId!).catch(() => ({ skillMatrix: [] })),
                api.getReportStrengths(sessionId!).catch(() => ({ strengths: ['Completed the interview session'] })),
                api.getReportWeaknesses(sessionId!).catch(() => ({ weaknesses: ['Consider completing more questions for better analysis'] })),
                api.getReportBreakdown(sessionId!).catch(() => ({ breakdown: [] })),
                api.getReportPlan(sessionId!).catch(() => ({ improvementPlan: ['Practice with more interview sessions', 'Review common interview questions'] })),
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
            };

            setReport(finalReport);

            // Calculate score for history (matching component logic)
            const answersWithScores = answers.filter(a => a.evaluation?.score !== undefined);
            const avgFromAnswers = answersWithScores.length > 0
                ? Math.round(answersWithScores.reduce((sum, a) => sum + (a.evaluation?.score || 0), 0) / answersWithScores.length)
                : 0;
            const skillMatrixAvg = finalReport.skillMatrix.length > 0
                ? Math.round(finalReport.skillMatrix.reduce((sum, s) => sum + (s.score || 0), 0) / finalReport.skillMatrix.length)
                : 0;

            let baseScore = avgFromAnswers > 0 ? avgFromAnswers : skillMatrixAvg;
            let finalHistoryScore = baseScore;
            if (atsAnalysis?.resumeScore) {
                if (baseScore === 0) finalHistoryScore = atsAnalysis.resumeScore;
                else finalHistoryScore = Math.round((baseScore * 0.7) + (atsAnalysis.resumeScore * 0.3));
            }

            // Auto-save to local history
            addHistory({
                trackId: trackId || 'general',
                roleId: roleId || 'general',
                companyName: companyName || undefined,
                score: finalHistoryScore,
                report: finalReport
            });
        } catch (error) {
            console.error('Failed to load report:', error);
            // Set fallback report
            setReport({
                summary: 'Interview session completed.',
                skillMatrix: [],
                strengths: ['Completed the interview'],
                weaknesses: ['Complete more questions for better analysis'],
                questionBreakdown: [],
                improvementPlan: ['Practice with more sessions'],
                patternDetection: [],
                resources: [],
            });
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitToLeaderboard = async () => {
        if (!nickname.trim()) return;

        try {
            await api.submitScore({
                nickname: nickname.trim(),
                score: avgScore, // Uses the pre-calculated avgScore with fallbacks
                trackId: trackId!,
                roleId: roleId!,
            });
            setSubmitted(true);
        } catch (error) {
            console.error('Failed to submit score:', error);
        }
    };

    const handleNextSlide = () => {
        if (currentSlide < slides.length - 1) {
            setCurrentSlide(currentSlide + 1);
        }
    };

    const handlePrevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-canvas flex items-center justify-center pt-[72px]">
                <div className="text-center">
                    <div className="mx-auto mb-6">
                        <NeuralKnot size="lg" state="thinking" />
                    </div>
                    <p className="text-lg text-text-secondary">
                        {quinnMode === 'SUPPORTIVE'
                            ? 'Quinn is preparing your personalized evaluation...'
                            : 'Crunching numbers...'}
                    </p>
                </div>
            </div>
        );
    }

    // Mobile Story Mode
    if (isMobile) {
        return (
            <div className="min-h-screen bg-canvas pt-[72px]">
                <Confetti trigger={showConfetti} />

                {/* Story Progress - Fixed segments with min-width */}
                <div className="fixed top-[72px] left-0 right-0 z-30 px-4 pt-4 bg-canvas">
                    <div className="flex gap-1.5">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={() => setCurrentSlide(i)}
                                className={`flex-1 min-w-[24px] h-1.5 rounded-full transition-all duration-300
                                    ${i === currentSlide
                                        ? 'bg-primary'
                                        : i < currentSlide
                                            ? 'bg-accent'
                                            : 'bg-slate-200'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* Story Content */}
                <div className="pt-8 px-4 pb-24 max-w-full overflow-x-hidden">
                    <div className="story-slide w-full">
                        <SlideContent
                            slide={slides[currentSlide]}
                            report={report}
                            avgScore={avgScore}
                            atsAnalysis={atsAnalysis}
                            nickname={nickname}
                            setNickname={setNickname}
                            submitted={submitted}
                            onSubmitScore={handleSubmitToLeaderboard}
                        />
                    </div>
                </div>

                {/* Navigation Buttons */}
                <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-xl border-t border-slate-100 flex gap-3">
                    <button
                        onClick={handlePrevSlide}
                        disabled={currentSlide === 0}
                        className={`flex-1 py-3 rounded-xl font-medium transition-all
                            ${currentSlide === 0
                                ? 'bg-slate-100 text-text-muted'
                                : 'border border-slate-200 text-text hover:bg-slate-50'
                            }`}
                    >
                        ← Previous
                    </button>
                    {currentSlide < slides.length - 1 ? (
                        <button
                            onClick={handleNextSlide}
                            className="flex-1 btn-cta py-3"
                        >
                            Next →
                        </button>
                    ) : (
                        <Link to="/choose-path" className="flex-1 btn-cta py-3 text-center">
                            Try Again →
                        </Link>
                    )}
                </div>
            </div>
        );
    }

    // Desktop Dashboard
    return (
        <div className="min-h-screen bg-canvas pt-[72px]">
            <Confetti trigger={showConfetti} />

            <div className="container py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="page-title">Your Evaluation Report</h1>
                    <p className="page-subtitle">
                        {quinnMode === 'SUPPORTIVE'
                            ? "Here's your personalized feedback. You did great!"
                            : "Here's the breakdown. No sugarcoating."}
                    </p>
                </div>

                {/* Score Circle */}
                <div className="flex justify-center mb-12">
                    <div className="glass-card-strong w-40 h-40 rounded-full flex flex-col items-center justify-center shadow-neural">
                        <span className="text-5xl font-bold text-gradient">{avgScore}</span>
                        <span className="text-sm text-text-secondary mt-1">Average Score</span>
                    </div>
                </div>

                {/* Three Column Grid */}
                <div className="grid lg:grid-cols-3 gap-8 mb-12">
                    {/* Column 1: Strengths & Weaknesses */}
                    <div className="space-y-6">
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                                💪 Strengths
                            </h3>
                            <ul className="space-y-2">
                                {report?.strengths.map((s, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm">
                                        <span className="text-accent mt-0.5">✓</span>
                                        <span className="text-text-secondary">{s}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                                🎯 Areas to Improve
                            </h3>
                            <ul className="space-y-2">
                                {report?.weaknesses.map((w, i) => (
                                    <li key={i} className="flex items-start gap-2 text-sm">
                                        <span className="text-warning mt-0.5">•</span>
                                        <span className="text-text-secondary">{w}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Column 2: Skill Matrix & Content */}
                    <div className="space-y-6">
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                                📊 Skill Matrix
                            </h3>
                            <div className="space-y-3">
                                {report?.skillMatrix.map((skill) => (
                                    <div key={skill.skill}>
                                        <div className="flex justify-between text-sm mb-1">
                                            <span className="text-text-secondary">{skill.skill}</span>
                                            <span className="font-medium text-text">{skill.score}%</span>
                                        </div>
                                        <div className="progress-bar">
                                            <div
                                                className="progress-bar-fill"
                                                style={{ width: `${skill.score}%` }}
                                            />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                                📝 Summary
                            </h3>
                            <p className="text-text-secondary text-sm leading-relaxed">
                                {report?.summary}
                            </p>
                        </div>
                    </div>

                    {/* Column 3: Plan & Leaderboard */}
                    <div className="space-y-6">
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                                🚀 Improvement Plan
                            </h3>
                            <ol className="space-y-3">
                                {report?.improvementPlan.map((step, i) => (
                                    <li key={i} className="flex items-start gap-3 text-sm">
                                        <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0">
                                            {i + 1}
                                        </span>
                                        <span className="text-text-secondary">{step}</span>
                                    </li>
                                ))}
                            </ol>
                        </div>

                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                                🏅 Join Leaderboard
                            </h3>
                            {submitted ? (
                                <div className="text-center py-4">
                                    <span className="text-3xl mb-2 block">✅</span>
                                    <p className="text-sm text-text-secondary mb-4">Score submitted!</p>
                                    <Link to="/leaderboard" className="text-primary font-medium hover:underline">
                                        View Leaderboard →
                                    </Link>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Enter nickname..."
                                        value={nickname}
                                        onChange={(e) => setNickname(e.target.value)}
                                        maxLength={20}
                                    />
                                    <button
                                        onClick={handleSubmitToLeaderboard}
                                        disabled={!nickname.trim()}
                                        className={`w-full py-3 rounded-xl font-medium transition-all
                                            ${nickname.trim()
                                                ? 'btn-primary'
                                                : 'bg-slate-100 text-text-muted cursor-not-allowed'
                                            }`}
                                    >
                                        Submit Score
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className="flex justify-center gap-4">
                    <Link to="/choose-path" className="btn-cta px-8 py-3">
                        Try Another Track →
                    </Link>
                    <Link to="/" className="btn-ghost px-8 py-3">
                        Back to Home
                    </Link>
                </div>
            </div>
        </div>
    );
}

// Slide Content Component
function SlideContent({
    slide,
    report,
    avgScore,
    atsAnalysis,
    nickname,
    setNickname,
    submitted,
    onSubmitScore
}: {
    slide: Slide;
    report: any;
    avgScore: number;
    atsAnalysis?: any;
    nickname: string;
    setNickname: (v: string) => void;
    submitted: boolean;
    onSubmitScore: () => void;
}) {
    switch (slide.type) {
        case 'score':
            return (
                <div className="text-center py-12">
                    <div className="glass-card-strong w-36 h-36 rounded-full flex flex-col items-center justify-center mx-auto shadow-neural mb-6">
                        <span className="text-5xl font-bold text-gradient">{avgScore}</span>
                        <span className="text-xs text-text-secondary mt-1">Overall Score</span>
                    </div>

                    {/* Score Breakdown (Transparent Explanation) */}
                    <div className="mb-6 bg-slate-50 inline-block px-4 py-2 rounded-lg border border-slate-100">
                        <p className="text-xs font-semibold text-text-secondary mb-1">SCORE COMPOSITION</p>
                        <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 text-xs">
                            <div className="flex items-center gap-1">
                                <span className="w-2 h-2 rounded-full bg-primary/70"></span>
                                <span>Interview: 70%</span>
                            </div>
                            {atsAnalysis?.resumeScore ? (
                                <div className="flex items-center gap-1">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500/70"></span>
                                    <span>Resume (ATS): 30%</span>
                                </div>
                            ) : null}
                        </div>
                    </div>

                    <h2 className="text-2xl font-bold text-text mb-2">
                        {avgScore >= 80 ? 'Excellent Work! 🎉' : avgScore >= 60 ? 'Good Progress!' : avgScore >= 40 ? 'Keep Building!' : 'Every Step Counts!'}
                    </h2>
                    <p className="text-text-secondary">
                        {avgScore >= 80
                            ? "You're interview-ready! Keep refining your skills."
                            : avgScore >= 60
                                ? "You're almost there! Focus on your improvement areas."
                                : avgScore >= 40
                                    ? "Great start! Practice the suggested frameworks."
                                    : report?.summary?.slice(0, 100) + '...'}
                    </p>
                </div>
            );

        case 'strengths':
            return (
                <div className="py-8">
                    <h2 className="text-2xl font-bold text-text mb-6 text-center">💪 Your Strengths</h2>
                    <div className="space-y-3">
                        {report?.strengths.map((s: string, i: number) => (
                            <div key={i} className="glass-card p-4 animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className="flex items-start gap-3">
                                    <span className="text-accent text-lg">✓</span>
                                    <p className="text-text">{s}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'weaknesses':
            return (
                <div className="py-8">
                    <h2 className="text-2xl font-bold text-text mb-6 text-center">🎯 Areas to Improve</h2>
                    <div className="space-y-3">
                        {report?.weaknesses.map((w: string, i: number) => (
                            <div key={i} className="glass-card p-4 animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className="flex items-start gap-3">
                                    <span className="text-warning text-lg">•</span>
                                    <p className="text-text">{w}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'content':
            return (
                <div className="py-8">
                    <h2 className="text-2xl font-bold text-text mb-6 text-center">📝 Content Analysis</h2>
                    <div className="space-y-4">
                        {report?.questionBreakdown?.slice(0, 3).map((q: any, i: number) => (
                            <div key={i} className="glass-card p-4">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="font-medium text-text">Q{i + 1}</span>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium
                                        ${q.score >= 70 ? 'bg-green-100 text-green-700' :
                                            q.score >= 50 ? 'bg-yellow-100 text-yellow-700' :
                                                'bg-red-100 text-red-700'}`}>
                                        {q.score}/100
                                    </span>
                                </div>
                                <p className="text-sm text-text-secondary">{q.feedback}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'plan':
            return (
                <div className="py-8">
                    <h2 className="text-2xl font-bold text-text mb-6 text-center">🚀 Your Improvement Plan</h2>
                    <div className="space-y-4">
                        {report?.improvementPlan.map((step: string, i: number) => (
                            <div key={i} className="glass-card p-4 flex items-start gap-4 animate-slide-up" style={{ animationDelay: `${i * 0.1}s` }}>
                                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold flex-shrink-0">
                                    {i + 1}
                                </div>
                                <p className="text-text">{step}</p>
                            </div>
                        ))}
                    </div>
                </div>
            );

        case 'leaderboard':
            return (
                <div className="py-8">
                    <h2 className="text-2xl font-bold text-text mb-6 text-center">🏅 Join the Leaderboard</h2>
                    {submitted ? (
                        <div className="glass-card p-8 text-center">
                            <span className="text-5xl mb-4 block">✅</span>
                            <p className="text-lg font-medium text-text mb-4">Score submitted!</p>
                            <Link to="/leaderboard" className="btn-cta inline-block">
                                View Leaderboard →
                            </Link>
                        </div>
                    ) : (
                        <div className="glass-card p-6 space-y-4">
                            <p className="text-text-secondary text-center">
                                Enter a nickname to submit your score anonymously
                            </p>
                            <input
                                type="text"
                                className="form-input"
                                placeholder="Your nickname..."
                                value={nickname}
                                onChange={(e) => setNickname(e.target.value)}
                                maxLength={20}
                            />
                            <button
                                onClick={onSubmitScore}
                                disabled={!nickname.trim()}
                                className={`w-full py-3 rounded-xl font-medium transition-all
                                    ${nickname.trim()
                                        ? 'btn-cta'
                                        : 'bg-slate-100 text-text-muted cursor-not-allowed'
                                    }`}
                            >
                                Submit Score
                            </button>
                        </div>
                    )}
                </div>
            );

        default:
            return null;
    }
}

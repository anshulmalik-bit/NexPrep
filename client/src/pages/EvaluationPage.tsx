import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterviewStore } from '../store/interview-store';
import { api } from '../services/api';
import { Button } from '../components/Button';
import './EvaluationPage.css';

export function EvaluationPage() {
    const navigate = useNavigate();
    const { sessionId, answers, quinnMode, trackId, roleId, setReport, report } = useInterviewStore();
    const [loading, setLoading] = useState(true);
    const [currentSlide, setCurrentSlide] = useState(0);
    const [nickname, setNickname] = useState('');
    const [submitted, setSubmitted] = useState(false);
    const storyRef = useRef<HTMLDivElement>(null);
    const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

    useEffect(() => {
        const handleResize = () => setIsMobile(window.innerWidth < 768);
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    useEffect(() => {
        if (!sessionId) {
            navigate('/tracks');
            return;
        }
        loadReport();
    }, [sessionId]);

    const loadReport = async () => {
        try {
            // Load all report chunks
            const [summary, skills, strengths, weaknesses, breakdown, plan] = await Promise.all([
                api.getReportSummary(sessionId!),
                api.getReportSkillMatrix(sessionId!),
                api.getReportStrengths(sessionId!),
                api.getReportWeaknesses(sessionId!),
                api.getReportBreakdown(sessionId!),
                api.getReportPlan(sessionId!),
            ]);

            setReport({
                summary: summary.summary,
                skillMatrix: skills.skillMatrix,
                strengths: strengths.strengths,
                weaknesses: weaknesses.weaknesses,
                questionBreakdown: breakdown.breakdown,
                improvementPlan: plan.improvementPlan,
                patternDetection: [],
                resources: [],
            });
        } catch (error) {
            console.error('Failed to load report:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSubmitToLeaderboard = async () => {
        if (!nickname.trim()) return;

        const avgScore = answers.reduce((sum, a) => sum + (a.evaluation?.score || 0), 0) / answers.length;

        try {
            await api.submitScore({
                nickname: nickname.trim(),
                score: Math.round(avgScore),
                trackId: trackId!,
                roleId: roleId!,
            });
            setSubmitted(true);
        } catch (error) {
            console.error('Failed to submit score:', error);
        }
    };

    const handleScrollToSlide = (index: number) => {
        setCurrentSlide(index);
        if (storyRef.current) {
            const slideWidth = storyRef.current.offsetWidth;
            storyRef.current.scrollTo({ left: slideWidth * index, behavior: 'smooth' });
        }
    };

    const avgScore = answers.length > 0
        ? Math.round(answers.reduce((sum, a) => sum + (a.evaluation?.score || 0), 0) / answers.length)
        : 0;

    if (loading) {
        return (
            <div className="evaluation-page evaluation-page--loading">
                <div className="container text-center">
                    <div className="loading-spinner" style={{ width: 48, height: 48, margin: '0 auto' }} />
                    <p className="mt-6">
                        {quinnMode === 'SUPPORTIVE'
                            ? 'Quinn is preparing your personalized evaluation...'
                            : 'Crunching numbers...'}
                    </p>
                </div>
            </div>
        );
    }

    // Mobile Story Format
    if (isMobile) {
        const slides = [
            { title: 'Summary', content: report?.summary },
            { title: 'Strengths', content: report?.strengths },
            { title: 'Areas to Improve', content: report?.weaknesses },
            ...(report?.questionBreakdown || []).map((q, i) => ({
                title: `Q${i + 1} Feedback`,
                content: q,
            })),
            { title: 'Your Plan', content: report?.improvementPlan },
        ];

        return (
            <div className="evaluation-page evaluation-page--mobile">
                <div className="story-progress">
                    {slides.map((_, i) => (
                        <div
                            key={i}
                            className={`story-progress__bar ${i === currentSlide ? 'story-progress__bar--active' : i < currentSlide ? 'story-progress__bar--complete' : ''}`}
                            onClick={() => handleScrollToSlide(i)}
                        />
                    ))}
                </div>

                <div
                    ref={storyRef}
                    className="story-container"
                    onScroll={(e) => {
                        const target = e.target as HTMLDivElement;
                        const newSlide = Math.round(target.scrollLeft / target.offsetWidth);
                        setCurrentSlide(newSlide);
                    }}
                >
                    {slides.map((slide, i) => (
                        <div key={i} className="story-page">
                            <h2 className="story-page__title">{slide.title}</h2>
                            <div className="story-page__content">
                                {Array.isArray(slide.content) ? (
                                    <ul>
                                        {slide.content.map((item, j) => (
                                            <li key={j}>{typeof item === 'string' ? item : (item as { feedback?: string; question?: string }).feedback || (item as { feedback?: string; question?: string }).question}</li>
                                        ))}
                                    </ul>
                                ) : typeof slide.content === 'object' && slide.content !== null ? (
                                    <div className="story-question">
                                        <p className="story-question__text">{(slide.content as any).question}</p>
                                        <div className="story-question__score">
                                            Score: {(slide.content as any).score}/100
                                        </div>
                                        <p>{(slide.content as any).feedback}</p>
                                    </div>
                                ) : (
                                    <p>{slide.content}</p>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    // Desktop Format
    return (
        <div className="evaluation-page">
            <div className="container">
                <div className="page-header text-center">
                    <h1 className="page-title">Your Evaluation Report</h1>
                    <p className="page-subtitle">
                        {quinnMode === 'SUPPORTIVE'
                            ? "Here's your personalized feedback. You did great!"
                            : "Here's the breakdown. No sugarcoating."}
                    </p>
                </div>

                <div className="evaluation-score">
                    <div className="evaluation-score__circle">
                        <span className="evaluation-score__number">{avgScore}</span>
                        <span className="evaluation-score__label">Average Score</span>
                    </div>
                </div>

                {/* Summary */}
                <section className="eval-section">
                    <h2>📝 Summary</h2>
                    <p>{report?.summary}</p>
                </section>

                {/* Skill Matrix */}
                <section className="eval-section">
                    <h2>📊 Skill Matrix</h2>
                    <div className="skill-matrix">
                        {report?.skillMatrix.map((skill) => (
                            <div key={skill.skill} className="skill-row">
                                <span className="skill-row__label">{skill.skill}</span>
                                <div className="skill-row__bar">
                                    <div
                                        className="skill-row__fill"
                                        style={{ width: `${skill.score}%` }}
                                    />
                                </div>
                                <span className="skill-row__value">{skill.score}%</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Strengths & Weaknesses */}
                <div className="eval-grid">
                    <section className="eval-section eval-section--strengths">
                        <h2>💪 Strengths</h2>
                        <ul>
                            {report?.strengths.map((s, i) => <li key={i}>{s}</li>)}
                        </ul>
                    </section>
                    <section className="eval-section eval-section--weaknesses">
                        <h2>🎯 Areas to Improve</h2>
                        <ul>
                            {report?.weaknesses.map((w, i) => <li key={i}>{w}</li>)}
                        </ul>
                    </section>
                </div>

                {/* Question Breakdown */}
                <section className="eval-section">
                    <h2>📋 Question-by-Question Breakdown</h2>
                    <div className="question-breakdown">
                        {report?.questionBreakdown.map((q, i) => (
                            <div key={i} className="breakdown-card">
                                <div className="breakdown-card__header">
                                    <span className="breakdown-card__number">Q{i + 1}</span>
                                    <span className={`breakdown-card__score ${q.score >= 70 ? 'good' : q.score >= 50 ? 'ok' : 'needs-work'}`}>
                                        {q.score}/100
                                    </span>
                                </div>
                                <p className="breakdown-card__question">{q.question}</p>
                                <p className="breakdown-card__feedback">{q.feedback}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Improvement Plan */}
                <section className="eval-section eval-section--plan">
                    <h2>🚀 Your Improvement Plan</h2>
                    <ol>
                        {report?.improvementPlan.map((step, i) => <li key={i}>{step}</li>)}
                    </ol>
                </section>

                {/* Leaderboard Submission */}
                <section className="eval-section eval-section--leaderboard">
                    <h2>🏆 Join the Leaderboard</h2>
                    {submitted ? (
                        <div className="leaderboard-success">
                            <p>✅ Score submitted! Check the leaderboard to see your ranking.</p>
                            <Button to="/leaderboard" variant="secondary">
                                View Leaderboard
                            </Button>
                        </div>
                    ) : (
                        <div className="leaderboard-submit">
                            <p>Enter a nickname to submit your score anonymously.</p>
                            <div className="leaderboard-submit__form">
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Your nickname..."
                                    value={nickname}
                                    onChange={(e) => setNickname(e.target.value)}
                                    maxLength={20}
                                />
                                <Button
                                    variant="cta"
                                    onClick={handleSubmitToLeaderboard}
                                    disabled={!nickname.trim()}
                                >
                                    Submit Score
                                </Button>
                            </div>
                        </div>
                    )}
                </section>

                <div className="eval-actions">
                    <Button to="/tracks" variant="secondary">
                        Try Another Track
                    </Button>
                    <Button to="/" variant="ghost">
                        Back to Home
                    </Button>
                </div>
            </div>
        </div>
    );
}

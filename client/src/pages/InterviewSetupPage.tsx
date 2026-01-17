import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterviewStore } from '../store/interview-store';
import { popularCompanies } from '../data/tracks';
import { NeuralKnot } from '../components/NeuralKnot';
import { api } from '../services/api';
import type { ATSAnalysis } from '../services/api';

interface BriefingData {
    overview: string;
    marketPosition: string;
    recentNews: string;
    culture: string;
    roleExpectations: string;
    quinnPerspective: string;
}

export function InterviewSetupPage() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        trackId,
        roleId,
        setCompanyInfo,
        setResumeData,
        setQuinnMode,
        setAnswerMode,
        resetSession
    } = useInterviewStore();

    // Reset session whenever we enter setup
    useEffect(() => {
        resetSession();
    }, []);

    const [companyName, setCompanyName] = useState('');
    const [companySearch, setCompanySearch] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'news' | 'culture'>('overview');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [resumeText, setResumeText] = useState('');
    const [quinnTone, setQuinnTone] = useState<'SUPPORTIVE' | 'DIRECT'>('SUPPORTIVE');
    const [isUploading, setIsUploading] = useState(false);
    const [briefing, setBriefing] = useState<BriefingData | null>(null);
    const [loadingBriefing, setLoadingBriefing] = useState(false);
    const [atsAnalysis, setAtsAnalysis] = useState<ATSAnalysis | null>(null);

    // Fetch company briefing when company is selected (with debounce for typing)
    useEffect(() => {
        if (companyName) {
            // Debounce: wait 500ms after user stops typing
            const timeoutId = setTimeout(async () => {
                setLoadingBriefing(true);
                try {
                    const result = await api.getBriefing({
                        companyName,
                        roleId: roleId || 'general', // Use 'general' if no role selected
                        quinnMode: quinnTone,
                    });
                    setBriefing(result);
                } catch (error) {
                    console.error('Failed to fetch briefing:', error);
                    setBriefing(null);
                } finally {
                    setLoadingBriefing(false);
                }
            }, 500);

            return () => clearTimeout(timeoutId);
        } else {
            setBriefing(null);
        }
    }, [companyName, roleId, quinnTone]);

    const filteredCompanies = popularCompanies.filter(c =>
        c.toLowerCase().includes(companySearch.toLowerCase())
    );

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setResumeFile(file);
        setAtsAnalysis(null);

        try {
            const result = await api.uploadResume(file, {
                roleId: roleId || 'general',
                companyName: companyName || undefined
            });

            setResumeText(result.text);

            // Save to store
            setResumeData(result.text, result.keywords, result.atsAnalysis);

            if (result.atsAnalysis) {
                setAtsAnalysis(result.atsAnalysis);
            }
        } catch (error) {
            console.error('Resume upload failed:', error);
            setResumeText('');
        } finally {
            setIsUploading(false);
        }
    };

    const handleStartSimulation = () => {
        setCompanyInfo(companyName || undefined, undefined);
        setResumeData(resumeText || undefined, undefined);
        setQuinnMode(quinnTone);

        // Default to VIDEO mode for the full experience (permissions checked in Calibration)
        setAnswerMode('VIDEO');
        navigate('/calibration');
    };

    const canProceed = trackId && roleId;

    return (
        <div className="min-h-screen bg-canvas pt-[72px]">
            <div className="container py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="page-title">Interview Setup</h1>
                    <p className="page-subtitle">
                        Customize your practice session with company context and your resume
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-8 max-w-6xl mx-auto">
                    {/* Left Column: Company Selector */}
                    <div className="space-y-6">
                        {trackId === 'general' ? (
                            <div className="glass-card p-6 border-l-4 border-primary bg-primary/5">
                                <h3 className="text-lg font-semibold text-text mb-2">⚡ Quick Mode Active</h3>
                                <p className="text-text-secondary">
                                    You are entering a <strong>Generic HR Round</strong>.
                                    We will skip the resume upload and job description to focus on standard behavioral questions.
                                </p>
                            </div>
                        ) : null}

                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                                <span>🏢</span> Target Company
                                <span className="text-xs font-normal text-text-muted">(Optional)</span>
                            </h3>

                            {/* Search */}
                            <div className="relative mb-4">
                                <input
                                    type="text"
                                    className="form-input pl-10 focus:ring-2 focus:ring-primary/30 focus:border-primary"
                                    placeholder="Search companies..."
                                    value={companySearch}
                                    onChange={(e) => {
                                        setCompanySearch(e.target.value);
                                        setCompanyName(e.target.value);
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter') {
                                            e.preventDefault();
                                        }
                                    }}
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" aria-hidden="true">
                                    🔍
                                </span>
                            </div>

                            {/* Popular Companies */}
                            {companySearch === '' && (
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {popularCompanies.slice(0, 8).map((company) => (
                                        <button
                                            key={company}
                                            onClick={() => {
                                                setCompanyName(company);
                                                setCompanySearch(company);
                                            }}
                                            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all
                                                ${companyName === company
                                                    ? 'bg-primary text-white'
                                                    : 'bg-slate-100 text-text-secondary hover:bg-slate-200'
                                                }`}
                                        >
                                            {company}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Search Results */}
                            {companySearch && filteredCompanies.length > 0 && companySearch !== companyName && (
                                <div className="absolute left-0 right-0 top-full mt-1 border border-slate-200 rounded-xl overflow-hidden mb-4 bg-white shadow-lg z-20">
                                    {filteredCompanies.slice(0, 5).map((company) => (
                                        <button
                                            key={company}
                                            onClick={() => {
                                                setCompanyName(company);
                                                setCompanySearch(company);
                                            }}
                                            className="w-full px-4 py-3 text-left hover:bg-slate-50 transition-colors border-b last:border-b-0 border-slate-100"
                                        >
                                            {company}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Company Tabs */}
                            {companyName && (
                                <div className="mt-6">
                                    <div className="flex gap-1 p-1 bg-slate-100 rounded-xl mb-4">
                                        {(['overview', 'news', 'culture'] as const).map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium capitalize transition-all
                                                    ${activeTab === tab
                                                        ? 'bg-white text-text shadow-sm'
                                                        : 'text-text-secondary hover:text-text'
                                                    }`}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="bg-slate-50 rounded-xl p-4 min-h-[80px]">
                                        {loadingBriefing ? (
                                            <div className="flex items-center gap-2">
                                                <div className="animate-spin w-4 h-4 border-2 border-primary border-t-transparent rounded-full" />
                                                <span className="text-sm text-text-secondary">Researching {companyName}...</span>
                                            </div>
                                        ) : briefing ? (
                                            <>
                                                {activeTab === 'overview' && (
                                                    <div className="space-y-2">
                                                        <p className="text-text-secondary text-sm">{briefing.overview}</p>
                                                        <p className="text-text-secondary text-sm"><strong>Market Position:</strong> {briefing.marketPosition}</p>
                                                    </div>
                                                )}
                                                {activeTab === 'news' && (
                                                    <p className="text-text-secondary text-sm">{briefing.recentNews}</p>
                                                )}
                                                {activeTab === 'culture' && (
                                                    <div className="space-y-2">
                                                        <p className="text-text-secondary text-sm">{briefing.culture}</p>
                                                        <p className="text-text-secondary text-sm"><strong>Role Expectations:</strong> {briefing.roleExpectations}</p>
                                                    </div>
                                                )}
                                            </>
                                        ) : (
                                            <p className="text-text-muted text-sm italic">Select a company and role to see AI-powered research</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Quinn Insight */}
                            {companyName && briefing && (
                                <div className="mt-4 flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                                    <div className="flex-shrink-0">
                                        <NeuralKnot size="sm" state="coaching" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-text font-medium">Quinn's Insight</p>
                                        <p className="text-sm text-text-secondary mt-1">
                                            {briefing.quinnPerspective || `I'll tailor questions based on ${companyName}'s interview style and culture.`}
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Resume Upload (Hidden for General Track) */}
                    <div className="space-y-6">
                        {trackId !== 'general' && (
                            <div className="glass-card p-6">
                                <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                                    <span>📄</span> Your Resume
                                    <span className="text-xs font-normal text-text-muted">(Optional)</span>
                                </h3>

                                {/* Upload Box */}
                                <div
                                    onClick={() => fileInputRef.current?.click()}
                                    className={`relative border-2 border-dashed rounded-xl p-8 text-center cursor-pointer transition-all duration-300
                                    ${resumeFile
                                            ? 'border-accent bg-accent/5'
                                            : 'border-primary/30 hover:border-primary hover:bg-primary/5'
                                        }`}
                                >
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept=".pdf,.doc,.docx,.txt"
                                        className="hidden"
                                        onChange={handleFileUpload}
                                    />

                                    {isUploading ? (
                                        <div className="flex flex-col items-center">
                                            <div className="loading-spinner mb-4" />
                                            <p className="text-text-secondary">Processing resume...</p>
                                        </div>
                                    ) : resumeFile ? (
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center text-2xl mb-3">
                                                ✓
                                            </div>
                                            <p className="font-medium text-text">{resumeFile.name}</p>
                                            <p className="text-sm text-text-secondary mt-1">Click to replace</p>
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center">
                                            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center text-2xl mb-3">
                                                📤
                                            </div>
                                            <p className="font-medium text-text">Drop your resume here</p>
                                            <p className="text-sm text-text-secondary mt-1">or click to browse</p>
                                            <p className="text-xs text-text-muted mt-3">PDF, DOCX, or TXT</p>
                                        </div>
                                    )}
                                </div>

                                {/* ATS Score Display */}
                                {resumeFile && atsAnalysis && (
                                    <div className="mt-4 space-y-4">
                                        {/* Score Header */}
                                        <div className="flex items-center gap-4 p-4 bg-slate-50 rounded-xl">
                                            <div className={`w-16 h-16 rounded-full flex items-center justify-center text-2xl font-bold text-white
                                            ${atsAnalysis.resumeScore >= 70 ? 'bg-green-500' :
                                                    atsAnalysis.resumeScore >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}>
                                                {atsAnalysis.resumeScore}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-text">ATS Score</p>
                                                <p className="text-sm text-text-secondary">
                                                    {atsAnalysis.resumeScore >= 70 ? 'Good match for this role' :
                                                        atsAnalysis.resumeScore >= 40 ? 'Needs improvement' : 'Major gaps identified'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Score Breakdown */}
                                        <div className="grid grid-cols-2 gap-2 text-sm">
                                            <div className="flex justify-between p-2 bg-slate-50 rounded">
                                                <span className="text-text-secondary">Role Relevance</span>
                                                <span className="font-medium">{atsAnalysis.roleRelevance}%</span>
                                            </div>
                                            <div className="flex justify-between p-2 bg-slate-50 rounded">
                                                <span className="text-text-secondary">Industry Fit</span>
                                                <span className="font-medium">{atsAnalysis.industryFit}%</span>
                                            </div>
                                            <div className="flex justify-between p-2 bg-slate-50 rounded">
                                                <span className="text-text-secondary">Achievements</span>
                                                <span className="font-medium">{atsAnalysis.achievementsImpact}%</span>
                                            </div>
                                            <div className="flex justify-between p-2 bg-slate-50 rounded">
                                                <span className="text-text-secondary">Communication</span>
                                                <span className="font-medium">{atsAnalysis.communicationQuality}%</span>
                                            </div>
                                        </div>

                                        {/* Weaknesses (Harsh Feedback) */}
                                        {atsAnalysis.weaknesses.length > 0 && (
                                            <div className="p-4 bg-red-50 rounded-xl border border-red-100">
                                                <p className="font-medium text-red-700 mb-2">Issues Found:</p>
                                                <ul className="text-sm text-red-600 space-y-1">
                                                    {atsAnalysis.weaknesses.slice(0, 4).map((w, i) => (
                                                        <li key={i}>• {w}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}

                                        {/* Strengths */}
                                        {atsAnalysis.strengths.length > 0 && (
                                            <div className="p-4 bg-green-50 rounded-xl border border-green-100">
                                                <p className="font-medium text-green-700 mb-2">Strengths:</p>
                                                <ul className="text-sm text-green-600 space-y-1">
                                                    {atsAnalysis.strengths.map((s, i) => (
                                                        <li key={i}>• {s}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Fallback for resume without analysis */}
                                {resumeFile && !atsAnalysis && !isUploading && (
                                    <div className="mt-4 flex items-start gap-3 p-4 bg-accent/5 rounded-xl border border-accent/10">
                                        <div className="flex-shrink-0">
                                            <NeuralKnot size="sm" state="speaking" />
                                        </div>
                                        <div>
                                            <p className="text-sm text-text font-medium">Resume Uploaded</p>
                                            <p className="text-sm text-text-secondary mt-1">
                                                I'll use your background to personalize the interview questions.
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Quinn Tone Selection - spans both columns */}
                    <div className="lg:col-span-2 mt-4">
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold text-text mb-6 text-center">
                                Quinn's Coaching Style
                            </h3>

                            <div className="grid sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
                                <button
                                    onClick={() => setQuinnTone('SUPPORTIVE')}
                                    className={`p-6 rounded-xl border-2 transition-all duration-300
                                    ${quinnTone === 'SUPPORTIVE'
                                            ? 'border-primary bg-primary/5 shadow-frost'
                                            : 'border-slate-200 hover:border-primary/30'
                                        }`}
                                >
                                    <div className="text-3xl mb-3">🤗</div>
                                    <h4 className="font-semibold text-text mb-1">Supportive</h4>
                                    <p className="text-sm text-text-secondary">Warm, encouraging feedback</p>
                                </button>

                                <button
                                    onClick={() => setQuinnTone('DIRECT')}
                                    className={`p-6 rounded-xl border-2 transition-all duration-300
                                    ${quinnTone === 'DIRECT'
                                            ? 'border-primary bg-primary/5 shadow-frost'
                                            : 'border-slate-200 hover:border-primary/30'
                                        }`}
                                >
                                    <div className="text-3xl mb-3">🎯</div>
                                    <h4 className="font-semibold text-text mb-1">Direct</h4>
                                    <p className="text-sm text-text-secondary">Concise, no-nonsense approach</p>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Start Button - Fixed at bottom */}
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-xl border-t border-slate-100 shadow-frost-lg z-40">
                        <div className="max-w-md mx-auto">
                            <button
                                onClick={handleStartSimulation}
                                disabled={!canProceed}
                                className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300
                                ${canProceed
                                        ? 'btn-cta'
                                        : 'bg-slate-100 text-text-muted cursor-not-allowed'
                                    }`}
                            >
                                Start Interview →
                            </button>
                            {!canProceed && (
                                <p className="text-center text-sm text-text-muted mt-2">
                                    {!trackId ? 'Please select a track first' : 'Please select a role first'}
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Bottom padding to account for fixed button */}
                    <div className="h-32"></div>
                </div>
            </div>
        </div>
    );
}

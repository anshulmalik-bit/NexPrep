import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterviewStore } from '../store/interview-store';
import { popularCompanies } from '../data/tracks';
import { NeuralKnot } from '../components/NeuralKnot';
import { api } from '../services/api';
import { motion } from 'framer-motion';
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
    const atsResultRef = useRef<HTMLDivElement>(null);

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

    // Auto-scroll to ATS results when analysis is complete
    useEffect(() => {
        if (atsAnalysis && atsResultRef.current) {
            atsResultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [atsAnalysis]);

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
            <div className="container py-6">
                {/* Header */}
                <div className="text-center mb-10">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-3 bg-clip-text text-transparent bg-gradient-to-r from-slate-900 to-slate-600">
                        AI Resume Intelligence
                    </h1>
                    <p className="text-slate-500 text-sm font-bold uppercase tracking-widest max-w-lg mx-auto leading-relaxed">
                        Instant ATS Analysis & Professional Simulation Prep
                    </p>
                </div>

                <div className="grid lg:grid-cols-2 gap-6 max-w-6xl mx-auto">
                    {/* Left Column: ATS & Resume (The Hero) */}
                    <div className="space-y-6">
                        <div className="glass-card p-8 bg-white ring-2 ring-primary/5 shadow-2xl shadow-primary/5 relative overflow-hidden transition-all duration-500 hover:ring-primary/20">
                            {/* Hero Accent */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 blur-3xl" />

                            <h3 className="text-xl font-black text-slate-900 mb-6 flex items-center gap-3">
                                <span className="w-10 h-10 rounded-xl bg-primary text-white flex items-center justify-center text-lg shadow-lg shadow-primary/20">📄</span>
                                ATS Resume Checker
                                <div className="ml-auto flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">Live Intelligence</span>
                                </div>
                            </h3>

                            {/* Role Selector (Inline if track is general/null) */}
                            {(!trackId || trackId === 'general') && (
                                <div className="mb-6 p-5 bg-amber-50 rounded-2xl border border-amber-200/50 shadow-sm transition-all hover:shadow-md">
                                    <div className="flex items-center gap-2 mb-1">
                                        <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">Targeting Accuracy</span>
                                        <span className="px-2 py-0.5 bg-amber-100 text-[9px] font-bold text-amber-700 rounded-full">Required</span>
                                    </div>
                                    <p className="text-slate-600 mb-3 text-xs leading-relaxed font-medium">
                                        For an accurate ATS score, Quinn needs to know your <strong>Target Role</strong>.
                                    </p>
                                    <button
                                        onClick={() => navigate('/choose-path')}
                                        className="text-xs font-bold text-amber-700 hover:text-amber-800 flex items-center gap-1 group"
                                    >
                                        Select My Target Role <span className="group-hover:translate-x-1 transition-transform">→</span>
                                    </button>
                                </div>
                            )}

                            {/* Upload Box */}
                            <div
                                onClick={() => fileInputRef.current?.click()}
                                className={`relative border-2 border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all duration-500 overflow-hidden group
                                ${resumeFile
                                        ? 'border-emerald-500 bg-emerald-50/20'
                                        : 'border-slate-200 hover:border-primary hover:bg-primary/[0.02]'
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
                                    <div className="flex flex-col items-center relative py-4">
                                        <div className="absolute inset-x-0 top-0 bottom-0 overflow-hidden rounded-3xl pointer-events-none">
                                            <motion.div
                                                className="w-full h-[2px] bg-gradient-to-r from-transparent via-primary to-transparent shadow-[0_0_15px_rgba(99,102,241,0.5)]"
                                                animate={{ top: ['0%', '100%'] }}
                                                transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }}
                                                style={{ position: 'absolute' }}
                                            />
                                        </div>
                                        <div className="w-20 h-20 rounded-2xl bg-primary/10 flex items-center justify-center text-4xl mb-4 animate-pulse">📄</div>
                                        <p className="text-primary font-bold uppercase tracking-widest text-xs">Parsing Document...</p>
                                    </div>
                                ) : resumeFile ? (
                                    <div className="flex flex-col items-center">
                                        <div className="w-20 h-20 rounded-full bg-emerald-500 text-white flex items-center justify-center text-3xl mb-4 shadow-xl shadow-emerald-500/30">
                                            ✓
                                        </div>
                                        <p className="font-bold text-slate-900 pr-2 truncate max-w-[250px]">{resumeFile.name}</p>
                                        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-[0.2em] mt-2">Analysis Ready</p>
                                    </div>
                                ) : (
                                    <div className="flex flex-col items-center">
                                        <div className="w-20 h-20 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center text-4xl mb-4 group-hover:scale-110 group-hover:bg-primary/10 group-hover:text-primary transition-all duration-500">
                                            📄
                                        </div>
                                        <p className="text-lg font-bold text-slate-900">Upload your Resume</p>
                                        <p className="text-sm text-slate-500 mt-2 font-medium">Drag & drop or click to browse files</p>
                                        <div className="flex gap-2 mt-6">
                                            {['PDF', 'DOCX', 'TXT'].map(ext => (
                                                <span key={ext} className="text-[9px] font-bold text-slate-400 uppercase tracking-widest border border-slate-100 px-3 py-1 rounded-full group-hover:border-primary/20 group-hover:text-primary/60 transition-colors">
                                                    {ext}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* ATS Score Display */}
                            {resumeFile && atsAnalysis && (
                                <div ref={atsResultRef} className="mt-10 space-y-8 animate-slide-up">
                                    {/* Score Header */}
                                    <div className="flex items-center gap-8 p-8 bg-slate-50 rounded-3xl border border-slate-100 ring-1 ring-black/5 relative overflow-hidden">
                                        <div className="relative z-10">
                                            <svg className="w-24 h-24 transform -rotate-90">
                                                <circle cx="48" cy="48" r="44" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-200" />
                                                <motion.circle
                                                    cx="48"
                                                    cy="48"
                                                    r="44"
                                                    stroke="currentColor"
                                                    strokeWidth="8"
                                                    strokeDasharray={2 * Math.PI * 44}
                                                    initial={{ strokeDashoffset: 2 * Math.PI * 44 }}
                                                    animate={{ strokeDashoffset: 2 * Math.PI * 44 * (1 - atsAnalysis.resumeScore / 100) }}
                                                    transition={{ duration: 1.5, ease: "easeOut" }}
                                                    fill="transparent"
                                                    className={atsAnalysis.resumeScore >= 70 ? 'text-emerald-500' : atsAnalysis.resumeScore >= 40 ? 'text-amber-500' : 'text-rose-500'}
                                                />
                                            </svg>
                                            <div className="absolute inset-0 flex items-center justify-center font-black text-2xl text-slate-900">
                                                {atsAnalysis.resumeScore}
                                            </div>
                                        </div>
                                        <div className="flex-grow z-10">
                                            <span className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] block mb-2">ATS Compatibility</span>
                                            <p className={`font-black text-2xl ${atsAnalysis.resumeScore >= 70 ? 'text-emerald-600' : atsAnalysis.resumeScore >= 40 ? 'text-amber-600' : 'text-rose-600'}`}>
                                                {atsAnalysis.resumeScore >= 70 ? 'Elite Match' : atsAnalysis.resumeScore >= 40 ? 'Solid Potential' : 'Needs Polish'}
                                            </p>
                                        </div>
                                        <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-slate-200/20 rounded-full blur-2xl" />
                                    </div>

                                    {/* Score Breakdown Grid */}
                                    <div className="grid grid-cols-2 gap-5">
                                        {[
                                            { label: 'Relevance', val: atsAnalysis.roleRelevance, color: 'emerald' },
                                            { label: 'Industry', val: atsAnalysis.industryFit, color: 'indigo' },
                                            { label: 'Impact', val: atsAnalysis.achievementsImpact, color: 'amber' },
                                            { label: 'Polish', val: atsAnalysis.communicationQuality, color: 'primary' }
                                        ].map((stat, i) => (
                                            <div key={i} className="p-5 bg-white border border-slate-100 rounded-2xl shadow-sm transition-all hover:shadow-md hover:-translate-y-1">
                                                <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest block mb-1">{stat.label}</span>
                                                <div className="flex items-end gap-2">
                                                    <span className="text-xl font-black text-slate-900 leading-none">{stat.val}%</span>
                                                    <div className="flex-grow h-2 bg-slate-50 rounded-full mb-1 overflow-hidden">
                                                        <motion.div
                                                            initial={{ width: 0 }}
                                                            animate={{ width: `${stat.val}%` }}
                                                            className={`h-full ${stat.val >= 70 ? 'bg-emerald-400' : 'bg-amber-400'}`}
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Issues & Strengths */}
                                    <div className="grid grid-cols-1 gap-5">
                                        {atsAnalysis.weaknesses.length > 0 && (
                                            <div className="p-6 bg-rose-50/40 rounded-3xl border border-rose-100 transition-all hover:bg-rose-50">
                                                <span className="text-[10px] font-black text-rose-600 uppercase tracking-widest flex items-center gap-2 mb-4">
                                                    ⚠️ Key Gaps Identified
                                                </span>
                                                <ul className="space-y-3">
                                                    {atsAnalysis.weaknesses.slice(0, 3).map((w, i) => (
                                                        <li key={i} className="text-sm text-slate-700 font-bold leading-relaxed pl-5 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-rose-400 before:rounded-full">
                                                            {w}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                        {atsAnalysis.strengths.length > 0 && (
                                            <div className="p-6 bg-emerald-50/40 rounded-3xl border border-emerald-100 transition-all hover:bg-emerald-50">
                                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest flex items-center gap-2 mb-4">
                                                    ✨ Profile Strengths
                                                </span>
                                                <ul className="space-y-3">
                                                    {atsAnalysis.strengths.slice(0, 3).map((s, i) => (
                                                        <li key={i} className="text-sm text-slate-700 font-bold leading-relaxed pl-5 relative before:content-[''] before:absolute before:left-0 before:top-2 before:w-2 before:h-2 before:bg-emerald-400 before:rounded-full">
                                                            {s}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Fallback for resume without analysis */}
                            {resumeFile && !atsAnalysis && !isUploading && (
                                <div className="mt-6 flex items-start gap-5 p-6 bg-slate-50 rounded-3xl border border-slate-100 ring-1 ring-black/5">
                                    <div className="flex-shrink-0 w-12 h-12 bg-white rounded-2xl shadow-sm flex items-center justify-center">
                                        <NeuralKnot size="sm" state="speaking" />
                                    </div>
                                    <div>
                                        <p className="text-base font-black text-slate-900 mb-1">Background Captured</p>
                                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider leading-relaxed">
                                            I'll integrate your professional context into every question I ask.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Context & Refinement */}
                    <div className="space-y-6">
                        <div className="glass-card p-6 bg-white/60">
                            <h3 className="text-lg font-bold text-slate-900 mb-6 flex items-center gap-2">
                                <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-sm">🏢</span>
                                Company Context
                                <span className="text-xs font-normal text-slate-400 ml-auto uppercase tracking-widest">(Secondary)</span>
                            </h3>

                            {/* Search */}
                            <div className="relative mb-6">
                                <input
                                    type="text"
                                    className="w-full bg-white border border-slate-200 rounded-xl px-12 py-3.5 text-slate-700 placeholder:text-slate-400 focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none font-medium"
                                    placeholder="Which company are you interviewing for?"
                                    value={companySearch}
                                    onChange={(e) => {
                                        setCompanySearch(e.target.value);
                                        setCompanyName(e.target.value);
                                    }}
                                />
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
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
                                            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all
                                                ${companyName === company
                                                    ? 'bg-primary text-white shadow-lg shadow-primary/20'
                                                    : 'bg-white text-slate-500 border border-slate-200 hover:border-primary/30'
                                                }`}
                                        >
                                            {company}
                                        </button>
                                    ))}
                                </div>
                            )}

                            {/* Company Tabs */}
                            {companyName && (
                                <div className="mt-8 space-y-6">
                                    <div className="flex gap-2 p-1 bg-slate-100/50 rounded-2xl border border-slate-200/50">
                                        {(['overview', 'news', 'culture'] as const).map((tab) => (
                                            <button
                                                key={tab}
                                                onClick={() => setActiveTab(tab)}
                                                className={`flex-1 px-4 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all
                                                    ${activeTab === tab
                                                        ? 'bg-white text-primary shadow-md'
                                                        : 'text-slate-500 hover:text-slate-700'
                                                    }`}
                                            >
                                                {tab}
                                            </button>
                                        ))}
                                    </div>

                                    <div className="bg-slate-50/50 rounded-2xl p-6 border border-slate-100 min-h-[120px]">
                                        {loadingBriefing ? (
                                            <div className="flex flex-col items-center justify-center py-4 gap-3">
                                                <div className="animate-spin w-6 h-6 border-[3px] border-primary border-t-transparent rounded-full" />
                                                <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Researching {companyName}...</span>
                                            </div>
                                        ) : briefing ? (
                                            <div className="animate-fade-in">
                                                {activeTab === 'overview' && (
                                                    <div className="space-y-4">
                                                        <p className="text-slate-700 text-sm leading-relaxed font-medium">{briefing.overview}</p>
                                                        <div className="pt-4 border-t border-slate-200/50">
                                                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">Market Position</span>
                                                            <p className="text-slate-600 text-xs">{briefing.marketPosition}</p>
                                                        </div>
                                                    </div>
                                                )}
                                                {activeTab === 'news' && (
                                                    <p className="text-slate-700 text-sm leading-relaxed font-medium">{briefing.recentNews}</p>
                                                )}
                                                {activeTab === 'culture' && (
                                                    <div className="space-y-4">
                                                        <p className="text-slate-700 text-sm leading-relaxed font-medium">{briefing.culture}</p>
                                                        <div className="pt-4 border-t border-slate-200/50">
                                                            <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">Role Expectations</span>
                                                            <p className="text-slate-600 text-xs">{briefing.roleExpectations}</p>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        ) : (
                                            <div className="text-center py-4">
                                                <p className="text-slate-400 text-sm font-medium">Select a company to see AI research</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* Quinn Perspective */}
                                    {briefing && (
                                        <div className="flex items-start gap-4 p-5 bg-primary/[0.03] rounded-2xl border border-primary/10 relative overflow-hidden group">
                                            <div className="absolute top-0 right-0 p-2 opacity-10">
                                                <NeuralKnot size="sm" state="idle" />
                                            </div>
                                            <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-white border border-primary/10 flex items-center justify-center shadow-sm">
                                                <NeuralKnot size="sm" state="speaking" />
                                            </div>
                                            <div>
                                                <span className="text-[10px] font-bold text-primary uppercase tracking-widest block mb-1">Quinn's Perspective</span>
                                                <p className="text-xs text-slate-700 font-bold leading-relaxed">
                                                    {briefing.quinnPerspective || `I'll tailor questions based on ${companyName}'s interview style and culture.`}
                                                </p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:col-span-2 mt-4">
                        <div className="glass-card p-10 bg-white/60">
                            <h3 className="text-xl font-bold text-slate-900 mb-8 text-center uppercase tracking-[0.2em]">
                                Coaching Persona
                            </h3>

                            <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
                                <button
                                    onClick={() => setQuinnTone('SUPPORTIVE')}
                                    className={`group p-8 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden
                                    ${quinnTone === 'SUPPORTIVE'
                                            ? 'border-primary bg-primary/[0.03] shadow-xl shadow-primary/10'
                                            : 'border-slate-100 bg-white hover:border-primary/20'
                                        }`}
                                >
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mb-6 transition-transform group-hover:scale-110 
                                        ${quinnTone === 'SUPPORTIVE' ? 'bg-primary/10' : 'bg-slate-50'}`}>
                                        🤗
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900 mb-2">Supportive</h4>
                                    <p className="text-slate-500 text-sm leading-relaxed font-medium">Warm, encouraging feedback. Best for initial practice and confidence building.</p>
                                    {quinnTone === 'SUPPORTIVE' && <div className="absolute top-4 right-4 text-primary">★</div>}
                                </button>

                                <button
                                    onClick={() => setQuinnTone('DIRECT')}
                                    className={`group p-8 rounded-3xl border-2 transition-all duration-300 relative overflow-hidden
                                    ${quinnTone === 'DIRECT'
                                            ? 'border-primary bg-primary/[0.03] shadow-xl shadow-primary/10'
                                            : 'border-slate-100 bg-white hover:border-primary/20'
                                        }`}
                                >
                                    <div className={`w-16 h-16 rounded-2xl flex items-center justify-center text-4xl mb-6 transition-transform group-hover:scale-110
                                        ${quinnTone === 'DIRECT' ? 'bg-primary/10' : 'bg-slate-50'}`}>
                                        🎯
                                    </div>
                                    <h4 className="text-xl font-bold text-slate-900 mb-2">Direct</h4>
                                    <p className="text-slate-500 text-sm leading-relaxed font-medium">Concise, high-pressure, no-nonsense approach. Best for realistic simulations.</p>
                                    {quinnTone === 'DIRECT' && <div className="absolute top-4 right-4 text-primary">★</div>}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Start Button - Fixed at bottom */}
                    <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-2xl border-t border-slate-100 shadow-[0_-10px_40px_rgba(0,0,0,0.05)] z-40">
                        <div className="max-w-md mx-auto">
                            <button
                                onClick={handleStartSimulation}
                                disabled={!canProceed}
                                className={`w-full py-4 rounded-2xl font-bold text-lg transition-all duration-500 relative overflow-hidden group
                                ${canProceed
                                        ? 'bg-slate-900 text-white shadow-xl hover:shadow-primary/20 hover:-translate-y-1'
                                        : 'bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200'
                                    }`}
                            >
                                <span className="relative z-10 flex items-center justify-center gap-2">
                                    {canProceed ? 'Initiate Practice Simulation' : 'Configuration Required'}
                                    {canProceed && <span className="group-hover:translate-x-1 transition-transform">→</span>}
                                </span>
                                {canProceed && (
                                    <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary-light opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                )}
                            </button>
                            {!canProceed && (
                                <p className="text-center text-[10px] font-bold text-slate-500 mt-2 uppercase tracking-widest">
                                    Select a professional track to unlock simulations
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Bottom padding to account for fixed button */}
                    <div className="h-28"></div>
                </div>
            </div>
        </div>
    );
}

import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterviewStore } from '../store/interview-store';
import { popularCompanies } from '../data/tracks';
import { NeuralKnot } from '../components/NeuralKnot';

type AnswerMode = 'text' | 'audio' | 'video';

export function InterviewSetupPage() {
    const navigate = useNavigate();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const {
        trackId,
        roleId,
        setCompanyInfo,
        setResumeData,
        setQuinnMode
    } = useInterviewStore();

    const [companyName, setCompanyName] = useState('');
    const [companySearch, setCompanySearch] = useState('');
    const [activeTab, setActiveTab] = useState<'overview' | 'news' | 'culture'>('overview');
    const [resumeFile, setResumeFile] = useState<File | null>(null);
    const [resumeText, setResumeText] = useState('');
    const [answerMode, setAnswerMode] = useState<AnswerMode>('text');
    const [quinnTone, setQuinnTone] = useState<'SUPPORTIVE' | 'DIRECT'>('SUPPORTIVE');
    const [isUploading, setIsUploading] = useState(false);

    const filteredCompanies = popularCompanies.filter(c =>
        c.toLowerCase().includes(companySearch.toLowerCase())
    );

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsUploading(true);
        setResumeFile(file);

        // Simulate file processing
        setTimeout(() => {
            setResumeText(`Parsed resume content from ${file.name}`);
            setIsUploading(false);
        }, 1500);
    };

    const handleStartSimulation = () => {
        setCompanyInfo(companyName || undefined, undefined);
        setResumeData(resumeText || undefined, undefined);
        setQuinnMode(quinnTone);

        // Navigate to calibration or interview based on mode
        if (answerMode === 'video' || answerMode === 'audio') {
            navigate('/calibration');
        } else {
            navigate('/interview');
        }
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
                        <div className="glass-card p-6">
                            <h3 className="text-lg font-semibold text-text mb-4 flex items-center gap-2">
                                <span>🏢</span> Target Company
                                <span className="text-xs font-normal text-text-muted">(Optional)</span>
                            </h3>

                            {/* Search */}
                            <div className="relative mb-4">
                                <input
                                    type="text"
                                    className="form-input pl-10"
                                    placeholder="Search companies..."
                                    value={companySearch}
                                    onChange={(e) => {
                                        setCompanySearch(e.target.value);
                                        setCompanyName(e.target.value);
                                    }}
                                />
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted">
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
                                <div className="border border-slate-200 rounded-xl overflow-hidden mb-4">
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

                                    <div className="bg-slate-50 rounded-xl p-4">
                                        {activeTab === 'overview' && (
                                            <p className="text-text-secondary text-sm">
                                                Company overview and key information will be displayed here to help you prepare for your interview.
                                            </p>
                                        )}
                                        {activeTab === 'news' && (
                                            <p className="text-text-secondary text-sm">
                                                Recent news and updates about {companyName} will appear here.
                                            </p>
                                        )}
                                        {activeTab === 'culture' && (
                                            <p className="text-text-secondary text-sm">
                                                Culture insights and values of {companyName} will be shown here.
                                            </p>
                                        )}
                                    </div>
                                </div>
                            )}

                            {/* Quinn Insight */}
                            {companyName && (
                                <div className="mt-4 flex items-start gap-3 p-4 bg-primary/5 rounded-xl border border-primary/10">
                                    <div className="w-8 h-8 flex-shrink-0">
                                        <NeuralKnot size="sm" state="coaching" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-text font-medium">Quinn's Insight</p>
                                        <p className="text-sm text-text-secondary mt-1">
                                            I'll tailor questions based on {companyName}'s interview style and culture.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Column: Resume Upload */}
                    <div className="space-y-6">
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
                                        <p className="text-xs text-text-muted mt-3">PDF, DOC, DOCX, or TXT</p>
                                    </div>
                                )}
                            </div>

                            {/* Quinn's First Impression */}
                            {resumeFile && (
                                <div className="mt-4 flex items-start gap-3 p-4 bg-accent/5 rounded-xl border border-accent/10">
                                    <div className="w-8 h-8 flex-shrink-0">
                                        <NeuralKnot size="sm" state="speaking" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-text font-medium">Quinn's First Impression</p>
                                        <p className="text-sm text-text-secondary mt-1">
                                            Great! I'll ask questions specific to your background and experiences.
                                        </p>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Answer Mode Selection */}
                <div className="max-w-6xl mx-auto mt-8">
                    <div className="glass-card p-6">
                        <h3 className="text-lg font-semibold text-text mb-6 text-center">
                            Choose Your Answer Mode
                        </h3>

                        <div className="grid sm:grid-cols-3 gap-4">
                            {/* Text Mode */}
                            <button
                                onClick={() => setAnswerMode('text')}
                                className={`p-6 rounded-xl border-2 transition-all duration-300 text-left
                                    ${answerMode === 'text'
                                        ? 'border-primary bg-primary/5 shadow-frost'
                                        : 'border-slate-200 hover:border-primary/30'
                                    }`}
                            >
                                <div className="text-3xl mb-3">📝</div>
                                <h4 className="font-semibold text-text mb-1">Text</h4>
                                <p className="text-sm text-text-secondary">Type your answers</p>
                            </button>

                            {/* Audio Mode */}
                            <button
                                onClick={() => setAnswerMode('audio')}
                                className={`p-6 rounded-xl border-2 transition-all duration-300 text-left
                                    ${answerMode === 'audio'
                                        ? 'border-primary bg-primary/5 shadow-frost'
                                        : 'border-slate-200 hover:border-primary/30'
                                    }`}
                            >
                                <div className="text-3xl mb-3">🎤</div>
                                <h4 className="font-semibold text-text mb-1">Audio</h4>
                                <p className="text-sm text-text-secondary">Speak your answers</p>
                            </button>

                            {/* Video Mode */}
                            <button
                                onClick={() => setAnswerMode('video')}
                                className={`p-6 rounded-xl border-2 transition-all duration-300 text-left relative
                                    ${answerMode === 'video'
                                        ? 'border-accent bg-accent/5 shadow-frost'
                                        : 'border-slate-200 hover:border-accent/30'
                                    }`}
                            >
                                <div className="absolute top-2 right-2 px-2 py-0.5 bg-accent text-white text-xs font-medium rounded-full">
                                    Full Analysis
                                </div>
                                <div className="text-3xl mb-3">🎥</div>
                                <h4 className="font-semibold text-text mb-1">Audio + Video</h4>
                                <p className="text-sm text-text-secondary">Complete behavioral analysis</p>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Quinn Tone Selection */}
                <div className="max-w-6xl mx-auto mt-8">
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

                {/* Start Button */}
                <div className="max-w-md mx-auto mt-12">
                    <button
                        onClick={handleStartSimulation}
                        disabled={!canProceed}
                        className={`w-full py-4 rounded-xl font-semibold text-lg transition-all duration-300
                            ${canProceed
                                ? 'btn-cta'
                                : 'bg-slate-100 text-text-muted cursor-not-allowed'
                            }`}
                    >
                        Start Simulation →
                    </button>
                    {!canProceed && (
                        <p className="text-center text-sm text-text-muted mt-3">
                            Please select a track and role first
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}

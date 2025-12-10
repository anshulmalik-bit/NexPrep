import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterviewStore } from '../store/interview-store';
import { api } from '../services/api';
import './InterviewSetupPage.css';

export function InterviewSetupPage() {
    const navigate = useNavigate();
    const { trackId, roleId, setCompany, setResume, quinnMode } = useInterviewStore();
    const [companySearch, setCompanySearch] = useState('');
    const [isDragging, setIsDragging] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');
    const [quinnMessage, setQuinnMessage] = useState('');
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleCompanySearch = (e: ChangeEvent<HTMLInputElement>) => {
        setCompanySearch(e.target.value);
        setCompany(e.target.value || null, null, null);
    };

    const handleFileSelect = async (file: File) => {
        if (file.type !== 'application/pdf') {
            setQuinnMessage(quinnMode === 'SUPPORTIVE'
                ? "Oops! I can only read PDF files. Could you try uploading a PDF?"
                : "PDF only. Try again.");
            return;
        }

        setUploadStatus('uploading');

        try {
            const result = await api.uploadResume(file);
            setResume(result.text, result.keywords, result.status);
            setUploadStatus('success');

            if (result.status === 'success') {
                setQuinnMessage(quinnMode === 'SUPPORTIVE'
                    ? `Great resume! I spotted some key skills: ${result.keywords.slice(0, 3).join(', ')}. I'll tailor questions based on your experience.`
                    : `Got it. Skills noted: ${result.keywords.slice(0, 3).join(', ')}. Let's proceed.`);
            } else {
                setQuinnMessage(quinnMode === 'SUPPORTIVE'
                    ? "I had some trouble reading parts of your resume, but don't worry! I'll still create great questions for you."
                    : "Partial parse. I'll work with what I have.");
            }
        } catch (error) {
            setUploadStatus('error');
            setQuinnMessage(quinnMode === 'SUPPORTIVE'
                ? "I couldn't read your resume, but that's okay! We'll continue with role-based questions."
                : "Resume failed. Proceeding with standard questions.");
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
        const file = e.dataTransfer.files[0];
        if (file) handleFileSelect(file);
    };

    const handleStartSimulation = () => {
        navigate('/setup/quinn-mode');
    };

    return (
        <div className="setup-page page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">Interview Setup</h1>
                    <p className="page-subtitle">Add company context and resume for personalized questions</p>
                </div>

                <div className="setup-layout">
                    {/* Company Selection */}
                    <div className="setup-section glass-card">
                        <h3 className="setup-section__title">🏢 Company Context</h3>

                        <div className="form-group">
                            <input
                                type="text"
                                className="form-input search-input"
                                placeholder="Search company..."
                                value={companySearch}
                                onChange={handleCompanySearch}
                            />
                        </div>

                        <div className="company-cards">
                            <div className="company-info-card">
                                <h4>Overview</h4>
                                <p>{companySearch ? `Research insights for ${companySearch} will appear here during the interview.` : 'Enter a company to see insights'}</p>
                            </div>
                            <div className="company-info-card">
                                <h4>Recent News</h4>
                                <p>Latest company updates and announcements</p>
                            </div>
                            <div className="company-info-card">
                                <h4>Culture & Values</h4>
                                <p>Work environment and company principles</p>
                            </div>
                        </div>

                        {companySearch && (
                            <div className="quinn-insight">
                                <div className="quinn-insight__avatar">🤖</div>
                                <p className="quinn-insight__message">
                                    "Nice choice! {companySearch} has an interesting interview style. I'll prepare accordingly."
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Resume Upload */}
                    <div className="setup-section glass-card">
                        <h3 className="setup-section__title">📄 Resume Upload</h3>

                        <div
                            className={`upload-zone ${isDragging ? 'upload-zone--dragging' : ''} ${uploadStatus === 'success' ? 'upload-zone--success' : ''}`}
                            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                            onDragLeave={() => setIsDragging(false)}
                            onDrop={handleDrop}
                            onClick={() => fileInputRef.current?.click()}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept=".pdf"
                                onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
                                hidden
                            />

                            {uploadStatus === 'uploading' ? (
                                <div className="upload-zone__loading">
                                    <div className="loading-spinner" />
                                    <p>Analyzing resume...</p>
                                </div>
                            ) : uploadStatus === 'success' ? (
                                <div className="upload-zone__success">
                                    <span className="upload-zone__icon">✅</span>
                                    <p>Resume uploaded successfully!</p>
                                </div>
                            ) : (
                                <>
                                    <span className="upload-zone__icon">📤</span>
                                    <p className="upload-zone__text">
                                        Drag & drop your resume or <span>click to browse</span>
                                    </p>
                                    <p className="upload-zone__hint">PDF only • Max 5MB</p>
                                </>
                            )}
                        </div>

                        {quinnMessage && (
                            <div className="quinn-message">
                                <div className="quinn-message__avatar">🤖</div>
                                <div className="quinn-message__bubble">
                                    <p>{quinnMessage}</p>
                                </div>
                            </div>
                        )}

                        <p className="setup-section__skip">
                            No resume? No problem — we'll use role-based questions.
                        </p>
                    </div>
                </div>

                <div className="setup-actions">
                    <button
                        className="btn btn--primary btn--lg"
                        onClick={handleStartSimulation}
                    >
                        Start Simulation →
                    </button>
                </div>
            </div>
        </div>
    );
}

import { useState, useRef } from 'react';
import type { ChangeEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useInterviewStore } from '../store/interview-store';
import { Button } from '../components/Button';
import { api } from '../services/api';
import './ResumePage.css';

export function ResumePage() {
    const navigate = useNavigate();
    const { setResume, quinnMode } = useInterviewStore();
    const [file, setFile] = useState<File | null>(null);
    const [uploading, setUploading] = useState(false);
    const [uploadStatus, setUploadStatus] = useState<'none' | 'success' | 'partial' | 'failed'>('none');
    const [statusMessage, setStatusMessage] = useState('');
    const [dragOver, setDragOver] = useState(false);
    const inputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
        const f = e.target.files?.[0];
        if (f && f.type === 'application/pdf') {
            setFile(f);
        }
    };

    const handleDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const f = e.dataTransfer.files[0];
        if (f && f.type === 'application/pdf') {
            setFile(f);
        }
    };

    const handleUpload = async () => {
        if (!file) return;

        setUploading(true);
        try {
            const result = await api.uploadResume(file);
            setResume(result.text, result.keywords, result.status);
            setUploadStatus(result.status);

            if (result.status === 'success') {
                setStatusMessage('Resume parsed successfully! Your interview will be tailored to your experience.');
            } else if (result.status === 'partial') {
                setStatusMessage(
                    quinnMode === 'SUPPORTIVE'
                        ? "Your resume has a unique format — we'll base the interview on your role and field."
                        : "Your resume confused me. Recruiters know the feeling. Moving on."
                );
            }
        } catch (error) {
            setUploadStatus('failed');
            setStatusMessage('Resume upload failed. We\'ll continue with role-based questions.');
        } finally {
            setUploading(false);
        }
    };

    const handleContinue = () => {
        navigate('/setup/quinn-mode');
    };

    const handleSkip = () => {
        navigate('/setup/quinn-mode');
    };

    return (
        <div className="resume-page">
            <div className="container">
                <div className="page-header text-center">
                    <Button onClick={() => navigate(-1)} variant="ghost" className="back-btn">
                        ← Back
                    </Button>
                    <h1 className="page-title">Resume Upload</h1>
                    <p className="page-subtitle">
                        Optional: Upload your resume for personalized questions and feedback
                    </p>
                </div>

                <div className="resume-upload-container">
                    {!file ? (
                        <div
                            className={`file-upload ${dragOver ? 'file-upload--dragover' : ''}`}
                            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={handleDrop}
                            onClick={() => inputRef.current?.click()}
                        >
                            <input
                                ref={inputRef}
                                type="file"
                                className="file-upload__input"
                                accept=".pdf"
                                onChange={handleFileChange}
                            />
                            <div className="file-upload__icon">📄</div>
                            <div className="file-upload__text">
                                Drag & drop your resume here, or click to browse
                            </div>
                            <div className="file-upload__hint">PDF files only</div>
                        </div>
                    ) : uploadStatus === 'none' ? (
                        <div className="resume-preview">
                            <div className="resume-preview__file">
                                <span className="resume-preview__icon">📄</span>
                                <span className="resume-preview__name">{file.name}</span>
                                <button
                                    className="resume-preview__remove"
                                    onClick={() => setFile(null)}
                                    aria-label="Remove file"
                                >
                                    ✕
                                </button>
                            </div>
                            <Button
                                variant="cta"
                                onClick={handleUpload}
                                isLoading={uploading}
                            >
                                {uploading ? 'Processing...' : 'Upload & Analyze'}
                            </Button>
                        </div>
                    ) : (
                        <div className={`upload-result upload-result--${uploadStatus}`}>
                            <div className="upload-result__icon">
                                {uploadStatus === 'success' ? '✅' : uploadStatus === 'partial' ? '⚠️' : '❌'}
                            </div>
                            <p className="upload-result__message">{statusMessage}</p>
                            <Button variant="cta" onClick={handleContinue}>
                                Continue to Quinn Selection →
                            </Button>
                        </div>
                    )}

                    {!file && (
                        <div className="resume-skip">
                            <Button variant="ghost" onClick={handleSkip}>
                                Skip — Proceed without resume
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

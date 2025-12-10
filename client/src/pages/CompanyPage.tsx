import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { industries, companySizes, popularCompanies } from '../data/tracks';
import { useInterviewStore } from '../store/interview-store';
import { Button } from '../components/Button';
import { Card, SelectionCard } from '../components/Card';
import './CompanyPage.css';

export function CompanyPage() {
    const navigate = useNavigate();
    const { setCompany } = useInterviewStore();
    const [mode, setMode] = useState<'company' | 'industry'>('company');
    const [companySearch, setCompanySearch] = useState('');
    const [selectedIndustry, setSelectedIndustry] = useState<string | null>(null);
    const [selectedSize, setSelectedSize] = useState<string | null>(null);

    const handleSelectCompany = (company: string) => {
        setCompany(company, null, null);
        navigate('/setup/resume');
    };

    const handleSkipToIndustry = () => {
        setMode('industry');
    };

    const handleContinueWithIndustry = () => {
        if (selectedIndustry && selectedSize) {
            setCompany(null, selectedIndustry, selectedSize);
            navigate('/setup/resume');
        }
    };

    const filteredCompanies = popularCompanies.filter((c) =>
        c.toLowerCase().includes(companySearch.toLowerCase())
    );

    return (
        <div className="company-page">
            <div className="container">
                <div className="page-header text-center">
                    <Button to="/tracks" variant="ghost" className="back-btn">
                        ← Back
                    </Button>
                    <h1 className="page-title">Company Context</h1>
                    <p className="page-subtitle">
                        Help us tailor your interview to a specific company or industry
                    </p>
                </div>

                {mode === 'company' ? (
                    <div className="company-selection">
                        <div className="company-search">
                            <input
                                type="text"
                                className="form-input company-search__input"
                                placeholder="Search for a company..."
                                value={companySearch}
                                onChange={(e) => setCompanySearch(e.target.value)}
                            />
                        </div>

                        {companySearch && filteredCompanies.length > 0 && (
                            <div className="company-results">
                                {filteredCompanies.slice(0, 6).map((company) => (
                                    <Card
                                        key={company}
                                        hover
                                        interactive
                                        onClick={() => handleSelectCompany(company)}
                                        className="company-result"
                                    >
                                        🏢 {company}
                                    </Card>
                                ))}
                            </div>
                        )}

                        <div className="company-popular">
                            <h3>Popular Companies</h3>
                            <div className="company-popular__grid">
                                {popularCompanies.slice(0, 10).map((company) => (
                                    <Card
                                        key={company}
                                        hover
                                        interactive
                                        onClick={() => handleSelectCompany(company)}
                                        className="company-chip"
                                    >
                                        {company}
                                    </Card>
                                ))}
                            </div>
                        </div>

                        <div className="company-skip">
                            <Button variant="ghost" onClick={handleSkipToIndustry}>
                                Skip — I'll specify industry & size instead
                            </Button>
                        </div>
                    </div>
                ) : (
                    <div className="industry-selection">
                        <h3 className="industry-label">Select Industry</h3>
                        <div className="industry-grid">
                            {industries.map((ind) => (
                                <SelectionCard
                                    key={ind.id}
                                    emoji={ind.emoji}
                                    name={ind.name}
                                    selected={selectedIndustry === ind.id}
                                    onClick={() => setSelectedIndustry(ind.id)}
                                />
                            ))}
                        </div>

                        <h3 className="industry-label mt-8">Select Company Size</h3>
                        <div className="size-grid">
                            {companySizes.map((size) => (
                                <SelectionCard
                                    key={size.id}
                                    emoji="🏢"
                                    name={size.name}
                                    meta={size.description}
                                    selected={selectedSize === size.id}
                                    onClick={() => setSelectedSize(size.id)}
                                />
                            ))}
                        </div>

                        <div className="industry-actions mt-8">
                            <Button
                                variant="secondary"
                                onClick={() => setMode('company')}
                            >
                                ← Back to Company Search
                            </Button>
                            <Button
                                variant="cta"
                                disabled={!selectedIndustry || !selectedSize}
                                onClick={handleContinueWithIndustry}
                            >
                                Continue →
                            </Button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

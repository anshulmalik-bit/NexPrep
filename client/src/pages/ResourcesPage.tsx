import { useState } from 'react';
import { Link } from 'react-router-dom';
import './ResourcesPage.css';

interface ResourceDetail {
    icon: string;
    title: string;
    description: string;
    content: string[];
}

export function ResourcesPage() {
    const [selectedResource, setSelectedResource] = useState<ResourceDetail | null>(null);

    const resources: ResourceDetail[] = [
        {
            icon: '📚',
            title: 'Skill Guides',
            description: 'Comprehensive guides on technical and soft skills',
            content: [
                '• Technical Skills: Data structures, algorithms, system design',
                '• Communication: Clear articulation, active listening',
                '• Leadership: Delegation, conflict resolution, mentoring',
                '• Problem-Solving: Root cause analysis, creative thinking',
                '• Time Management: Prioritization, deadline management'
            ]
        },
        {
            icon: '🎯',
            title: 'Interview Frameworks',
            description: 'STAR, PREP, CAR and other proven answer structures',
            content: [
                '• STAR: Situation → Task → Action → Result',
                '• PREP: Point → Reason → Example → Point',
                '• CAR: Challenge → Action → Result',
                '• SOAR: Situation → Obstacle → Action → Result',
                '• PAR: Problem → Action → Result'
            ]
        },
        {
            icon: '🏢',
            title: 'Company Reports',
            description: 'Culture insights and interview styles for top companies',
            content: [
                '• Google: Focus on problem-solving, behavioral rounds',
                '• Amazon: Leadership Principles, bar raiser interviews',
                '• Microsoft: Growth mindset, technical + design',
                '• Meta: Move fast, system design emphasis',
                '• Apple: Attention to detail, cross-functional thinking'
            ]
        },
        {
            icon: '📄',
            title: 'Resume Tips',
            description: 'Best practices for resume optimization and ATS',
            content: [
                '• Use action verbs: Led, Developed, Optimized, Achieved',
                '• Quantify achievements: Increased revenue by 25%',
                '• Keep it to 1-2 pages maximum',
                '• Use keywords from job description for ATS',
                '• Include relevant projects and open source contributions'
            ]
        },
        {
            icon: '💬',
            title: 'Behavioral Question Guide',
            description: 'Common questions and how to answer them effectively',
            content: [
                '• "Tell me about yourself" - 2 min elevator pitch',
                '• "Describe a challenge you overcame"',
                '• "Give an example of leadership"',
                '• "How do you handle conflict?"',
                '• "Why do you want to work here?"'
            ]
        },
        {
            icon: '❓',
            title: 'Mock Question Library',
            description: 'Practice with hundreds of real interview questions',
            content: [
                '• Technical: 200+ coding problems by difficulty',
                '• System Design: 50+ architecture questions',
                '• Behavioral: 100+ situational questions',
                '• Case Studies: 30+ business scenarios',
                '• Brain Teasers: 25+ logic puzzles'
            ]
        }
    ];

    return (
        <div className="resources-page page">
            <div className="container">
                <div className="page-header text-center">
                    <h1 className="page-title">Resources</h1>
                    <p className="page-subtitle">
                        Everything you need to prepare for your interview
                    </p>
                </div>

                <div className="resources-grid">
                    {resources.map((resource, index) => (
                        <button
                            key={index}
                            className="resource-card glass-card hover-lift"
                            onClick={() => setSelectedResource(resource)}
                        >
                            <div className="resource-card__icon">{resource.icon}</div>
                            <h3 className="resource-card__title">{resource.title}</h3>
                            <p className="resource-card__description">{resource.description}</p>
                            <span className="resource-card__link">
                                Explore →
                            </span>
                        </button>
                    ))}
                </div>

                <div className="resources-cta">
                    <p>Ready to put your knowledge to the test?</p>
                    <Link to="/choose-path" className="btn btn--primary btn--lg">
                        Start Simulation
                    </Link>
                </div>
            </div>

            {/* Resource Detail Modal */}
            {selectedResource && (
                <div className="resource-modal" onClick={() => setSelectedResource(null)}>
                    <div className="resource-modal__content glass-card" onClick={e => e.stopPropagation()}>
                        <button
                            className="resource-modal__close"
                            onClick={() => setSelectedResource(null)}
                        >
                            ✕
                        </button>
                        <div className="resource-modal__icon">{selectedResource.icon}</div>
                        <h2 className="resource-modal__title">{selectedResource.title}</h2>
                        <p className="resource-modal__description">{selectedResource.description}</p>
                        <div className="resource-modal__content-list">
                            {selectedResource.content.map((item, i) => (
                                <p key={i}>{item}</p>
                            ))}
                        </div>
                        <button
                            className="btn btn--primary btn--lg"
                            onClick={() => setSelectedResource(null)}
                            style={{ marginTop: 'var(--space-6)', width: '100%' }}
                        >
                            Got it!
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

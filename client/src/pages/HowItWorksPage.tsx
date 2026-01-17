import { Link } from 'react-router-dom';
import { NeuralKnot } from '../components/NeuralKnot';

export function HowItWorksPage() {
    const steps = [
        {
            number: '01',
            title: 'Choose Your Track',
            description: 'Select from Tech, MBA, HR, Analytics, Sales, Operations, or Creative tracks.',
            icon: '🎯',
        },
        {
            number: '02',
            title: 'Select Your Role',
            description: 'Pick the specific position you\'re preparing for within your chosen track.',
            icon: '👔',
        },
        {
            number: '03',
            title: 'Add Context',
            description: 'Optionally specify a target company or industry, and upload your resume.',
            icon: '🏢',
        },
        {
            number: '04',
            title: 'Meet Quinn',
            description: 'Choose your AI mentor\'s personality: Supportive or Direct.',
            icon: '🤖',
        },
        {
            number: '05',
            title: 'Practice Interview',
            description: 'Answer questions tailored to your role. Request hints if you need guidance.',
            icon: '💬',
        },
        {
            number: '06',
            title: 'Get Your Evaluation',
            description: 'Receive detailed feedback, skill ratings, and a personalized improvement plan.',
            icon: '📊',
        },
    ];

    return (
        <div className="min-h-screen bg-canvas pt-[72px]">
            <div className="container py-12 lg:py-20">
                {/* Header */}
                <div className="text-center mb-16">
                    <h1 className="page-title mb-4">How HRprep Works</h1>
                    <p className="page-subtitle">
                        Six simple steps to interview confidence
                    </p>
                </div>

                {/* Steps Timeline */}
                <div className="max-w-3xl mx-auto">
                    {steps.map((step, i) => (
                        <div key={step.number} className="relative flex gap-6 pb-12 last:pb-0">
                            {/* Timeline Line */}
                            {i < steps.length - 1 && (
                                <div className="absolute left-7 top-16 w-0.5 h-full bg-gradient-to-b from-primary/30 to-accent/30" />
                            )}

                            {/* Icon Circle */}
                            <div className="relative z-10 flex-shrink-0">
                                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-2xl shadow-frost">
                                    {step.icon}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="flex-1 pt-2">
                                <div className="flex items-center gap-3 mb-2">
                                    <span className="text-sm font-bold text-primary/60">{step.number}</span>
                                    <h3 className="text-xl font-bold text-text">{step.title}</h3>
                                </div>
                                <p className="text-text-secondary leading-relaxed">{step.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="text-center mt-16">
                    <div className="inline-flex flex-col items-center">
                        <div className="mb-6">
                            <NeuralKnot size="md" state="idle" />
                        </div>
                        <p className="text-text-secondary mb-6">Ready to practice with Quinn?</p>
                        <Link to="/choose-path" className="btn-cta px-8 py-4 text-lg rounded-full">
                            Start Your Interview →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

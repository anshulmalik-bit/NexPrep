import './HowItWorksPage.css';

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
        <div className="how-it-works-page">
            <div className="container">
                <div className="page-header text-center">
                    <h1 className="page-title">How NexPrep Works</h1>
                    <p className="page-subtitle">
                        Six simple steps to interview confidence
                    </p>
                </div>

                <div className="steps-timeline">
                    {steps.map((step, i) => (
                        <div key={step.number} className="step">
                            <div className="step__number">{step.icon}</div>
                            <div className="step__content">
                                <h3 className="step__title">
                                    <span className="step__num">{step.number}</span>
                                    {step.title}
                                </h3>
                                <p className="step__description">{step.description}</p>
                            </div>
                            {i < steps.length - 1 && <div className="step__connector" />}
                        </div>
                    ))}
                </div>

                <div className="how-cta text-center">
                    <a href="/tracks" className="btn btn--cta btn--lg">
                        Start Your Simulation →
                    </a>
                </div>
            </div>
        </div>
    );
}

import { Link } from 'react-router-dom';

interface Resource {
    id: string;
    title: string;
    description: string;
    category: 'guide' | 'template' | 'framework' | 'tip';
    icon: string;
    link?: string;
}

const resources: Resource[] = [
    {
        id: '1',
        title: 'STAR Method Guide',
        description: 'Master the Situation-Task-Action-Result framework for behavioral questions',
        category: 'framework',
        icon: '⭐',
    },
    {
        id: '2',
        title: 'Technical Interview Prep',
        description: 'Data structures, algorithms, and system design essentials',
        category: 'guide',
        icon: '💻',
    },
    {
        id: '3',
        title: 'Resume Templates',
        description: 'ATS-friendly templates for tech, MBA, and analytics roles',
        category: 'template',
        icon: '📄',
    },
    {
        id: '4',
        title: 'Behavioral Question Bank',
        description: '100+ common behavioral questions with sample answers',
        category: 'guide',
        icon: '🎯',
    },
    {
        id: '5',
        title: 'Salary Negotiation Tips',
        description: 'Learn to negotiate your offer like a pro',
        category: 'tip',
        icon: '💰',
    },
    {
        id: '6',
        title: 'Case Study Framework',
        description: 'Structured approach to consulting and MBA case interviews',
        category: 'framework',
        icon: '📊',
    },
    {
        id: '7',
        title: 'Body Language Guide',
        description: 'Non-verbal communication tips for video interviews',
        category: 'tip',
        icon: '🎥',
    },
    {
        id: '8',
        title: 'Thank You Email Templates',
        description: 'Post-interview follow-up templates that get responses',
        category: 'template',
        icon: '✉️',
    },
];

const categoryColors = {
    guide: 'from-primary/10 to-primary/5 border-primary/20',
    template: 'from-accent/10 to-accent/5 border-accent/20',
    framework: 'from-purple-100/50 to-purple-50/50 border-purple-200',
    tip: 'from-yellow-100/50 to-yellow-50/50 border-yellow-200',
};

const categoryLabels = {
    guide: 'Guide',
    template: 'Template',
    framework: 'Framework',
    tip: 'Pro Tip',
};

export function ResourcesPage() {
    return (
        <div className="min-h-screen bg-canvas pt-[72px]">
            <div className="container py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="page-title">Resources</h1>
                    <p className="page-subtitle">
                        Guides, templates, and tips to ace your next interview
                    </p>
                </div>

                {/* Resource Grid */}
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {resources.map((resource) => (
                        <div
                            key={resource.id}
                            className={`glass-card p-6 hover-lift cursor-pointer group bg-gradient-to-br ${categoryColors[resource.category]} border`}
                        >
                            <div className="flex items-start justify-between mb-4">
                                <div className="w-12 h-12 rounded-xl bg-white flex items-center justify-center text-2xl shadow-sm group-hover:scale-110 transition-transform">
                                    {resource.icon}
                                </div>
                                <span className="px-2 py-1 bg-white/80 rounded-full text-xs font-medium text-text-secondary">
                                    {categoryLabels[resource.category]}
                                </span>
                            </div>
                            <h3 className="font-semibold text-text mb-2 group-hover:text-primary transition-colors">
                                {resource.title}
                            </h3>
                            <p className="text-sm text-text-secondary leading-relaxed">
                                {resource.description}
                            </p>
                            <div className="mt-4 pt-4 border-t border-slate-100">
                                <span className="text-sm text-primary font-medium group-hover:underline">
                                    Read more →
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* CTA Section */}
                <div className="mt-16 text-center">
                    <div className="glass-card-strong inline-block p-8 max-w-xl">
                        <h3 className="text-xl font-bold text-text mb-3">
                            Ready to Put These Into Practice?
                        </h3>
                        <p className="text-text-secondary mb-6">
                            Start a simulation with Quinn and apply what you've learned
                        </p>
                        <Link to="/choose-path" className="btn-cta inline-block">
                            Start Simulation →
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}

// Track and Role data for NexPrep

export interface Role {
    id: string;
    name: string;
    description: string;
}

export interface Track {
    id: string;
    name: string;
    emoji: string;
    description: string;
    roles: Role[];
}

export const tracks: Track[] = [
    {
        id: 'general',
        name: 'General HR',
        emoji: '🤝',
        description: 'Standard behavioral interview practice',
        roles: [
            { id: 'general-hr', name: 'General Interview', description: 'Standard HR and behavioral questions' }
        ]
    },
    {
        id: 'tech',
        name: 'Technology',
        emoji: '💻',
        description: 'Software engineering, data science, and IT roles',
        roles: [
            { id: 'swe', name: 'Software Engineer', description: 'Build and maintain software systems' },
            { id: 'frontend', name: 'Frontend Developer', description: 'Create user interfaces and experiences' },
            { id: 'backend', name: 'Backend Developer', description: 'Design APIs and server-side systems' },
            { id: 'fullstack', name: 'Full Stack Developer', description: 'End-to-end application development' },
            { id: 'data-scientist', name: 'Data Scientist', description: 'Extract insights from data' },
            { id: 'data-engineer', name: 'Data Engineer', description: 'Build data pipelines and infrastructure' },
            { id: 'ml-engineer', name: 'ML Engineer', description: 'Deploy machine learning models' },
            { id: 'devops', name: 'DevOps Engineer', description: 'CI/CD and infrastructure automation' },
            { id: 'cloud-architect', name: 'Cloud Architect', description: 'Design cloud solutions' },
            { id: 'qa-engineer', name: 'QA Engineer', description: 'Testing and quality assurance' },
            { id: 'security-engineer', name: 'Security Engineer', description: 'Protect systems and data' },
            { id: 'product-manager-tech', name: 'Technical Product Manager', description: 'Lead technical product development' },
        ],
    },
    {
        id: 'mba',
        name: 'MBA & Strategy',
        emoji: '📊',
        description: 'Business strategy, consulting, and management roles',
        roles: [
            { id: 'consultant', name: 'Management Consultant', description: 'Solve complex business problems' },
            { id: 'strategy', name: 'Strategy Analyst', description: 'Develop business strategies' },
            { id: 'investment-banker', name: 'Investment Banker', description: 'M&A and financial advisory' },
            { id: 'venture-capital', name: 'VC Analyst', description: 'Evaluate startup investments' },
            { id: 'private-equity', name: 'PE Associate', description: 'Private equity investments' },
            { id: 'product-manager', name: 'Product Manager', description: 'Lead product development' },
            { id: 'business-dev', name: 'Business Development', description: 'Drive partnerships and growth' },
            { id: 'operations-manager', name: 'Operations Manager', description: 'Optimize business operations' },
            { id: 'general-manager', name: 'General Manager', description: 'Lead business units' },
            { id: 'corp-strategy', name: 'Corporate Strategy', description: 'Internal strategy planning' },
        ],
    },
    {
        id: 'hr',
        name: 'Human Resources',
        emoji: '👥',
        description: 'Talent acquisition, HR business partner, and L&D roles',
        roles: [
            { id: 'recruiter', name: 'Recruiter', description: 'Source and hire talent' },
            { id: 'talent-acquisition', name: 'Talent Acquisition Specialist', description: 'Strategic hiring initiatives' },
            { id: 'hrbp', name: 'HR Business Partner', description: 'Strategic HR advisor' },
            { id: 'hr-generalist', name: 'HR Generalist', description: 'Broad HR responsibilities' },
            { id: 'compensation', name: 'Compensation Analyst', description: 'Design pay structures' },
            { id: 'learning-dev', name: 'L&D Specialist', description: 'Training and development' },
            { id: 'employee-relations', name: 'Employee Relations', description: 'Handle workplace issues' },
            { id: 'org-dev', name: 'OD Consultant', description: 'Organizational development' },
            { id: 'hr-analytics', name: 'HR Analytics', description: 'Data-driven HR decisions' },
            { id: 'chro', name: 'Chief HR Officer', description: 'HR leadership' },
        ],
    },
    {
        id: 'analytics',
        name: 'Analytics',
        emoji: '📈',
        description: 'Business intelligence, analytics, and insights roles',
        roles: [
            { id: 'business-analyst', name: 'Business Analyst', description: 'Analyze business requirements' },
            { id: 'data-analyst', name: 'Data Analyst', description: 'Analyze and visualize data' },
            { id: 'bi-analyst', name: 'BI Analyst', description: 'Build dashboards and reports' },
            { id: 'product-analyst', name: 'Product Analyst', description: 'Analyze product metrics' },
            { id: 'marketing-analyst', name: 'Marketing Analyst', description: 'Marketing performance analysis' },
            { id: 'financial-analyst', name: 'Financial Analyst', description: 'Financial modeling and analysis' },
            { id: 'risk-analyst', name: 'Risk Analyst', description: 'Assess and manage risks' },
            { id: 'pricing-analyst', name: 'Pricing Analyst', description: 'Optimize pricing strategies' },
        ],
    },
    {
        id: 'sales',
        name: 'Sales',
        emoji: '💼',
        description: 'Sales, account management, and revenue roles',
        roles: [
            { id: 'sdr', name: 'Sales Development Rep', description: 'Generate qualified leads' },
            { id: 'account-executive', name: 'Account Executive', description: 'Close deals and grow revenue' },
            { id: 'enterprise-sales', name: 'Enterprise Sales', description: 'Large account sales' },
            { id: 'account-manager', name: 'Account Manager', description: 'Manage client relationships' },
            { id: 'customer-success', name: 'Customer Success Manager', description: 'Drive customer retention' },
            { id: 'sales-engineer', name: 'Sales Engineer', description: 'Technical sales support' },
            { id: 'sales-ops', name: 'Sales Operations', description: 'Optimize sales processes' },
            { id: 'sales-manager', name: 'Sales Manager', description: 'Lead sales teams' },
        ],
    },
    {
        id: 'operations',
        name: 'Operations',
        emoji: '⚙️',
        description: 'Supply chain, operations, and logistics roles',
        roles: [
            { id: 'ops-analyst', name: 'Operations Analyst', description: 'Analyze operational efficiency' },
            { id: 'supply-chain', name: 'Supply Chain Manager', description: 'Manage supply chain' },
            { id: 'logistics', name: 'Logistics Coordinator', description: 'Coordinate shipping and transport' },
            { id: 'procurement', name: 'Procurement Specialist', description: 'Source and purchase goods' },
            { id: 'inventory', name: 'Inventory Manager', description: 'Manage stock levels' },
            { id: 'project-manager', name: 'Project Manager', description: 'Lead project execution' },
            { id: 'program-manager', name: 'Program Manager', description: 'Manage multiple projects' },
            { id: 'coo', name: 'Chief Operations Officer', description: 'Operations leadership' },
        ],
    },
    {
        id: 'creative',
        name: 'Creative & Content',
        emoji: '🎨',
        description: 'Design, marketing, and content creation roles',
        roles: [
            { id: 'ux-designer', name: 'UX Designer', description: 'Design user experiences' },
            { id: 'ui-designer', name: 'UI Designer', description: 'Create visual interfaces' },
            { id: 'product-designer', name: 'Product Designer', description: 'End-to-end product design' },
            { id: 'graphic-designer', name: 'Graphic Designer', description: 'Visual communication' },
            { id: 'content-writer', name: 'Content Writer', description: 'Create engaging content' },
            { id: 'copywriter', name: 'Copywriter', description: 'Persuasive marketing copy' },
            { id: 'content-strategist', name: 'Content Strategist', description: 'Content planning and strategy' },
            { id: 'social-media', name: 'Social Media Manager', description: 'Manage social presence' },
            { id: 'marketing-manager', name: 'Marketing Manager', description: 'Lead marketing initiatives' },
            { id: 'brand-manager', name: 'Brand Manager', description: 'Manage brand identity' },
        ],
    },
];

export const industries = [
    { id: 'banking', name: 'Banking & Finance', emoji: '🏦' },
    { id: 'saas', name: 'SaaS / Tech', emoji: '☁️' },
    { id: 'ecommerce', name: 'E-commerce', emoji: '🛒' },
    { id: 'fmcg', name: 'FMCG / CPG', emoji: '🛍️' },
    { id: 'healthcare', name: 'Healthcare', emoji: '🏥' },
    { id: 'pharma', name: 'Pharmaceuticals', emoji: '💊' },
    { id: 'consulting', name: 'Consulting', emoji: '🤝' },
    { id: 'manufacturing', name: 'Manufacturing', emoji: '🏭' },
    { id: 'automotive', name: 'Automotive', emoji: '🚗' },
    { id: 'telecom', name: 'Telecom', emoji: '📱' },
    { id: 'energy', name: 'Energy & Utilities', emoji: '⚡' },
    { id: 'media', name: 'Media & Entertainment', emoji: '🎬' },
    { id: 'real-estate', name: 'Real Estate', emoji: '🏢' },
    { id: 'education', name: 'Education', emoji: '🎓' },
    { id: 'nonprofit', name: 'Non-Profit', emoji: '💚' },
];

export const companySizes = [
    { id: 'startup', name: 'Startup', description: '1-50 employees' },
    { id: 'scaleup', name: 'Scale-up', description: '51-200 employees' },
    { id: 'midmarket', name: 'Mid-Market', description: '201-1000 employees' },
    { id: 'enterprise', name: 'Enterprise', description: '1001-10000 employees' },
    { id: 'mnc', name: 'MNC', description: '10000+ employees' },
];

export const popularCompanies = [
    'Google', 'Microsoft', 'Amazon', 'Apple', 'Meta',
    'Goldman Sachs', 'JPMorgan', 'McKinsey', 'BCG', 'Bain',
    'Deloitte', 'PwC', 'EY', 'KPMG', 'Accenture',
    'Salesforce', 'Adobe', 'Netflix', 'Tesla', 'Uber',
];

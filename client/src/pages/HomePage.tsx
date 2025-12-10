import { Link } from 'react-router-dom';
import { NeuralKnot } from '../components/NeuralKnot';

export function HomePage() {
    return (
        <div className="min-h-screen bg-canvas pt-[72px]">
            {/* Hero Section */}
            <section className="relative overflow-hidden">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-gradient-to-b from-canvas via-slate-50/50 to-canvas" />
                <div
                    className="absolute inset-0 opacity-[0.03]"
                    style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
                    }}
                />

                <div className="container relative">
                    <div className="flex flex-col lg:flex-row items-center justify-between gap-12 py-16 lg:py-24">
                        {/* Left: Content */}
                        <div className="flex-1 text-center lg:text-left max-w-2xl">
                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
                                <span className="text-gradient whitespace-nowrap">NexPrep: Train Smarter.</span>
                                <br />
                                <span className="text-text">Feel Confident.</span>
                            </h1>
                            <p className="text-lg sm:text-xl text-text-secondary mb-8 leading-relaxed">
                                Meet <span className="font-semibold text-primary">Quinn</span> — your adaptive AI interview mentor
                                to guide you through interview preparation and career advancement.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                                <Link to="/choose-path" className="btn-cta px-8 py-4 text-lg rounded-full">
                                    Start Simulation
                                </Link>
                                <Link to="/how-it-works" className="btn-ghost px-8 py-4 text-lg rounded-full">
                                    How It Works
                                </Link>
                            </div>
                        </div>

                        {/* Right: Quinn Illustration */}
                        <div className="flex-1 flex justify-center lg:justify-end">
                            <div className="relative w-72 h-80 lg:w-96 lg:h-[420px]">
                                {/* Glow Effect */}
                                <div className="absolute inset-0 blur-3xl bg-gradient-to-r from-primary/30 to-accent/30 rounded-full" />

                                {/* Quinn with Hello Bubble */}
                                <div className="relative flex flex-col items-center pt-4">
                                    {/* Hello Speech Bubble */}
                                    <div className="glass-card-strong px-5 py-3 rounded-2xl mb-4 shadow-frost-lg relative z-10">
                                        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rotate-45" />
                                        <p className="text-base font-medium text-text whitespace-nowrap">
                                            👋 Hi! I'm <span className="text-primary font-bold">Quinn</span>
                                        </p>
                                        <p className="text-xs text-text-secondary mt-0.5 text-center">
                                            Your AI interview coach
                                        </p>
                                    </div>

                                    {/* Neural Knot */}
                                    <div className="relative z-10">
                                        <NeuralKnot size="hero" state="coaching" />
                                    </div>
                                </div>

                                {/* Floating Chat Bubbles - positioned outside main container */}
                                <div className="absolute left-0 top-1/2 -translate-x-1/2 glass-card px-3 py-2 rounded-xl rounded-bl-sm shadow-frost hero-bubble-1 z-20">
                                    <span className="text-sm">💬 Tell me about yourself...</span>
                                </div>
                                <div className="absolute right-0 bottom-1/4 translate-x-1/3 glass-card px-3 py-2 rounded-xl rounded-br-sm shadow-frost hero-bubble-2 z-20">
                                    <span className="text-sm text-accent">✨ Great structure!</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="py-20 bg-white">
                <div className="container">
                    <div className="grid md:grid-cols-3 gap-6 lg:gap-8">
                        {/* Feature 1 */}
                        <div className="glass-card p-8 hover-lift group">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                                🎯
                            </div>
                            <h3 className="text-xl font-bold text-text mb-3">
                                Adaptive Interview Simulation
                            </h3>
                            <p className="text-text-secondary leading-relaxed">
                                Practice with AI-generated questions tailored to your role, experience, and target company.
                            </p>
                        </div>

                        {/* Feature 2 */}
                        <div className="glass-card p-8 hover-lift group">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                                📄
                            </div>
                            <h3 className="text-xl font-bold text-text mb-3">
                                Smart Resume Insights
                            </h3>
                            <p className="text-text-secondary leading-relaxed">
                                Upload your resume and get personalized questions based on your actual experience.
                            </p>
                        </div>

                        {/* Feature 3 */}
                        <div className="glass-card p-8 hover-lift group">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
                                🏢
                            </div>
                            <h3 className="text-xl font-bold text-text mb-3">
                                Company-Aware Training
                            </h3>
                            <p className="text-text-secondary leading-relaxed">
                                Get insights into company culture, values, and interview style to prepare effectively.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="py-20 bg-canvas">
                <div className="container">
                    <div className="section-header">
                        <h2>How NexPrep Works</h2>
                        <p>Four simple steps to interview confidence</p>
                    </div>

                    <div className="flex flex-col lg:flex-row items-center lg:items-start justify-center gap-6 lg:gap-4">
                        {/* Step 1 */}
                        <div className="flex flex-col items-center text-center max-w-[200px]">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light text-white flex items-center justify-center text-xl font-bold mb-4 shadow-frost">
                                01
                            </div>
                            <h4 className="font-bold text-text mb-2">Choose Your Path</h4>
                            <p className="text-sm text-text-secondary">Select your target track and role</p>
                        </div>

                        <div className="hidden lg:flex items-center text-text-muted text-2xl pt-6">→</div>

                        {/* Step 2 */}
                        <div className="flex flex-col items-center text-center max-w-[200px]">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light text-white flex items-center justify-center text-xl font-bold mb-4 shadow-frost">
                                02
                            </div>
                            <h4 className="font-bold text-text mb-2">Add Context</h4>
                            <p className="text-sm text-text-secondary">Company info & resume upload</p>
                        </div>

                        <div className="hidden lg:flex items-center text-text-muted text-2xl pt-6">→</div>

                        {/* Step 3 */}
                        <div className="flex flex-col items-center text-center max-w-[200px]">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-primary-light text-white flex items-center justify-center text-xl font-bold mb-4 shadow-frost">
                                03
                            </div>
                            <h4 className="font-bold text-text mb-2">Meet Quinn</h4>
                            <p className="text-sm text-text-secondary">Practice with your AI mentor</p>
                        </div>

                        <div className="hidden lg:flex items-center text-text-muted text-2xl pt-6">→</div>

                        {/* Step 4 */}
                        <div className="flex flex-col items-center text-center max-w-[200px]">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent to-accent-light text-white flex items-center justify-center text-xl font-bold mb-4 shadow-frost">
                                04
                            </div>
                            <h4 className="font-bold text-text mb-2">Get Results</h4>
                            <p className="text-sm text-text-secondary">Detailed feedback & improvement plan</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 bg-white">
                <div className="container">
                    <div className="glass-card-strong p-12 lg:p-16 text-center relative overflow-hidden">
                        {/* Background decoration */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-primary/5 to-accent/5 rounded-full blur-3xl" />
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-accent/5 to-primary/5 rounded-full blur-3xl" />

                        <div className="relative">
                            <h2 className="text-3xl lg:text-4xl font-bold text-text mb-4">
                                Ready to Transform Your Interview Skills?
                            </h2>
                            <p className="text-lg text-text-secondary mb-8 max-w-xl mx-auto">
                                Start practicing with Quinn today. No signup required.
                            </p>
                            <Link to="/choose-path" className="btn-cta px-10 py-4 text-lg inline-flex">
                                Start Your Simulation →
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-16 bg-slate-50 border-t border-slate-100">
                <div className="container">
                    <div className="grid md:grid-cols-4 gap-12 mb-12">
                        {/* Brand */}
                        <div className="md:col-span-2">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-frost">
                                    <span className="text-white font-bold">N</span>
                                </div>
                                <span className="font-heading font-bold text-xl">
                                    <span className="text-primary">Nex</span>Prep
                                </span>
                            </div>
                            <p className="text-text-secondary max-w-sm">
                                Train Smarter. Feel Confident. Your AI-powered interview preparation platform.
                            </p>
                        </div>

                        {/* Links */}
                        <div>
                            <h5 className="font-bold text-text mb-4">Product</h5>
                            <ul className="space-y-3">
                                <li><Link to="/choose-path" className="text-text-secondary hover:text-primary transition-colors">Choose Path</Link></li>
                                <li><Link to="/leaderboard" className="text-text-secondary hover:text-primary transition-colors">Leaderboard</Link></li>
                                <li><Link to="/resources" className="text-text-secondary hover:text-primary transition-colors">Resources</Link></li>
                            </ul>
                        </div>

                        <div>
                            <h5 className="font-bold text-text mb-4">Company</h5>
                            <ul className="space-y-3">
                                <li><Link to="/about" className="text-text-secondary hover:text-primary transition-colors">About</Link></li>
                                <li><Link to="/contact" className="text-text-secondary hover:text-primary transition-colors">Contact</Link></li>
                                <li><Link to="/privacy" className="text-text-secondary hover:text-primary transition-colors">Privacy</Link></li>
                            </ul>
                        </div>
                    </div>

                    <div className="pt-8 border-t border-slate-200 text-center text-text-muted text-sm">
                        © 2024 NexPrep. All rights reserved.
                    </div>
                </div>
            </footer>
        </div>
    );
}

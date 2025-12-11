import { Link } from 'react-router-dom';

export function Footer() {
    return (
        <footer className="py-16 bg-slate-50 border-t border-slate-100 mt-auto">
            <div className="container mx-auto px-4">
                <div className="grid md:grid-cols-4 gap-12 mb-12">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-frost">
                                <span className="text-white font-bold">N</span>
                            </div>
                            <span className="font-heading font-bold text-xl text-text">
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
                    © 2025 NexPrep. All rights reserved.
                </div>
            </div>
        </footer>
    );
}

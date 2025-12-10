import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NeuralKnot } from './NeuralKnot';

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const links = [
        { path: '/', label: 'Home' },
        { path: '/choose-path', label: 'Choose Path' },
        { path: '/leaderboard', label: 'Leaderboard' },
        { path: '/resources', label: 'Resources' },
    ];

    const handleLogin = () => {
        setShowLogin(true);
        setIsOpen(false);
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 bg-white/92 backdrop-blur-[10px] border-b border-slate-100 shadow-frost">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-[72px]">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-frost group-hover:shadow-neural transition-shadow duration-300">
                                <span className="text-white font-bold text-lg">N</span>
                                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3">
                                    <NeuralKnot size="sm" state="idle" className="scale-[0.25] origin-center" />
                                </div>
                            </div>
                            <span className="font-heading font-bold text-xl text-text">
                                <span className="text-primary">Nex</span>Prep
                            </span>
                        </Link>

                        {/* Desktop Links */}
                        <ul className="hidden lg:flex items-center gap-1">
                            {links.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                                            ${isActive(link.path)
                                                ? 'text-primary bg-primary/5'
                                                : 'text-text-secondary hover:text-text hover:bg-slate-50'
                                            }`}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                        </ul>

                        {/* Desktop Actions */}
                        <div className="hidden lg:flex items-center gap-3">
                            <button
                                onClick={handleLogin}
                                className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text transition-colors"
                            >
                                Log In
                            </button>
                            <Link
                                to="/choose-path"
                                className="btn-cta text-sm"
                            >
                                Start Simulation
                            </Link>
                        </div>

                        {/* Mobile Actions */}
                        <div className="flex lg:hidden items-center gap-3">
                            <Link
                                to="/choose-path"
                                className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary-light flex items-center justify-center text-white shadow-frost"
                                aria-label="Start Simulation"
                            >
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                    <path d="M5 12h14M12 5l7 7-7 7" />
                                </svg>
                            </Link>
                            <button
                                className="w-10 h-10 flex flex-col items-center justify-center gap-1.5"
                                onClick={() => setIsOpen(!isOpen)}
                                aria-expanded={isOpen}
                                aria-label="Toggle menu"
                            >
                                <span className={`w-5 h-0.5 bg-text rounded-full transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-2' : ''}`} />
                                <span className={`w-5 h-0.5 bg-text rounded-full transition-all duration-300 ${isOpen ? 'opacity-0' : ''}`} />
                                <span className={`w-5 h-0.5 bg-text rounded-full transition-all duration-300 ${isOpen ? '-rotate-45 -translate-y-2' : ''}`} />
                            </button>
                        </div>
                    </div>
                </div>

                {/* Mobile Menu Drawer */}
                <div className={`lg:hidden fixed inset-0 top-[72px] z-40 transition-all duration-300 ${isOpen ? 'visible' : 'invisible'}`}>
                    <div
                        className={`absolute inset-0 bg-black/20 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0'}`}
                        onClick={() => setIsOpen(false)}
                    />
                    <div className={`absolute right-0 top-0 bottom-0 w-72 bg-white/95 backdrop-blur-xl shadow-frost-lg transform transition-transform duration-300 ease-spring ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
                        <ul className="p-4 space-y-1">
                            {links.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className={`block px-4 py-3 rounded-xl text-base font-medium transition-all duration-200
                                            ${isActive(link.path)
                                                ? 'text-primary bg-primary/5'
                                                : 'text-text hover:bg-slate-50'
                                            }`}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                            <li className="pt-4 border-t border-slate-100">
                                <button
                                    className="w-full px-4 py-3 rounded-xl text-base font-medium text-text hover:bg-slate-50 text-left transition-colors"
                                    onClick={handleLogin}
                                >
                                    Log In
                                </button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Login Modal */}
            {showLogin && (
                <div
                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
                    onClick={() => setShowLogin(false)}
                >
                    <div
                        className="w-full max-w-md bg-white/95 backdrop-blur-xl rounded-2xl shadow-frost-lg p-8 animate-slide-up"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-text-muted hover:text-text transition-colors"
                            onClick={() => setShowLogin(false)}
                        >
                            ✕
                        </button>

                        <div className="text-center mb-6">
                            <div className="w-16 h-16 mx-auto mb-4">
                                <NeuralKnot size="md" state="coaching" />
                            </div>
                            <h2 className="text-2xl font-bold text-text">Welcome Back!</h2>
                            <p className="text-text-secondary mt-1">Sign in to track your progress</p>
                        </div>

                        <form
                            className="space-y-4"
                            onSubmit={(e) => {
                                e.preventDefault();
                                alert('Login functionality coming soon! For now, enjoy the simulation without an account.');
                                setShowLogin(false);
                            }}
                        >
                            <div>
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="Email address"
                                    required
                                />
                            </div>
                            <div>
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="Password"
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-primary w-full">
                                Sign In
                            </button>
                        </form>

                        <p className="text-center text-sm text-text-secondary mt-6">
                            New to NexPrep?{' '}
                            <Link
                                to="/choose-path"
                                className="text-primary font-medium hover:underline"
                                onClick={() => setShowLogin(false)}
                            >
                                Start for free →
                            </Link>
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}

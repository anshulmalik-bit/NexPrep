import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { NeuralKnot } from './NeuralKnot';
import { useToast } from './Toast';
import { useAuthStore } from '../store/auth-store';

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const { showToast } = useToast();
    const location = useLocation();
    const { user, setProfile } = useAuthStore();
    const [nickname, setNicknameInput] = useState('');

    const isActive = (path: string) => location.pathname === path;

    // Lock body scroll when mobile menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [isOpen]);

    const links = [
        { path: '/', label: 'Home' },
        { path: '/choose-path', label: 'Choose Path' },
        { path: '/setup', label: 'ATS Check' },
        { path: '/history', label: 'History' },
        { path: '/leaderboard', label: 'Leaderboard' },
        { path: '/resources', label: 'Resources' },
    ];

    const handleLogin = () => {
        setShowLogin(true);
        setIsOpen(false);
    };

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-[var(--z-sticky)] bg-white/92 backdrop-blur-[10px] border-b border-slate-100 shadow-frost" style={{ zIndex: 'var(--z-sticky)' }}>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-[var(--header-height)]">
                        {/* Logo */}
                        <Link to="/" className="flex items-center gap-3 group">
                            <div className="relative w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-light flex items-center justify-center shadow-frost group-hover:shadow-neural transition-shadow duration-300">
                                <span className="text-white font-bold text-lg">H</span>
                            </div>
                            <span className="font-heading font-bold text-xl text-text">
                                <span className="text-primary">HR</span>prep
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
                            {user ? (
                                <Link
                                    to="/history"
                                    className="px-4 py-2 rounded-lg bg-slate-50 border border-slate-200 text-sm font-semibold text-text hover:bg-slate-100 transition-all flex items-center gap-2"
                                >
                                    <span className="w-6 h-6 rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px]">
                                        {user.nickname.charAt(0).toUpperCase()}
                                    </span>
                                    {user.nickname}
                                </Link>
                            ) : (
                                <button
                                    onClick={handleLogin}
                                    className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text transition-colors"
                                >
                                    Sign In
                                </button>
                            )}
                            <Link
                                to="/choose-path"
                                className="btn-cta text-sm"
                            >
                                Start Interview
                            </Link>
                        </div>

                        {/* Mobile Actions */}
                        <div className="flex lg:hidden items-center gap-3">
                            <Link
                                to="/choose-path"
                                className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-primary-light flex items-center justify-center text-white shadow-frost"
                                aria-label="Start Interview"
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

                {/* Mobile Menu - Fullscreen Overlay */}
                {isOpen && (
                    <div
                        className="lg:hidden fixed inset-0 z-[9999]"
                        style={{ top: '72px' }}
                    >
                        {/* Backdrop */}
                        <div
                            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
                            onClick={() => setIsOpen(false)}
                            aria-hidden="true"
                        />
                        {/* Menu Panel - Full Width on Mobile */}
                        <div
                            className="absolute inset-x-0 top-0 bg-white shadow-2xl max-h-[calc(100vh-72px)] overflow-y-auto border-b border-slate-100"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <ul className="py-4">
                                {links.map((link) => (
                                    <li key={link.path}>
                                        <Link
                                            to={link.path}
                                            className={`block px-6 py-4 text-lg font-medium transition-colors border-b border-slate-100
                                                ${isActive(link.path)
                                                    ? 'text-primary bg-primary/5'
                                                    : 'text-text hover:bg-slate-50 active:bg-slate-100'
                                                }`}
                                            onClick={() => setIsOpen(false)}
                                        >
                                            {link.label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <div className="p-4 border-t border-slate-200 bg-slate-50">
                                {user ? (
                                    <Link
                                        to="/history"
                                        className="block w-full px-6 py-4 rounded-xl text-lg font-medium text-text bg-white border border-slate-200 text-center"
                                        onClick={() => setIsOpen(false)}
                                    >
                                        Profile: {user.nickname}
                                    </Link>
                                ) : (
                                    <button
                                        className="w-full px-6 py-4 rounded-xl text-lg font-medium text-text bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                                        onClick={handleLogin}
                                    >
                                        Sign In
                                    </button>
                                )}
                                <Link
                                    to="/choose-path"
                                    className="block w-full mt-3 px-6 py-4 rounded-xl text-lg font-bold text-white text-center bg-gradient-to-r from-primary to-primary-light shadow-lg shadow-primary/20 hover:shadow-xl transition-all"
                                    onClick={() => setIsOpen(false)}
                                >
                                    Start Interview →
                                </Link>
                            </div>
                        </div>
                    </div>
                )}
            </nav>

            {/* Login Modal */}
            {showLogin && (
                <div
                    className="fixed inset-0 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-fade-in"
                    style={{ zIndex: 'var(--z-modal)' }}
                    onClick={() => setShowLogin(false)}
                >
                    <div
                        className="relative w-full max-w-md bg-white/95 backdrop-blur-xl rounded-2xl shadow-frost-lg p-8 animate-slide-up"
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-slate-100 text-text-muted hover:text-text transition-colors"
                            onClick={() => setShowLogin(false)}
                        >
                            ✕
                        </button>

                        <div className="text-center mb-6">
                            <div className="mx-auto mb-4">
                                <NeuralKnot size="sm" state="coaching" />
                            </div>
                            <h2 className="text-2xl font-bold text-text">Create Profile</h2>
                            <p className="text-text-secondary mt-1">Get a nickname to track your history locally.</p>
                        </div>

                        <form
                            className="space-y-4"
                            onSubmit={(e) => {
                                e.preventDefault();
                                if (nickname.trim()) {
                                    setProfile(nickname.trim());
                                    showToast(`Welcome, ${nickname}! Your profile is ready.`, 'success');
                                    setShowLogin(false);
                                }
                            }}
                        >
                            <div>
                                <input
                                    type="text"
                                    className="form-input"
                                    placeholder="Enter your nickname"
                                    value={nickname}
                                    onChange={(e) => setNicknameInput(e.target.value)}
                                    maxLength={20}
                                    required
                                    autoFocus
                                />
                            </div>
                            <button type="submit" className="btn-primary w-full">
                                Create Profile
                            </button>
                        </form>

                        <p className="text-center text-sm text-text-secondary mt-6">
                            New to HRprep?{' '}
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

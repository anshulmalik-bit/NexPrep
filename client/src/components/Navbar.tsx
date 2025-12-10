import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navbar.css';

export function Navbar() {
    const [isOpen, setIsOpen] = useState(false);
    const [showLogin, setShowLogin] = useState(false);
    const location = useLocation();

    const isActive = (path: string) => location.pathname === path;

    const links = [
        { path: '/', label: 'Home' },
        { path: '/choose-path', label: 'Choose Path' },
        { path: '/setup/company', label: 'Company Insights' },
        { path: '/setup/resume', label: 'Resume Upload' },
        { path: '/leaderboard', label: 'Leaderboard' },
        { path: '/resources', label: 'Resources' },
    ];

    const handleLogin = () => {
        setShowLogin(true);
        setIsOpen(false);
    };

    return (
        <>
            <nav className="navbar" aria-label="Main navigation">
                <div className="navbar__container">
                    {/* Logo */}
                    <Link to="/" className="navbar__logo">
                        <div className="navbar__logo-icon">
                            <span className="navbar__logo-n">N</span>
                            <span className="navbar__quinn-dot"></span>
                        </div>
                        <span className="navbar__logo-text">
                            <span className="navbar__logo-nex">Nex</span>Prep
                        </span>
                    </Link>

                    {/* Desktop Links */}
                    <ul className="navbar__links">
                        {links.map((link) => (
                            <li key={link.path}>
                                <Link
                                    to={link.path}
                                    className={`navbar__link ${isActive(link.path) ? 'navbar__link--active' : ''}`}
                                >
                                    {link.label}
                                </Link>
                            </li>
                        ))}
                    </ul>

                    {/* Desktop Actions */}
                    <div className="navbar__actions">
                        <button className="navbar__btn-login" onClick={handleLogin}>Log In</button>
                        <Link to="/choose-path" className="navbar__btn-cta">
                            Start Simulation
                        </Link>
                    </div>

                    {/* Mobile Actions */}
                    <div className="navbar__mobile-actions">
                        <Link to="/choose-path" className="navbar__btn-cta-mobile" aria-label="Start Simulation">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M5 12h14M12 5l7 7-7 7" />
                            </svg>
                        </Link>
                        <button
                            className="navbar__toggle"
                            onClick={() => setIsOpen(!isOpen)}
                            aria-expanded={isOpen}
                            aria-label="Toggle menu"
                        >
                            <span className={isOpen ? 'open' : ''}></span>
                            <span className={isOpen ? 'open' : ''}></span>
                            <span className={isOpen ? 'open' : ''}></span>
                        </button>
                    </div>
                </div>

                {/* Mobile Menu Drawer */}
                <div className={`navbar__drawer ${isOpen ? 'navbar__drawer--open' : ''}`}>
                    <div className="navbar__drawer-backdrop" onClick={() => setIsOpen(false)} />
                    <div className="navbar__drawer-content">
                        <ul className="navbar__drawer-links">
                            {links.map((link) => (
                                <li key={link.path}>
                                    <Link
                                        to={link.path}
                                        className={`navbar__drawer-link ${isActive(link.path) ? 'navbar__drawer-link--active' : ''}`}
                                        onClick={() => setIsOpen(false)}
                                    >
                                        {link.label}
                                    </Link>
                                </li>
                            ))}
                            <li>
                                <button className="navbar__drawer-login" onClick={handleLogin}>Log In</button>
                            </li>
                        </ul>
                    </div>
                </div>
            </nav>

            {/* Login Modal */}
            {showLogin && (
                <div className="login-modal" onClick={() => setShowLogin(false)}>
                    <div className="login-modal__content glass-card" onClick={e => e.stopPropagation()}>
                        <button
                            className="login-modal__close"
                            onClick={() => setShowLogin(false)}
                        >
                            ✕
                        </button>
                        <div className="login-modal__icon">🤖</div>
                        <h2 className="login-modal__title">Welcome Back!</h2>
                        <p className="login-modal__subtitle">Sign in to track your progress</p>

                        <form className="login-modal__form" onSubmit={(e) => {
                            e.preventDefault();
                            alert('Login functionality coming soon! For now, enjoy the simulation without an account.');
                            setShowLogin(false);
                        }}>
                            <div className="form-group">
                                <input
                                    type="email"
                                    className="form-input"
                                    placeholder="Email address"
                                    required
                                />
                            </div>
                            <div className="form-group">
                                <input
                                    type="password"
                                    className="form-input"
                                    placeholder="Password"
                                    required
                                />
                            </div>
                            <button type="submit" className="btn btn--primary btn--lg" style={{ width: '100%' }}>
                                Sign In
                            </button>
                        </form>

                        <p className="login-modal__footer">
                            New to NexPrep? <Link to="/choose-path" onClick={() => setShowLogin(false)}>Start for free →</Link>
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}

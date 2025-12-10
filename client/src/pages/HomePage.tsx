import { Link } from 'react-router-dom';
import './HomePage.css';

export function HomePage() {
    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="container hero__container">
                    <div className="hero__content">
                        <h1 className="hero__title">
                            <span className="hero__headline">
                                <span className="hero__brand">NexPrep:</span> Train Smarter.
                            </span>
                            <br />Feel Confident.
                        </h1>
                        <p className="hero__description">
                            Meet Quinn — your adaptive AI interview mentor to guide you
                            through interview preparation and career advancement.
                        </p>
                        <div className="hero__actions">
                            <Link to="/choose-path" className="hero__cta">
                                Start Simulation
                            </Link>
                            <Link to="/how-it-works" className="btn btn--ghost btn--lg">
                                How It Works
                            </Link>
                        </div>
                    </div>

                    <div className="hero__visual">
                        <div className="hero__quinn-wrapper">
                            <div className="hero__quinn-glow"></div>
                            {/* Neural Knot - Pure CSS Design */}
                            <div className="hero__neural-knot">
                                <div className="neural-knot__core"></div>
                                <div className="neural-knot__ring neural-knot__ring--1"></div>
                                <div className="neural-knot__ring neural-knot__ring--2"></div>
                                <div className="neural-knot__ring neural-knot__ring--3"></div>
                                <div className="neural-knot__thread neural-knot__thread--1"></div>
                                <div className="neural-knot__thread neural-knot__thread--2"></div>
                                <div className="neural-knot__thread neural-knot__thread--3"></div>
                                <div className="neural-knot__thread neural-knot__thread--4"></div>
                            </div>
                            <div className="hero__chat-bubbles">
                                <div className="hero__bubble hero__bubble--1">
                                    <span>💬</span> Tell me about yourself...
                                </div>
                                <div className="hero__bubble hero__bubble--2">
                                    <span>✨</span> Great structure!
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="hero__grid-bg"></div>
            </section>

            {/* Features Section */}
            <section className="features">
                <div className="container">
                    <div className="features__grid">
                        <div className="feature-card glass-card hover-lift">
                            <div className="feature-card__icon">🎯</div>
                            <h3 className="feature-card__title">Adaptive Interview Simulation</h3>
                            <p className="feature-card__description">
                                Practice with AI-generated questions tailored to your role, experience, and target company.
                            </p>
                        </div>
                        <div className="feature-card glass-card hover-lift">
                            <div className="feature-card__icon">📄</div>
                            <h3 className="feature-card__title">Real Resume Insights</h3>
                            <p className="feature-card__description">
                                Upload your resume and get personalized questions based on your actual experience.
                            </p>
                        </div>
                        <div className="feature-card glass-card hover-lift">
                            <div className="feature-card__icon">🏢</div>
                            <h3 className="feature-card__title">Company-Based Preparation</h3>
                            <p className="feature-card__description">
                                Get insights into company culture, values, and interview style to prepare effectively.
                            </p>
                        </div>
                    </div>
                </div>
            </section>

            {/* How It Works */}
            <section className="how-section">
                <div className="container">
                    <div className="section-header text-center">
                        <h2>How NexPrep Works</h2>
                        <p className="page-subtitle">Four simple steps to interview confidence</p>
                    </div>
                    <div className="how-steps">
                        <div className="how-step">
                            <div className="how-step__number">01</div>
                            <h4>Choose Your Path</h4>
                            <p>Select your target track and role</p>
                        </div>
                        <div className="how-step__arrow">→</div>
                        <div className="how-step">
                            <div className="how-step__number">02</div>
                            <h4>Add Context</h4>
                            <p>Company info & resume upload</p>
                        </div>
                        <div className="how-step__arrow">→</div>
                        <div className="how-step">
                            <div className="how-step__number">03</div>
                            <h4>Meet Quinn</h4>
                            <p>Practice with your AI mentor</p>
                        </div>
                        <div className="how-step__arrow">→</div>
                        <div className="how-step">
                            <div className="how-step__number">04</div>
                            <h4>Get Results</h4>
                            <p>Detailed feedback & improvement plan</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-card glass-card">
                        <h2>Ready to Transform Your Interview Skills?</h2>
                        <p>Start practicing with Quinn today. No signup required.</p>
                        <Link to="/choose-path" className="btn btn--primary btn--lg">
                            Start Your Simulation →
                        </Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="footer">
                <div className="container">
                    <div className="footer__grid">
                        <div className="footer__brand">
                            <div className="footer__logo">
                                <div className="navbar__logo-icon" style={{ width: 32, height: 32 }}>
                                    <span className="navbar__logo-n" style={{ fontSize: 14 }}>N</span>
                                </div>
                                <span>NexPrep</span>
                            </div>
                            <p>Train Smarter. Feel Confident.</p>
                        </div>
                        <div className="footer__links">
                            <h5>Product</h5>
                            <ul>
                                <li><Link to="/choose-path">Choose Path</Link></li>
                                <li><Link to="/leaderboard">Leaderboard</Link></li>
                                <li><Link to="/resources">Resources</Link></li>
                            </ul>
                        </div>
                        <div className="footer__links">
                            <h5>Company</h5>
                            <ul>
                                <li><Link to="/about">About</Link></li>
                                <li><Link to="/contact">Contact</Link></li>
                                <li><Link to="/privacy">Privacy</Link></li>
                            </ul>
                        </div>
                    </div>
                    <div className="footer__bottom">
                        <p>© 2024 NexPrep. All rights reserved.</p>
                    </div>
                </div>
            </footer>
        </div>
    );
}

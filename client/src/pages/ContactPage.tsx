import { useState } from 'react';
import { Link } from 'react-router-dom';
import { NeuralKnot } from '../components/NeuralKnot';

export function ContactPage() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        message: '',
    });
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // In a real app, this would send to an API
        setSubmitted(true);
    };

    return (
        <div className="min-h-screen bg-canvas pt-[72px]">
            <div className="container py-12 lg:py-20">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="page-title mb-4">Contact Us</h1>
                    <p className="page-subtitle">
                        Have questions or feedback? We'd love to hear from you.
                    </p>
                </div>

                <div className="max-w-lg mx-auto">
                    {submitted ? (
                        <div className="glass-card-strong p-8 lg:p-12 text-center">
                            <div className="w-16 h-16 mx-auto mb-6">
                                <NeuralKnot size="md" state="celebrating" />
                            </div>
                            <h2 className="text-2xl font-bold text-text mb-3">Message Sent!</h2>
                            <p className="text-text-secondary mb-8">
                                Thank you for reaching out. We'll get back to you soon.
                            </p>
                            <Link to="/" className="btn-primary px-8 py-3 rounded-full">
                                Back to Home
                            </Link>
                        </div>
                    ) : (
                        <form className="glass-card p-6 lg:p-8 space-y-6" onSubmit={handleSubmit}>
                            <div>
                                <label className="block text-sm font-medium text-text mb-2" htmlFor="name">
                                    Name
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    className="form-input w-full"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text mb-2" htmlFor="email">
                                    Email
                                </label>
                                <input
                                    type="email"
                                    id="email"
                                    className="form-input w-full"
                                    value={formData.email}
                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-text mb-2" htmlFor="message">
                                    Message
                                </label>
                                <textarea
                                    id="message"
                                    className="form-input w-full resize-none"
                                    value={formData.message}
                                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                    rows={5}
                                    required
                                />
                            </div>
                            <button type="submit" className="btn-cta w-full py-4 rounded-full text-lg">
                                Send Message
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
}

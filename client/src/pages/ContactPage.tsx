import { useState } from 'react';
import { Button } from '../components/Button';
import './ContactPage.css';

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
        <div className="contact-page">
            <div className="container container--narrow">
                <div className="page-header text-center">
                    <h1 className="page-title">Contact Us</h1>
                    <p className="page-subtitle">
                        Have questions or feedback? We'd love to hear from you.
                    </p>
                </div>

                {submitted ? (
                    <div className="contact-success">
                        <div className="contact-success__icon">✉️</div>
                        <h2>Message Sent!</h2>
                        <p>Thank you for reaching out. We'll get back to you soon.</p>
                        <Button to="/" variant="secondary">
                            Back to Home
                        </Button>
                    </div>
                ) : (
                    <form className="contact-form" onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label className="form-label" htmlFor="name">Name</label>
                            <input
                                type="text"
                                id="name"
                                className="form-input"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="email">Email</label>
                            <input
                                type="email"
                                id="email"
                                className="form-input"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label className="form-label" htmlFor="message">Message</label>
                            <textarea
                                id="message"
                                className="form-input form-textarea"
                                value={formData.message}
                                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                                rows={5}
                                required
                            />
                        </div>
                        <Button type="submit" variant="cta" size="lg">
                            Send Message
                        </Button>
                    </form>
                )}
            </div>
        </div>
    );
}

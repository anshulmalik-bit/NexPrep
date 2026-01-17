/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        extend: {
            // Deep Intelligence Color System
            colors: {
                // Primary: Electric Indigo
                primary: {
                    DEFAULT: '#6366f1',
                    light: '#818cf8',
                    dark: '#4f46e5',
                },
                // Accent: Vibrant Teal
                accent: {
                    DEFAULT: '#14b8a6',
                    light: '#2dd4bf',
                    dark: '#0d9488',
                },
                // Canvas & Surfaces
                canvas: '#f8fafc',
                surface: '#ffffff',
                // Text: Deep Slate
                text: {
                    DEFAULT: '#1e293b',
                    secondary: '#475569',
                    muted: '#94a3b8',
                },
                // Semantic Colors
                success: '#10b981',
                warning: '#f59e0b',
                error: '#ef4444',
            },
            // Typography
            fontFamily: {
                heading: ['Space Grotesk', 'system-ui', 'sans-serif'],
                body: ['Inter', 'system-ui', 'sans-serif'],
            },
            // Spacing
            spacing: {
                '18': '4.5rem',
                '88': '22rem',
                '128': '32rem',
            },
            // Border Radius
            borderRadius: {
                'xl': '16px',
                '2xl': '24px',
                '3xl': '32px',
            },
            // Box Shadows (Frosted Ice System)
            boxShadow: {
                'frost': '0 4px 6px -1px rgba(99, 102, 241, 0.1)',
                'frost-lg': '0 10px 25px -3px rgba(99, 102, 241, 0.12)',
                'frost-glow': '0 0 20px rgba(99, 102, 241, 0.08)',
                'neural': '0 0 30px rgba(99, 102, 241, 0.4), 0 0 60px rgba(20, 184, 166, 0.3)',
                'glass': '0 8px 32px rgba(99, 102, 241, 0.1)',
            },
            // Backdrop Blur
            backdropBlur: {
                'xs': '2px',
                'frost': '10px',
            },
            // Transitions
            transitionTimingFunction: {
                'spring': 'cubic-bezier(0.34, 1.56, 0.64, 1)',
            },
            // Animations
            animation: {
                'neural-idle': 'neural-rotate 8s linear infinite',
                'neural-thinking': 'neural-rotate 2s linear infinite',
                'neural-pulse': 'neural-pulse 1.5s ease-in-out infinite',
                'neural-coaching': 'neural-coaching 1.5s ease-in-out infinite',
                'float': 'float 6s ease-in-out infinite',
                'float-delayed': 'float 6s ease-in-out 2s infinite',
                'glow': 'glow 2s ease-in-out infinite alternate',
                'blob': 'blob 7s infinite',
                'slide-up': 'slide-up 0.5s ease-out',
                'fade-in': 'fade-in 0.3s ease-out',
                'confetti': 'confetti 3s ease-in-out forwards',
            },
            keyframes: {
                'neural-rotate': {
                    '0%': { transform: 'rotate(0deg)' },
                    '100%': { transform: 'rotate(360deg)' },
                },
                'neural-pulse': {
                    '0%, 100%': { opacity: '1', transform: 'scale(1)' },
                    '50%': { opacity: '0.8', transform: 'scale(1.05)' },
                },
                'neural-coaching': {
                    '0%, 100%': {
                        boxShadow: '0 0 30px rgba(20, 184, 166, 0.4), 0 0 60px rgba(20, 184, 166, 0.2)',
                        transform: 'scale(1)'
                    },
                    '50%': {
                        boxShadow: '0 0 50px rgba(20, 184, 166, 0.6), 0 0 80px rgba(20, 184, 166, 0.3)',
                        transform: 'scale(1.02)'
                    },
                },
                'float': {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
                'glow': {
                    '0%': { boxShadow: '0 0 20px rgba(99, 102, 241, 0.3)' },
                    '100%': { boxShadow: '0 0 40px rgba(99, 102, 241, 0.5), 0 0 60px rgba(20, 184, 166, 0.3)' },
                },
                'blob': {
                    '0%': { transform: 'translate(0px, 0px) scale(1)' },
                    '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
                    '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
                    '100%': { transform: 'translate(0px, 0px) scale(1)' },
                },
                'slide-up': {
                    '0%': { opacity: '0', transform: 'translateY(20px)' },
                    '100%': { opacity: '1', transform: 'translateY(0)' },
                },
                'fade-in': {
                    '0%': { opacity: '0' },
                    '100%': { opacity: '1' },
                },
                'confetti': {
                    '0%': { transform: 'translateY(0) rotate(0deg)', opacity: '1' },
                    '100%': { transform: 'translateY(400px) rotate(720deg)', opacity: '0' },
                },
            },
        },
    },
    plugins: [],
}

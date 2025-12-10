import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Link } from 'react-router-dom';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: 'primary' | 'secondary' | 'ghost' | 'cta';
    size?: 'sm' | 'md' | 'lg';
    children: ReactNode;
    to?: string;
    isLoading?: boolean;
}

export function Button({
    variant = 'primary',
    size = 'md',
    children,
    to,
    isLoading,
    disabled,
    className = '',
    ...props
}: ButtonProps) {
    const classes = [
        'btn',
        `btn--${variant}`,
        size !== 'md' && `btn--${size}`,
        className,
    ].filter(Boolean).join(' ');

    if (to) {
        return (
            <Link to={to} className={classes}>
                {children}
            </Link>
        );
    }

    return (
        <button
            className={classes}
            disabled={disabled || isLoading}
            {...props}
        >
            {isLoading ? (
                <>
                    <span className="loading-spinner" style={{ width: 16, height: 16 }} />
                    Loading...
                </>
            ) : (
                children
            )}
        </button>
    );
}

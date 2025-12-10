import type { ReactNode } from 'react';

interface CardProps {
    children: ReactNode;
    className?: string;
    hover?: boolean;
    interactive?: boolean;
    selected?: boolean;
    onClick?: () => void;
}

export function Card({
    children,
    className = '',
    hover = false,
    interactive = false,
    selected = false,
    onClick,
}: CardProps) {
    const classes = [
        'card',
        hover && 'card--hover',
        interactive && 'card--interactive',
        selected && 'card--selected',
        className,
    ].filter(Boolean).join(' ');

    return (
        <div
            className={classes}
            onClick={onClick}
            role={interactive ? 'button' : undefined}
            tabIndex={interactive ? 0 : undefined}
            onKeyDown={interactive ? (e) => e.key === 'Enter' && onClick?.() : undefined}
        >
            {children}
        </div>
    );
}

interface FeatureCardProps {
    icon: string;
    title: string;
    description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
    return (
        <Card className="feature-card" hover>
            <div className="card__icon feature-card__icon">{icon}</div>
            <h3 className="card__title">{title}</h3>
            <p className="card__description">{description}</p>
        </Card>
    );
}

interface SelectionCardProps {
    emoji: string;
    name: string;
    meta?: string;
    selected?: boolean;
    onClick?: () => void;
}

export function SelectionCard({ emoji, name, meta, selected, onClick }: SelectionCardProps) {
    return (
        <Card
            className="selection-card"
            interactive
            selected={selected}
            hover
            onClick={onClick}
        >
            <div className="selection-card__emoji">{emoji}</div>
            <div className="selection-card__content">
                <div className="selection-card__name">{name}</div>
                {meta && <div className="selection-card__meta">{meta}</div>}
            </div>
            {selected && <span className="selection-card__check">✓</span>}
        </Card>
    );
}

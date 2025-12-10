import { type FC, useEffect, useState } from 'react';

interface ConfettiProps {
    trigger: boolean;
    duration?: number;
    particleCount?: number;
}

interface Particle {
    id: number;
    left: string;
    delay: string;
    size: string;
}

export const Confetti: FC<ConfettiProps> = ({
    trigger,
    duration = 3000,
    particleCount = 50,
}) => {
    const [particles, setParticles] = useState<Particle[]>([]);
    const [isActive, setIsActive] = useState(false);

    useEffect(() => {
        if (trigger && !isActive) {
            setIsActive(true);

            // Generate particles
            const newParticles: Particle[] = Array.from({ length: particleCount }, (_, i) => ({
                id: i,
                left: `${Math.random() * 100}%`,
                delay: `${Math.random() * 0.5}s`,
                size: `${6 + Math.random() * 8}px`,
            }));

            setParticles(newParticles);

            // Clean up after animation
            const timer = setTimeout(() => {
                setParticles([]);
                setIsActive(false);
            }, duration);

            return () => clearTimeout(timer);
        }
    }, [trigger, duration, particleCount, isActive]);

    if (particles.length === 0) return null;

    return (
        <div className="confetti-container">
            {particles.map((particle) => (
                <div
                    key={particle.id}
                    className="confetti-piece"
                    style={{
                        left: particle.left,
                        animationDelay: particle.delay,
                        width: particle.size,
                        height: particle.size,
                    }}
                />
            ))}
        </div>
    );
};

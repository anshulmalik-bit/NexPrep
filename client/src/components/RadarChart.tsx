import { motion } from 'framer-motion';

interface DataPoint {
    subject: string;
    A: number;
    fullMark: number;
}

interface RadarChartProps {
    data: DataPoint[];
    size?: number;
    className?: string;
}

export function RadarChart({ data, size = 300, className = '' }: RadarChartProps) {
    const radius = size / 2;
    const center = size / 2;
    const angleStep = data.length > 0 ? (2 * Math.PI) / data.length : 0;

    const getCoordinates = (value: number, index: number, max: number) => {
        if (data.length === 0) return { x: center, y: center };
        const angle = index * angleStep - Math.PI / 2;
        const r = (value / max) * (radius - 40); // 40px padding for labels
        const x = center + r * Math.cos(angle);
        const y = center + r * Math.sin(angle);
        return { x, y };
    };

    const points = data.map((d, i) => getCoordinates(d.A, i, d.fullMark))
        .map(p => `${p.x},${p.y}`)
        .join(' ');



    return (
        <div className={`relative w-full aspect-square max-w-[400px] flex items-center justify-center ${className}`}>
            <svg
                viewBox={`0 0 ${size} ${size}`}
                className="w-full h-full overflow-visible"
            >
                {/* Background Grid (Concentric webs) */}
                {[0.25, 0.5, 0.75, 1].map((scale, i) => (
                    <polygon
                        key={i}
                        points={data.length > 0 ? data.map((d, idx) => {
                            const p = getCoordinates(d.fullMark * scale, idx, d.fullMark);
                            return `${p.x},${p.y}`;
                        }).join(' ') : ''}
                        fill="transparent"
                        stroke="rgba(99, 102, 241, 0.1)"
                        strokeWidth="1"
                    />
                ))}

                {/* Axes */}
                {data.map((d, i) => {
                    const p = getCoordinates(d.fullMark, i, d.fullMark);
                    return (
                        <line
                            key={i}
                            x1={center}
                            y1={center}
                            x2={p.x}
                            y2={p.y}
                            stroke="rgba(99, 102, 241, 0.1)"
                            strokeWidth="1"
                        />
                    );
                })}

                {/* Data Polygon */}
                {data.length > 0 && (
                    <motion.polygon
                        points={points}
                        fill="rgba(99, 102, 241, 0.15)"
                        stroke="#6366F1"
                        strokeWidth="2.5"
                        initial={{ opacity: 0, scale: 0 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1.2, ease: "easeOut" }}
                    />
                )}

                {/* Labels */}
                {data.map((d, i) => {
                    const p = getCoordinates(d.fullMark + 25, i, d.fullMark);
                    return (
                        <text
                            key={i}
                            x={p.x}
                            y={p.y}
                            textAnchor="middle"
                            dy="0.35em"
                            className="fill-slate-500 font-bold uppercase tracking-tighter"
                            style={{ fontSize: '11px' }}
                        >
                            {d.subject}
                        </text>
                    );
                })}
            </svg>
        </div>
    );
}


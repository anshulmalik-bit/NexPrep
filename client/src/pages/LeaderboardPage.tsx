import { useState, useEffect } from 'react';
import { api } from '../services/api';
import { NeuralKnot } from '../components/NeuralKnot';

interface LeaderboardEntry {
    rank: number;
    nickname: string;
    score: number;
    track: string;
    role: string;
    createdAt: string;
}

export function LeaderboardPage() {
    const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'all' | 'tech' | 'mba' | 'analytics'>('all');

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const loadLeaderboard = async () => {
        try {
            const data = await api.getLeaderboard();
            setEntries(data || []);
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
            // Mock data for demo
            setEntries([
                { rank: 1, nickname: 'InterviewPro', score: 95, track: 'tech', role: 'swe', createdAt: new Date().toISOString() },
                { rank: 2, nickname: 'DataWizard', score: 92, track: 'analytics', role: 'data-analyst', createdAt: new Date().toISOString() },
                { rank: 3, nickname: 'CodeMaster', score: 89, track: 'tech', role: 'fullstack', createdAt: new Date().toISOString() },
                { rank: 4, nickname: 'BizGuru', score: 87, track: 'mba', role: 'consultant', createdAt: new Date().toISOString() },
                { rank: 5, nickname: 'TechNinja', score: 85, track: 'tech', role: 'frontend', createdAt: new Date().toISOString() },
            ]);
        } finally {
            setLoading(false);
        }
    };

    const filteredEntries = filter === 'all'
        ? entries
        : entries.filter(e => e.track === filter);

    const getCrownIcon = (rank: number) => {
        if (rank === 1) return '👑';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return null;
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-canvas flex items-center justify-center pt-[72px]">
                <NeuralKnot size="md" state="thinking" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-canvas pt-[72px]">
            <div className="container py-12">
                {/* Header */}
                <div className="text-center mb-12">
                    <h1 className="page-title">Leaderboard</h1>
                    <p className="page-subtitle">
                        See how you stack up against other interview champions
                    </p>
                </div>

                {/* Filter Pills - Scrollable on mobile */}
                <div className="flex justify-center mb-8 -mx-4 px-4">
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
                        {[
                            { id: 'all', label: 'All Tracks' },
                            { id: 'tech', label: '💻 Tech' },
                            { id: 'mba', label: '📊 MBA' },
                            { id: 'analytics', label: '📈 Analytics' },
                        ].map((f) => (
                            <button
                                key={f.id}
                                onClick={() => setFilter(f.id as any)}
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-all
                                    ${filter === f.id
                                        ? 'bg-primary text-white shadow-frost'
                                        : 'bg-white border border-slate-200 text-text-secondary hover:border-primary/30'
                                    }`}
                            >
                                {f.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Desktop Table */}
                <div className="hidden lg:block">
                    <div className="glass-card overflow-hidden">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100">
                                    <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Rank</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Player</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Score</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Track</th>
                                    <th className="px-6 py-4 text-left text-sm font-medium text-text-secondary">Role</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredEntries.map((entry, i) => (
                                    <tr
                                        key={i}
                                        className={`border-b border-slate-50 last:border-b-0 transition-colors hover:bg-slate-50/50
                                            ${entry.rank <= 3 ? 'bg-primary/5' : ''}`}
                                    >
                                        <td className="px-6 py-4">
                                            <div className="flex items-center gap-2">
                                                {getCrownIcon(entry.rank) && (
                                                    <span className="text-xl">{getCrownIcon(entry.rank)}</span>
                                                )}
                                                <span className={`font-bold ${entry.rank <= 3 ? 'text-primary' : 'text-text'}`}>
                                                    #{entry.rank}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="font-medium text-text">{entry.nickname}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`font-bold ${entry.score >= 90 ? 'text-accent' : 'text-text'}`}>
                                                {entry.score}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2 py-1 bg-slate-100 rounded-full text-xs text-text-secondary capitalize">
                                                {entry.track}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-text-secondary capitalize">
                                                {entry.role.replace(/-/g, ' ')}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Mobile Card List */}
                <div className="lg:hidden space-y-3">
                    {filteredEntries.map((entry, i) => (
                        <div
                            key={i}
                            className={`glass-card p-4 ${entry.rank <= 3 ? 'ring-2 ring-primary/20' : ''}`}
                        >
                            <div className="flex items-center justify-between mb-2">
                                <div className="flex items-center gap-3">
                                    {getCrownIcon(entry.rank) && (
                                        <span className="text-2xl">{getCrownIcon(entry.rank)}</span>
                                    )}
                                    <span className={`font-bold text-lg ${entry.rank <= 3 ? 'text-primary' : 'text-text'}`}>
                                        #{entry.rank}
                                    </span>
                                    <span className="font-medium text-text">{entry.nickname}</span>
                                </div>
                                <span className={`text-xl font-bold ${entry.score >= 90 ? 'text-accent' : 'text-text'}`}>
                                    {entry.score}
                                </span>
                            </div>
                            <div className="flex gap-2 text-xs">
                                <span className="px-2 py-1 bg-slate-100 rounded-full text-text-secondary capitalize">
                                    {entry.track}
                                </span>
                                <span className="px-2 py-1 bg-slate-100 rounded-full text-text-secondary capitalize">
                                    {entry.role.replace(/-/g, ' ')}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Quinn Insight on #1 */}
                {filteredEntries.length > 0 && (
                    <div className="mt-8 max-w-xl mx-auto">
                        <div className="glass-card p-4 flex items-start gap-4">
                            <div className="flex-shrink-0">
                                <NeuralKnot size="sm" state="coaching" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-text">Quinn's Insight</p>
                                <p className="text-sm text-text-secondary mt-1">
                                    🎉 <strong>{filteredEntries[0]?.nickname}</strong> is leading the pack!
                                    Their interview skills in {filteredEntries[0]?.track} are exceptional.
                                    Keep practicing to climb the ranks!
                                </p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

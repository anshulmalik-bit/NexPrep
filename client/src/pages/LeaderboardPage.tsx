import { useEffect, useState } from 'react';
import { api } from '../services/api';
import { Button } from '../components/Button';
import './LeaderboardPage.css';

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

    useEffect(() => {
        loadLeaderboard();
    }, []);

    const loadLeaderboard = async () => {
        try {
            const data = await api.getLeaderboard(20);
            setEntries(data);
        } catch (error) {
            console.error('Failed to load leaderboard:', error);
        } finally {
            setLoading(false);
        }
    };

    const getRankClass = (rank: number) => {
        if (rank === 1) return 'leaderboard__rank--gold';
        if (rank === 2) return 'leaderboard__rank--silver';
        if (rank === 3) return 'leaderboard__rank--bronze';
        return '';
    };

    const getRankEmoji = (rank: number) => {
        if (rank === 1) return '🥇';
        if (rank === 2) return '🥈';
        if (rank === 3) return '🥉';
        return `#${rank}`;
    };

    return (
        <div className="leaderboard-page">
            <div className="container">
                <div className="page-header text-center">
                    <h1 className="page-title">🏆 Quinn's Top Performers</h1>
                    <p className="page-subtitle">
                        Anonymous rankings based on interview performance
                    </p>
                </div>

                {loading ? (
                    <div className="leaderboard-loading">
                        <div className="loading-spinner" />
                        <p>Loading rankings...</p>
                    </div>
                ) : entries.length === 0 ? (
                    <div className="leaderboard-empty">
                        <div className="leaderboard-empty__icon">🎯</div>
                        <h2>No entries yet!</h2>
                        <p>Complete an interview simulation to be the first on the leaderboard.</p>
                        <Button to="/tracks" variant="cta">
                            Start Your Simulation
                        </Button>
                    </div>
                ) : (
                    <>
                        <div className="leaderboard">
                            <div className="leaderboard__header">
                                <span>Rank</span>
                                <span>Performer</span>
                                <span>Score</span>
                            </div>
                            {entries.map((entry) => (
                                <div key={entry.rank} className="leaderboard__row">
                                    <span className={`leaderboard__rank ${getRankClass(entry.rank)}`}>
                                        {getRankEmoji(entry.rank)}
                                    </span>
                                    <div className="leaderboard__info">
                                        <span className="leaderboard__name">{entry.nickname}</span>
                                        <span className="leaderboard__meta">{entry.track} • {entry.role}</span>
                                    </div>
                                    <span className="leaderboard__score">{entry.score}</span>
                                </div>
                            ))}
                        </div>
                        {entries.length > 0 && (
                            <div className="quinn-commentary">
                                <span className="quinn-commentary__avatar">🤖</span>
                                <p className="quinn-commentary__message">
                                    "Impressive performance by {entries[0]?.nickname}! A score of {entries[0]?.score}
                                    in {entries[0]?.track} shows true interview mastery. Can you beat them?"
                                </p>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
}

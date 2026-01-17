import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/auth-store';
import { tracks } from '../data/tracks';

export function HistoryPage() {
    const { user, history, clearData } = useAuthStore();

    if (!user) {
        return (
            <div className="min-h-screen bg-canvas pt-[72px] flex items-center justify-center">
                <div className="text-center p-8 glass-card max-w-md">
                    <div className="text-5xl mb-6">👤</div>
                    <h1 className="text-2xl font-bold text-text mb-4">No Profile Found</h1>
                    <p className="text-text-secondary mb-8">
                        Create a profile to start tracking your interview history locally.
                    </p>
                    <Link to="/" className="btn-cta px-8 py-3 rounded-full">
                        Back to Home
                    </Link>
                </div>
            </div>
        );
    }

    const getTrackName = (id: string) => {
        const track = tracks.find(t => t.id === id);
        return track ? track.name : id;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="min-h-screen bg-canvas pt-[72px]">
            <div className="container py-12">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="page-title text-left mb-2">Interview History</h1>
                        <p className="text-text-secondary">
                            Welcome back, <span className="font-bold text-text">{user.nickname}</span>.
                            Here are your past performances.
                        </p>
                    </div>

                    <button
                        onClick={() => {
                            if (window.confirm('This will delete all your local history. Are you sure?')) {
                                clearData();
                            }
                        }}
                        className="text-sm text-red-500 hover:text-red-600 font-medium transition-colors"
                    >
                        Clear All History
                    </button>
                </div>

                {history.length === 0 ? (
                    <div className="glass-card p-20 text-center">
                        <div className="text-6xl mb-6">📝</div>
                        <h2 className="text-2xl font-bold text-text mb-2">No Interviews Yet</h2>
                        <p className="text-text-secondary mb-8">
                            Complete your first interview to see your progress here.
                        </p>
                        <Link to="/choose-path" className="btn-cta px-10 py-4">
                            Start First Interview
                        </Link>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {history.map((entry) => (
                            <div key={entry.id} className="glass-card p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 hover:shadow-frost-lg transition-all border border-slate-100/50">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <span className="px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-bold uppercase tracking-wider">
                                            {getTrackName(entry.trackId)}
                                        </span>
                                        <span className="text-sm text-text-muted">
                                            {formatDate(entry.createdAt)}
                                        </span>
                                    </div>
                                    <h3 className="text-xl font-bold text-text mb-1">
                                        {entry.roleId.split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                    </h3>
                                    {entry.companyName && (
                                        <p className="text-sm text-text-secondary flex items-center gap-1">
                                            <span>🏢</span> Target: {entry.companyName}
                                        </p>
                                    )}
                                </div>

                                <div className="flex items-center gap-8 w-full md:w-auto border-t md:border-t-0 pt-6 md:pt-0">
                                    <div className="text-center">
                                        <div className={`text-3xl font-bold ${entry.score >= 80 ? 'text-emerald-500' :
                                            entry.score >= 60 ? 'text-primary' :
                                                'text-amber-500'
                                            }`}>
                                            {entry.score}
                                        </div>
                                        <div className="text-[10px] text-text-muted font-bold uppercase tracking-tight">SCORE</div>
                                    </div>

                                    <Link
                                        to={`/evaluation?session=${entry.id}`}
                                        onClick={() => {
                                            // Navigation to evaluation with historical data might need special handling
                                            // For now, let's just go back to home since EvaluationPage expects a store session
                                            // In a real app, we'd load this history into the store.
                                            // For simplicity, I'll update EvaluationPage to handle "ReadOnly" mode or just show summary.
                                        }}
                                        className="btn-ghost py-2 px-6 text-sm"
                                    >
                                        View Summary
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function InsightsTab({ roomId }) {
    const [insights, setInsights] = useState(null);
    const [loading, setLoading] = useState(true);
    const [days, setDays] = useState(30);

    useEffect(() => {
        fetchInsights();
    }, [roomId, days]);

    const fetchInsights = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/room/${roomId}/insights?days=${days}`);
            setInsights(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch insights:', err);
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="w-12 h-12 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    if (!insights) {
        return (
            <div className="text-center py-16">
                <p className="text-gray-600">Failed to load insights</p>
            </div>
        );
    }

    // EMPTY STATE CHECK - Add this!
    if (insights.isEmpty) {
        return (
            <div className="space-y-6 p-6">
                <div className="flex gap-2">
                    {[7, 14, 30, 90].map(d => (
                        <button
                            key={d}
                            onClick={() => setDays(d)}
                            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                                days === d
                                    ? 'bg-purple-600 text-white'
                                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                            }`}
                        >
                            {d} days
                        </button>
                    ))}
                </div>

                <div className="bg-white rounded-lg shadow-md p-12 text-center">
                    <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-10 h-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3">
                        No Data Available Yet
                    </h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        AI insights will appear once your client starts logging mood data and writing journal entries.
                    </p>
                    <div className="bg-purple-50 rounded-lg p-4 max-w-md mx-auto">
                        <p className="text-sm text-purple-700">
                            <span className="font-semibold">Tip:</span> Encourage your client to:
                        </p>
                        <ul className="mt-2 text-sm text-purple-700 space-y-1 text-left">
                            <li>• Log their mood daily using the Mood Tracker</li>
                            <li>• Write journal entries about their feelings</li>
                            <li>• Share their thoughts and experiences</li>
                        </ul>
                    </div>
                </div>
            </div>
        );
    }

    // Now safe to destructure
    const { wellnessScore, emotionalPatterns, recentSummaries, riskAssessment } = insights;

    return (
        <div className="space-y-6 p-6">
            {/* Time Range Selector */}
            <div className="flex gap-2">
                {[7, 14, 30, 90].map(d => (
                    <button
                        key={d}
                        onClick={() => setDays(d)}
                        className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                            days === d
                                ? 'bg-purple-600 text-white'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        {d} days
                    </button>
                ))}
            </div>

            {/* Wellness Score Card */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h2 className="text-2xl font-bold text-gray-900 mb-4">Wellness Trend Score</h2>
                
                {wellnessScore.score !== null ? (
                    <>
                        <div className="flex items-center gap-6 mb-4">
                            <div className="text-6xl font-bold" style={{
                                color: wellnessScore.score >= 60 ? '#10b981' : 
                                       wellnessScore.score >= 40 ? '#f59e0b' : '#ef4444'
                            }}>
                                {wellnessScore.score}
                            </div>
                            <div className="flex-1">
                                <div className="text-lg font-semibold text-gray-700 mb-1">
                                    {wellnessScore.message}
                                </div>
                                <div className="text-sm text-gray-500">
                                    Confidence: {wellnessScore.confidence} | Trend: {wellnessScore.trend}
                                </div>
                            </div>
                        </div>

                        {/* Contributing Factors */}
                        <div className="mt-4">
                            <h3 className="font-semibold text-gray-900 mb-2">Contributing Factors:</h3>
                            <ul className="space-y-2">
                                {wellnessScore.factors.map((factor, idx) => (
                                    <li key={idx} className="flex items-start gap-2">
                                        <span className="text-purple-600 mt-1">•</span>
                                        <span className="text-gray-700">{factor}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </>
                ) : (
                    <p className="text-gray-600">{wellnessScore.message}</p>
                )}
            </div>

            {/* Risk Assessment */}
            <div className={`rounded-lg shadow-md p-6 ${
                riskAssessment.level === 'high' ? 'bg-red-50 border-2 border-red-300' :
                riskAssessment.level === 'medium' ? 'bg-yellow-50 border-2 border-yellow-300' :
                'bg-green-50 border-2 border-green-300'
            }`}>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Risk Assessment</h3>
                <p className="text-gray-700 mb-3">
                    Current Level: <span className="font-semibold">{riskAssessment.level.toUpperCase()}</span>
                </p>
                {Object.keys(riskAssessment.flags).length > 0 && (
                    <div>
                        <p className="text-sm font-semibold text-gray-700 mb-1">Detected Patterns:</p>
                        <ul className="space-y-1">
                            {Object.entries(riskAssessment.flags).map(([flag, count]) => (
                                <li key={flag} className="text-sm text-gray-600">
                                    {flag}: {count}x
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </div>

            {/* Top Emotions */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Emotional Patterns</h3>
                {emotionalPatterns.topEmotions.length > 0 ? (
                    <div className="space-y-3">
                        {emotionalPatterns.topEmotions.map(({ emotion, count, percentage }) => (
                            <div key={emotion} className="flex items-center gap-3">
                                <div className="w-24 text-sm font-medium text-gray-700 capitalize">
                                    {emotion}
                                </div>
                                <div className="flex-1 bg-gray-200 rounded-full h-6 overflow-hidden">
                                    <div 
                                        className="bg-purple-600 h-full rounded-full transition-all"
                                        style={{ width: `${percentage}%` }}
                                    />
                                </div>
                                <div className="w-16 text-sm text-gray-600 text-right">
                                    {percentage}%
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">No emotional data available</p>
                )}
            </div>

            {/* Recent Summaries */}
            <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Recent Journal Summaries</h3>
                {recentSummaries.length > 0 ? (
                    <div className="space-y-4">
                        {recentSummaries.map((summary, idx) => (
                            <div key={idx} className="border-l-4 border-purple-600 pl-4 py-2">
                                <p className="text-gray-700 mb-2">{summary.summary}</p>
                                <div className="flex gap-4 text-sm text-gray-500">
                                    <span>Intensity: {summary.intensity}/10</span>
                                    <span>Sentiment: {(summary.sentiment * 100).toFixed(0)}%</span>
                                    <span>{new Date(summary.date).toLocaleDateString()}</span>
                                </div>
                                {summary.emotions.length > 0 && (
                                    <div className="mt-1 flex gap-2 flex-wrap">
                                        {summary.emotions.map(e => (
                                            <span key={e} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                                                {e}
                                            </span>
                                        ))}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="text-gray-600">No journal entries analyzed yet</p>
                )}
            </div>
        </div>
    );
}
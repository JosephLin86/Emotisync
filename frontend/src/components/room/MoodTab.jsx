import { useState, useEffect } from 'react';
import api from '../../services/api';

export default function MoodTrackerTab({ roomId }) {
    const [moods, setMoods] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    
    // Form state
    const [moodScore, setMoodScore] = useState(5);
    const [moodLabel, setMoodLabel] = useState('neutral');
    const [stressLevel, setStressLevel] = useState(5);
    const [energyLevel, setEnergyLevel] = useState(5);
    const [optionalNote, setOptionalNote] = useState('');
    const [submitting, setSubmitting] = useState(false);

    useEffect(() => {
        fetchMoods();
    }, [roomId]);

    const fetchMoods = async () => {
        try {
            setLoading(true);
            const response = await api.get(`/api/room/${roomId}/mood?days=30`);
            setMoods(response.data);
            setLoading(false);
        } catch (err) {
            console.error('Failed to fetch moods:', err);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            setSubmitting(true);
            
            await api.post(`/api/room/${roomId}/mood`, {
                moodScore,
                moodLabel,
                stressLevel,
                energyLevel,
                optionalNote
            });
            
            // Reset form
            setMoodScore(5);
            setMoodLabel('neutral');
            setStressLevel(5);
            setEnergyLevel(5);
            setOptionalNote('');
            setShowForm(false);
            
            // Refresh moods
            fetchMoods();
            
        } catch (err) {
            console.error('Failed to submit mood:', err);
            alert('Failed to save mood entry');
        } finally {
            setSubmitting(false);
        }
    };

    const getMoodEmoji = (label) => {
        const emojis = {
            'very_sad': '😢',
            'sad': '😔',
            'neutral': '😐',
            'happy': '🙂',
            'very_happy': '😄'
        };
        return emojis[label] || '😐';
    };

    const getMoodColor = (score) => {
        if (score >= 8) return 'text-green-600';
        if (score >= 6) return 'text-blue-600';
        if (score >= 4) return 'text-yellow-600';
        return 'text-red-600';
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="w-12 h-12 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Mood Tracker</h2>
                    <p className="text-gray-600 mt-1">Track your emotional state over time</p>
                </div>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                >
                    {showForm ? 'Cancel' : '+ Log Mood'}
                </button>
            </div>

            {/* Mood Entry Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="bg-purple-50 rounded-lg p-6 space-y-6">
                    {/* Mood Score */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            How are you feeling? (1 = Very Bad, 10 = Excellent)
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={moodScore}
                                onChange={(e) => {
                                    const score = parseInt(e.target.value);
                                    setMoodScore(score);
                                    // Auto-update label
                                    if (score <= 2) setMoodLabel('very_sad');
                                    else if (score <= 4) setMoodLabel('sad');
                                    else if (score <= 6) setMoodLabel('neutral');
                                    else if (score <= 8) setMoodLabel('happy');
                                    else setMoodLabel('very_happy');
                                }}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-4xl">{getMoodEmoji(moodLabel)}</span>
                            <span className={`text-3xl font-bold ${getMoodColor(moodScore)}`}>
                                {moodScore}
                            </span>
                        </div>
                    </div>

                    {/* Stress Level */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Stress Level (1 = No Stress, 10 = Extreme Stress)
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={stressLevel}
                                onChange={(e) => setStressLevel(parseInt(e.target.value))}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-2xl font-bold text-gray-700 w-12 text-center">
                                {stressLevel}
                            </span>
                        </div>
                    </div>

                    {/* Energy Level */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Energy Level (1 = Exhausted, 10 = Energized)
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="range"
                                min="1"
                                max="10"
                                value={energyLevel}
                                onChange={(e) => setEnergyLevel(parseInt(e.target.value))}
                                className="flex-1 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <span className="text-2xl font-bold text-gray-700 w-12 text-center">
                                {energyLevel}
                            </span>
                        </div>
                    </div>

                    {/* Optional Note */}
                    <div>
                        <label className="block text-sm font-semibold text-gray-900 mb-2">
                            Notes (Optional)
                        </label>
                        <textarea
                            value={optionalNote}
                            onChange={(e) => setOptionalNote(e.target.value)}
                            placeholder="Any additional context about how you're feeling..."
                            className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                            rows="3"
                        />
                    </div>

                    {/* Submit Button */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className="w-full px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {submitting ? 'Saving...' : 'Save Mood Entry'}
                    </button>
                </form>
            )}

            {/* Mood History */}
            <div className="bg-white rounded-lg border border-gray-200">
                <div className="p-4 border-b border-gray-200">
                    <h3 className="text-lg font-semibold text-gray-900">Recent Entries</h3>
                </div>

                {moods.length === 0 ? (
                    <div className="p-8 text-center text-gray-600">
                        No mood entries yet. Click "Log Mood" to get started!
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {moods.map((mood) => (
                            <div key={mood._id} className="p-4 hover:bg-gray-50 transition-colors">
                                <div className="flex items-center justify-between mb-2">
                                    <div className="flex items-center gap-3">
                                        <span className="text-3xl">{getMoodEmoji(mood.moodLabel)}</span>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <span className={`text-2xl font-bold ${getMoodColor(mood.moodScore)}`}>
                                                    {mood.moodScore}/10
                                                </span>
                                                <span className="text-sm text-gray-500">
                                                    {new Date(mood.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                
                                <div className="flex gap-4 text-sm text-gray-600 ml-12">
                                    <span>Stress: {mood.stressLevel}/10</span>
                                    <span>Energy: {mood.energyLevel}/10</span>
                                </div>
                                
                                {mood.optionalNote && (
                                    <p className="mt-2 text-gray-700 ml-12 text-sm italic">
                                        "{mood.optionalNote}"
                                    </p>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
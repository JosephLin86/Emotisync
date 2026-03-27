import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyRoom, getJournal } from '../services/roomService';

export default function ClientDashboardPage() {
    const [room, setRoom] = useState(null);
    const [journalEntry, setJournalEntry] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showId, setShowId] = useState(false);
    const [showMoodUpdate, setShowMoodUpdate] = useState(false);
    const [selectedMood, setSelectedMood] = useState('');

    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchClientRoom();
    }, []);

    const fetchClientRoom = async () => {
        try {
            setLoading(true);
            const roomData = await getMyRoom();
            setRoom(roomData);

            if (roomData._id) {
                const journalData = await getJournal(roomData._id);
                setJournalEntry(journalData);
            }
            setLoading(false);
        } catch (err) {
            if (err.response?.status === 404) {
                setRoom(null);
                setLoading(false);
            } else {
                setError(err.message || 'Failed to Load Dashboard');
                setLoading(false);
            }
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate('/login');
    };

    const handleEnterRoom = () => {
        if (room) {
            navigate(`/rooms/${room._id}`);
        }
    };

    const handleMoodUpdate = (mood) => {
        setSelectedMood(mood);
        // TODO: Send mood update to backend
        console.log('Mood updated:', mood);
        setTimeout(() => setShowMoodUpdate(false), 1500);
    };

    const moods = [
        { emoji: '😊', label: 'Happy', value: 'happy' },
        { emoji: '😌', label: 'Calm', value: 'calm' },
        { emoji: '😔', label: 'Sad', value: 'sad' },
        { emoji: '😰', label: 'Anxious', value: 'anxious' },
        { emoji: '😤', label: 'Frustrated', value: 'frustrated' },
        { emoji: '😐', label: 'Neutral', value: 'neutral' }
    ];

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-purple-900">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-700 border-t-purple-300 rounded-full animate-spin mx-auto mb-4"></div>
                    <div className="text-lg text-purple-100">Loading your dashboard...</div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-purple-900">
                <div className="text-center max-w-md bg-white rounded-xl shadow-2xl p-8">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="text-xl text-gray-900 font-semibold mb-2">Something went wrong</div>
                    <div className="text-gray-600 mb-6">{error}</div>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    // Main Dashboard
    return (
        <div className="min-h-screen bg-purple-900">
            {/* Header */}
            <header className="bg-purple-950/50 backdrop-blur-sm border-b border-purple-800/50">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">
                                Welcome back, {user?.username}
                            </h1>
                            {room && (
                                <p className="text-purple-200 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                    Your Therapist: <span className="font-medium text-purple-100">{room?.therapistId?.username}</span>
                                </p>
                            )}
                        </div>
                        <button
                            onClick={handleLogout}
                            className="px-5 py-2.5 text-purple-200 hover:text-white hover:bg-purple-800/50 rounded-lg transition-colors font-medium"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-12">
                {!room ? (
                    // No Room Assigned
                    <div className="max-w-2xl mx-auto">
                        <div className="bg-white rounded-xl shadow-2xl p-12 text-center">
                            <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <svg className="w-10 h-10 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                </svg>
                            </div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-3">
                                No Room Assigned Yet
                            </h2>
                            <p className="text-gray-600 mb-8 text-lg">
                                Your therapist will create a therapy room for you. Share your client ID to get started.
                            </p>
                            <button
                                onClick={() => setShowId(!showId)}
                                className="px-8 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium inline-flex items-center gap-2"
                            >
                                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                                </svg>
                                {showId ? 'Hide' : 'Show'} My Client ID
                            </button>

                            {showId && (
                                <div className="mt-8 p-6 bg-purple-50 rounded-xl border border-purple-200">
                                    <p className="text-sm font-semibold text-purple-900 mb-3 uppercase tracking-wide">
                                        Your Client ID
                                    </p>
                                    <div className="bg-white p-4 rounded-lg border border-purple-300 font-mono text-sm text-gray-800 break-all select-all">
                                        {user?.id}
                                    </div>
                                    <p className="text-sm text-purple-700 mt-4 flex items-center justify-center gap-2">
                                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        Copy and send this to your therapist
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                ) : (
                    // Has Room - Main Dashboard
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Enter Room Card */}
                        <div
                            className="bg-gradient-to-br from-purple-600 via-purple-500 to-violet-500 rounded-xl shadow-2xl p-10 text-white hover:shadow-purple-500/50 hover:scale-[1.02] transition-all group"
                        >
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-3xl font-bold mb-2">Your Therapy Room</h2>
                                    <p className="text-purple-100 text-lg">
                                        Shared space with {room?.therapistId?.username}
                                    </p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
                                    <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                                    </svg>
                                </div>
                            </div>

                            {/* Quick Stats */}
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                    <div className="flex items-center gap-3 mb-2">
                                        <svg className="w-5 h-5 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                        </svg>
                                        <div className="text-sm text-purple-100">Journals</div>
                                    </div>
                                    <div className="text-3xl font-bold">{journalEntry?.length || 0}</div>
                                </div>
                                <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 border border-white/20">
                                    <div className="flex items-center gap-3 mb-2">
                                        <svg className="w-5 h-5 text-purple-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                        </svg>
                                        <div className="text-sm text-purple-100">Messages</div>
                                    </div>
                                    <div className="text-3xl font-bold">{room?.messages?.length || 0}</div>
                                </div>
                            </div>

                            <button onClick={handleEnterRoom}
                                className="w-full bg-white text-purple-600 py-4 rounded-lg font-semibold text-lg cursor-pointer hover:bg-purple-50 transition-colors flex items-center justify-center gap-3 group-hover:gap-4"
                            >
                                Enter Room
                                <svg className="w-6 h-6 transition-transform group-hover:translate-x-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                </svg>
                            </button>
                        </div>

                        {/* Mood Update Card */}
                        <div className="bg-white rounded-xl shadow-2xl p-10">
                            <div className="flex items-start justify-between mb-6">
                                <div>
                                    <h2 className="text-3xl font-bold text-gray-900 mb-2">How are you feeling?</h2>
                                    <p className="text-gray-600 text-lg">
                                        Track your emotional state
                                    </p>
                                </div>
                                <div className="bg-purple-50 p-3 rounded-lg">
                                    <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                            </div>

                            {!showMoodUpdate ? (
                                <>
                                    {/* Mood Selection Grid */}
                                    <div className="grid grid-cols-3 gap-3 mb-8">
                                        {moods.map((mood) => (
                                            <button
                                                key={mood.value}
                                                onClick={() => handleMoodUpdate(mood.label)}
                                                className="bg-gray-50 hover:bg-purple-50 p-6 rounded-lg text-center transition-all hover:scale-105 active:scale-95 border-2 border-gray-200 hover:border-purple-300"
                                            >
                                                <div className="text-4xl mb-2">{mood.emoji}</div>
                                                <div className="text-sm font-medium text-gray-700">{mood.label}</div>
                                            </button>
                                        ))}
                                    </div>

                                    <div className="bg-purple-50 rounded-lg p-4 border border-purple-100">
                                        <p className="text-sm text-purple-700 text-center flex items-center justify-center gap-2">
                                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Your mood will be shared with your therapist
                                        </p>
                                    </div>
                                </>
                            ) : (
                                // Mood Updated Confirmation
                                <div className="text-center py-12">
                                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <svg className="w-10 h-10 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                        </svg>
                                    </div>
                                    <h3 className="text-2xl font-bold text-gray-900 mb-2">
                                        Mood Updated
                                    </h3>
                                    <p className="text-gray-600">
                                        You're feeling <span className="font-semibold text-purple-600">{selectedMood}</span>
                                    </p>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
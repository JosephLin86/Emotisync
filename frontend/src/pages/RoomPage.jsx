import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getJournal } from '../services/roomService';
import JournalTab from '../components/room/JournalTab';
import MessageTab from '../components/room/MessageTab';
import MoodTab from '../components/room/MoodTab';
import ResourceTab from '../components/room/ResourceTab';
import api from '../services/api';

export default function RoomPage() {
    const { roomId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [room, setRoom] = useState(null);
    const [journalEntries, setJournalEntries] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [activeTab, setActiveTab] = useState('journals'); // journals, messages, mood, resources

    useEffect(() => {
        fetchRoomData();
    }, [roomId]);

    const fetchRoomData = async () => {
        try {
            setLoading(true);
            
            // Fetch room details
            const roomResponse = await api.get(`/api/room/${roomId}`);
            setRoom(roomResponse.data);
            
            // Fetch journal entries
            const journalData = await getJournal(roomId);
            setJournalEntries(journalData);
            
            // Fetch messages from separate collection
            try {
                const messagesResponse = await api.get(`/api/messages/${roomId}/messages`);
                setMessages(messagesResponse.data);
            } catch (msgErr) {
                console.error('Failed to fetch messages:', msgErr);
                setMessages([]);
            }
            
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load room');
            setLoading(false);
        }
    };

    const tabs = [
        { 
            id: 'journals', 
            name: 'Journals', 
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
            ),
            count: journalEntries.length
        },
        { 
            id: 'messages', 
            name: 'Messages', 
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
            ),
            count: messages.length
        },
        { 
            id: 'mood', 
            name: 'Mood Tracker', 
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
            )
        },
        { 
            id: 'resources', 
            name: 'Resources', 
            icon: (
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                </svg>
            )
        }
    ];

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-purple-50">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin mx-auto mb-4"></div>
                    <div className="text-lg text-purple-900">Loading room...</div>
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-purple-50">
                <div className="text-center max-w-md bg-white rounded-xl shadow-2xl p-8">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                    </div>
                    <div className="text-xl text-gray-900 font-semibold mb-2">Something went wrong</div>
                    <div className="text-gray-600 mb-6">{error}</div>
                    <button
                        onClick={() => navigate(user?.role === 'therapist' ? '/dashboard/therapist' : '/dashboard/client')}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium cursor-pointer"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-purple-50">
            {/* Header */}
            <header className="bg-white/80 backdrop-blur-sm border-b border-purple-200 shadow-sm">
                <div className="max-w-7xl mx-auto px-6 py-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-purple-900 mb-1">
                                Therapy Room
                            </h1>
                            <p className="text-purple-700 flex items-center gap-2">
                                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                                {user?.role === 'therapist' 
                                    ? `Client: ${room?.clientId?.username || 'undefined'}` 
                                    : `Therapist: ${room?.therapistId?.username || 'undefined'}`}
                            </p>
                        </div>
                        <button
                            onClick={() => navigate(user?.role === 'therapist' ? '/dashboard/therapist' : '/dashboard/client')}
                            className="px-5 py-2.5 text-purple-700 hover:text-purple-900 hover:bg-purple-100 rounded-lg transition-colors font-medium inline-flex items-center gap-2 cursor-pointer"
                        >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                            </svg>
                            Back
                        </button>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Tabs */}
                <div className="bg-purple-100/50 backdrop-blur-sm rounded-t-xl border-b border-purple-200 p-2">
                    <div className="flex gap-2">
                        {tabs.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all cursor-pointer ${
                                    activeTab === tab.id
                                        ? 'bg-white text-purple-600 shadow-lg'
                                        : 'text-purple-700 hover:bg-purple-200/50'
                                }`}
                            >
                                {tab.icon}
                                <span>{tab.name}</span>
                                {tab.count !== undefined && (
                                    <span className={`ml-2 px-2 py-0.5 rounded-full text-xs font-semibold ${
                                        activeTab === tab.id
                                            ? 'bg-purple-100 text-purple-600'
                                            : 'bg-purple-300/50 text-purple-800'
                                    }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Tab Content */}
                <div className="bg-white rounded-b-xl shadow-2xl p-8 min-h-[600px] border border-purple-100">
                    {activeTab === 'journals' && (
                        <JournalTab 
                            roomId={roomId}
                            journalEntries={journalEntries}
                            setJournalEntries={setJournalEntries}
                            userRole={user?.role}
                        />
                    )}
                    {activeTab === 'messages' && (
                        <MessageTab 
                            roomId={roomId}
                            userRole={user?.role}
                        />
                    )}
                    {activeTab === 'mood' && (
                        <MoodTab 
                            roomId={roomId}
                            userRole={user?.role}
                        />
                    )}
                    {activeTab === 'resources' && (
                        <ResourceTab 
                            roomId={roomId}
                            userRole={user?.role}
                        />
                    )}
                </div>
            </main>
        </div>
    );
}
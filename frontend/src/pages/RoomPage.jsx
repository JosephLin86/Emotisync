import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getJournal } from '../services/roomService';
import api from '../services/api';

export default function RoomPage() {
    const { roomId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [activeTab, setActiveTab] = useState('journal');
    const [room, setRoom] = useState(null);
    const [journalEntries, setJournalEntries] = useState([]);
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    // Form states
    const [newJournalEntry, setNewJournalEntry] = useState('');
    const [newMessage, setNewMessage] = useState('');
    const [submitting, setSubmitting] = useState(false);

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
            const journalResponse = await getJournal(roomId);
            setJournalEntries(journalResponse);
            
            // Set messages from room data
            setMessages(roomResponse.data.messages || []);
            
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load room');
            setLoading(false);
        }
    };

    const handleAddJournalEntry = async (e) => {
        e.preventDefault();
        if (!newJournalEntry.trim()) return;

        try {
            setSubmitting(true);
            const response = await api.post(`/api/room/${roomId}/journal`, {
                content: newJournalEntry
            });
            
            // Add new entry to the list
            setJournalEntries([...journalEntries, response.data]);
            setNewJournalEntry('');
            setSubmitting(false);
        } catch (err) {
            console.error('Failed to add journal entry:', err);
            setSubmitting(false);
        }
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        if (!newMessage.trim()) return;

        try {
            setSubmitting(true);
            // TODO: Implement message endpoint
            alert('Message endpoint not yet implemented');
            setNewMessage('');
            setSubmitting(false);
        } catch (err) {
            console.error('Failed to send message:', err);
            setSubmitting(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-xl text-gray-600">Loading room...</div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-xl text-red-600 mb-4">{error}</div>
                    <button
                        onClick={() => navigate('/dashboard')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                    >
                        Back to Dashboard
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-5xl mx-auto px-4">
                {/* Header */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Therapy Room
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {user?.role === 'therapist' 
                                    ? `Client: ${room?.clientId?.username}` 
                                    : `Therapist: ${room?.therapistId?.username}`}
                            </p>
                        </div>
                        <button
                            onClick={() => navigate(user?.role === 'therapist' ? '/dashboard/therapist' : '/dashboard/client')}
                            className="px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                        >
                            ← Back to Dashboard
                        </button>
                    </div>
                </div>

                {/* Tabs */}
                <div className="bg-white rounded-xl shadow-sm mb-6">
                    <div className="border-b border-gray-200">
                        <nav className="flex -mb-px">
                            <button
                                onClick={() => setActiveTab('journal')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'journal'
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                📖 Journal ({journalEntries.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('messages')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'messages'
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                💬 Messages ({messages.length})
                            </button>
                            <button
                                onClick={() => setActiveTab('resources')}
                                className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${
                                    activeTab === 'resources'
                                        ? 'border-indigo-600 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                            >
                                📁 Resources ({room?.resources?.length || 0})
                            </button>
                        </nav>
                    </div>

                    {/* Tab Content */}
                    <div className="p-6">
                        {/* Journal Tab */}
                        {activeTab === 'journal' && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-gray-900">Shared Journal</h2>
                                
                                {/* Journal Entry Form */}
                                <form onSubmit={handleAddJournalEntry} className="bg-gray-50 rounded-lg p-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        New Entry
                                    </label>
                                    <textarea
                                        value={newJournalEntry}
                                        onChange={(e) => setNewJournalEntry(e.target.value)}
                                        placeholder="Write your journal entry here..."
                                        rows="4"
                                        className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                    />
                                    <div className="mt-3 flex justify-end">
                                        <button
                                            type="submit"
                                            disabled={submitting || !newJournalEntry.trim()}
                                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                                        >
                                            {submitting ? 'Adding...' : 'Add Entry'}
                                        </button>
                                    </div>
                                </form>

                                {/* Journal Entries List */}
                                <div className="space-y-4">
                                    {journalEntries.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500">
                                            No journal entries yet. Start writing!
                                        </div>
                                    ) : (
                                        journalEntries.map((entry, index) => (
                                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
                                                <div className="flex items-start justify-between mb-3">
                                                    <div className="flex items-center gap-2">
                                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                                                            entry.author?.role === 'therapist'
                                                                ? 'bg-purple-100 text-purple-700'
                                                                : 'bg-blue-100 text-blue-700'
                                                        }`}>
                                                            {entry.author?.role === 'therapist' ? 'Therapist' : 'Client'}
                                                        </span>
                                                        <span className="text-sm font-medium text-gray-900">
                                                            {entry.author?.username}
                                                        </span>
                                                    </div>
                                                    <span className="text-xs text-gray-500">
                                                        {new Date(entry.createdAt).toLocaleDateString('en-US', {
                                                            month: 'short',
                                                            day: 'numeric',
                                                            year: 'numeric',
                                                            hour: '2-digit',
                                                            minute: '2-digit'
                                                        })}
                                                    </span>
                                                </div>
                                                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                                                    {entry.content}
                                                </p>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Messages Tab */}
                        {activeTab === 'messages' && (
                            <div className="space-y-6">
                                <h2 className="text-2xl font-bold text-gray-900">Messages</h2>
                                
                                {/* Message Form */}
                                <form onSubmit={handleSendMessage} className="bg-gray-50 rounded-lg p-4">
                                    <div className="flex gap-3">
                                        <input
                                            type="text"
                                            value={newMessage}
                                            onChange={(e) => setNewMessage(e.target.value)}
                                            placeholder="Type your message..."
                                            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        />
                                        <button
                                            type="submit"
                                            disabled={submitting || !newMessage.trim()}
                                            className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 text-white rounded-lg font-medium transition-colors"
                                        >
                                            Send
                                        </button>
                                    </div>
                                </form>

                                {/* Messages List */}
                                <div className="space-y-3">
                                    {messages.length === 0 ? (
                                        <div className="text-center py-12 text-gray-500">
                                            No messages yet. Start the conversation!
                                        </div>
                                    ) : (
                                        messages.map((message, index) => (
                                            <div key={index} className="flex items-start gap-3">
                                                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                                                    <span className="text-sm font-semibold text-indigo-600">
                                                        {message.sender?.username?.charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                                <div className="flex-1 bg-white border border-gray-200 rounded-lg p-3">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <span className="text-sm font-semibold text-gray-900">
                                                            {message.sender?.username}
                                                        </span>
                                                        <span className="text-xs text-gray-500">
                                                            {new Date(message.timestamp).toLocaleTimeString('en-US', {
                                                                hour: '2-digit',
                                                                minute: '2-digit'
                                                            })}
                                                        </span>
                                                    </div>
                                                    <p className="text-gray-700">{message.text}</p>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Resources Tab */}
                        {activeTab === 'resources' && (
                            <div className="space-y-6">
                                <div className="flex items-center justify-between">
                                    <h2 className="text-2xl font-bold text-gray-900">Resources</h2>
                                    <button className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-medium">
                                        + Add Resource
                                    </button>
                                </div>
                                
                                {/* Resources List */}
                                <div className="space-y-3">
                                    {(!room?.resources || room.resources.length === 0) ? (
                                        <div className="text-center py-12 text-gray-500">
                                            No resources yet. Upload files to share!
                                        </div>
                                    ) : (
                                        room.resources.map((resource, index) => (
                                            <div key={index} className="bg-white border border-gray-200 rounded-lg p-4 flex items-center justify-between hover:shadow-md transition-shadow">
                                                <div className="flex items-center gap-3">
                                                    <div className="p-2 bg-gray-100 rounded">
                                                        <span className="text-2xl">
                                                            {resource.type === 'pdf' && '📄'}
                                                            {resource.type === 'link' && '🔗'}
                                                            {resource.type === 'audio' && '🎵'}
                                                            {resource.type === 'video' && '🎥'}
                                                            {resource.type === 'image' && '🖼️'}
                                                        </span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">{resource.url}</p>
                                                        <p className="text-xs text-gray-500">
                                                            Uploaded {new Date(resource.uploadedAt).toLocaleDateString()}
                                                        </p>
                                                    </div>
                                                </div>
                                                <button className="text-indigo-600 hover:text-indigo-700 font-medium">
                                                    View
                                                </button>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
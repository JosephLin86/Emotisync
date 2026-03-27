// pages/RoomPage.jsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getJournal } from '../services/roomService';
import JournalTab from '../components/room/JournalTab';
import api from '../services/api';

export default function RoomPage() {
    const { roomId } = useParams();
    const { user } = useAuth();
    const navigate = useNavigate();

    const [room, setRoom] = useState(null);
    const [journalEntries, setJournalEntries] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

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
            
            setLoading(false);
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to load room');
            setLoading(false);
        }
    };

    // Loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-xl text-gray-600">Loading room...</div>
                </div>
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
                        onClick={() => navigate(user?.role === 'therapist' ? '/dashboard/therapist' : '/dashboard/client')}
                        className="px-6 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 font-medium"
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
                            <p className="text-gray-600 mt-1 flex items-center gap-2">
                                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                {user?.role === 'therapist' 
                                    ? `Client: ${room?.clientId?.username}` 
                                    : `Therapist: ${room?.therapistId?.username}`}
                            </p>
                        </div>
                        <button
                            onClick={() => navigate(user?.role === 'therapist' ? '/dashboard/therapist' : '/dashboard/client')}
                            className="px-6 py-2.5 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium"
                        >
                            ← Back
                        </button>
                    </div>
                </div>

                {/* Content - Just Journal for now */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <JournalTab 
                        roomId={roomId}
                        journalEntries={journalEntries}
                        setJournalEntries={setJournalEntries}
                        userRole={user?.role}
                    />
                </div>
            </div>
        </div>
    );
}
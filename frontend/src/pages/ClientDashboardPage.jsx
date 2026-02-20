import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getMyRoom, getJournal } from '../services/roomService';
import api from '../services/api';

export default function ClientDashboardPage() {
    const [room, setRoom] = useState(null);
    const [journalEntry, setJournalEntry ] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showId, setShowId] = useState(false);

    const { user, logout } = useAuth();
    const navigate = useNavigate();


    useEffect(() => {
        fetchClientRoom();
    }, []);


    const fetchClientRoom = async () => {
        try{
            setLoading(true);

            //get the client's room
            const roomData = await getMyRoom();
            setRoom(roomData);

            //get journal entries from the room
            if(roomData._id){
                const journalData = await getJournal(roomData._id);
                setJournalEntry(journalData);
            }

            setLoading(false);
        } catch (err){

            if(err.response?.status === 404){
                setRoom(null);
                setLoading(false);
            }
            else{
                setError(err.message || 'Failed to Load Dashboard');
                setLoading(false);
            }
            
        };

    }

    const handleLogout = async () => {
            await logout();
            navigate('/login');
        };

    const handleEnterRoom = () => {
        if(room){
            navigate(`/rooms/${room._id}`);
        }
    }; 

    //loading state
    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50"> 
                <div className="text-center">
                    <div className="text-xl text-gray-600">Loading your dashboard...</div>
                </div>
            </div>
        );
    }


    //error state
    if(error) {
        return(
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-xl text-red-600 mb-4">{error}</div>
                    <button
                        onClick={() => navigate('/login')}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    //no room assigned yet
    // if(!room) {
    //     return(
    //         <div className="min-h-screen bg-gray-50 py-8">
    //             <div className="max-w-4xl mx-auto px-4">
    //                 <div className="bg-white rounded-lg shadow p-6">
    //                     <h1 className="text-2xl font-bold text-gray-900 mb-4">
    //                         Welcome, {user?.username}!
    //                     </h1>
    //                     <div className="text-gray-600 mb-4">
    //                         You don't have a therapy room assigned yet. Please contact your therapist to set up a room.
    //                     </div>
    //                     <button
    //                         onClick={handleLogout}
    //                         className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    //                     >
    //                         Logout
    //                     </button>
    //                 </div>
    //             </div>
    //         </div>
    //     );
    // }

    //Main Dashboard View
    return(
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/*Let's make the header!! */}
                <div className="max-w-6xl mx-auto px-4">
                    {/* Header */}
                    <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                        <div className="flex justify-between items-center">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">
                                    Welcome {user?.username}!
                                </h1>
                                <p className="text-gray-600 mt-1 flex items-center gap-2">
                                    <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                                    Your Therapist: {room?.therapistId?.username || 'Not Assigned'}
                                </p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium cursor-pointer"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                <div className="flex gap-4">
                    {/*header boxes */}
                    {!room ? (
                        <div className="text-center space-y-6">
                            <div>
                                <p className="text-xl font-semibold text-gray-900 mb-4">
                                    No room yet. Wait for your therapist to create a room!
                                </p>
                            </div>
                            <button
                                onClick={() => setShowId(true)}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium cursor-pointer"
                            >
                                get your ID here
                            </button>
                            {showId && (
                                <div className="mt-6 p-6 bg-gray-50 rounded-lg border border-gray-200 relative">
                                    <button
                                        onClick={() => setShowId(false)}
                                        className="absolute top-3 right-3 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                                        aria-label="Close"
                                    >
                                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    <p className="text-sm font-semibold text-gray-700 mb-3">
                                        Your Client ID
                                    </p>
                                    <div className="bg-white p-4 rounded border border-gray-300 font-mono text-sm text-gray-800 break-all">
                                        {user?.id}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-3">
                                        Share this with your therapist to get started
                                    </p>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="min-h-screen bg-gray-50 py-8">

                                {/* Content */}
                                <div className="max-w-4xl mx-auto space-y-6">
                                    {/* Primary Action - Better proportions */}
                                    <div className="bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl shadow-lg p-8 text-white text-center hover:shadow-xl transition-all"
                                        onClick={handleEnterRoom}>
                                        <h2 className="text-2xl font-bold mb-2">Your Therapy Room</h2>
                                        <p className="text-indigo-100 mb-6 text-sm">
                                            Access your shared space with {room?.therapistId?.username || 'your therapist'}
                                        </p>
                                        <button className="inline-flex items-center gap-2 text-lg font-semibold bg-white text-indigo-600 px-6 py-3 rounded-lg hover:bg-indigo-50 transition-all cursor-pointer">
                                            Enter Room
                                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                                            </svg>
                                        </button>
                                    </div>

                                    {/* Stats - More content */}
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-blue-500 hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900">Journal Entries</h3>
                                                <div className="p-2 bg-blue-50 rounded-lg">
                                                    <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="text-4xl font-bold text-blue-600 mb-1">
                                                {room?.sharedJournal?.length || 0}
                                            </div>
                                            <p className="text-gray-600 text-sm">Shared with therapist</p>
                                        </div>

                                        <div className="bg-white rounded-xl shadow-sm p-6 border-l-4 border-purple-500 hover:shadow-md transition-shadow">
                                            <div className="flex items-center justify-between mb-4">
                                                <h3 className="text-lg font-semibold text-gray-900">Messages</h3>
                                                <div className="p-2 bg-purple-50 rounded-lg">
                                                    <svg className="w-5 h-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                                    </svg>
                                                </div>
                                            </div>
                                            <div className="text-4xl font-bold text-purple-600 mb-1">
                                                {room?.messages?.length || 0}
                                            </div>
                                            <p className="text-gray-600 text-sm">Total conversations</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                    )}   
                    </div>
                </div>
            </div>
        </div>
    );
}
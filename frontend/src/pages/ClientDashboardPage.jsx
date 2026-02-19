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
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Welcome {user?.username}!
                            </h1>
                            <p className="text-gray-600 mt-1">
                                Your Therapist: {room?.therapistId?.username || 'Not Assigned'}
                            </p>
                        </div>

                        <button
                            onClick={() => handleLogout()}
                            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors cursor-pointer"
                        >
                            Logout
                        </button>
                        
                    </div>
                    
                </div>
                <div className="flex gap-4">
                    {/*header boxes */}
                    <div className="bg-white rounded-lg shadow p-6 max-w-lg">
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
                            <div>
                                <h2 className="font-semibold text-xl">
                                    Your Room
                                </h2>
                                <div className="flex gap-4 text-sm text-gray-500">
                                    <span>
                                        {room.sharedJournal?.length || 0} Journal Entries
                                    </span>
                                    <span>
                                        {room.messages?.length || 0} Messages
                                    </span>

                                </div>
                            </div>
                        )}

                        
                    </div>
                </div>
            </div>
        </div>
    );
}
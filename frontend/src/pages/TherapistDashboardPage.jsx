import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getTherapistRoom, createRoom } from '../services/roomService';

const TherapistDashboardPage = () =>{
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newClientId, setNewClientId] = useState('');
    const [createError, setCreateError] = useState('');
    const [creating, setCreating] = useState(false);


    const { user, logout } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        fetchRooms();
    }, []);

    const fetchRooms = async() => {
        try{
            setLoading(true);
            const roomsData = await getTherapistRoom();
            setRooms(roomsData);
            setLoading(false);
        } catch(err) {
            setError(err.message || 'Failed to load rooms');
            setLoading(false);
        }
    };

    const handleLogout = async() => {
        await logout();
        navigate('/login');
    };

    const handleEnterRoom = (roomId) => {
        navigate(`/rooms/${roomId}`)
    };

    const handleCreateRoom = async(e) => {
        e.preventDefault();

        if(!newClientId.trim()) {
            setCreateError('Client ID is required');
            return;
        }

        try{
            setCreating(true);
            setCreateError('');

            await createRoom(newClientId.trim());

            //fetch and refresh room list after created
            await fetchRooms();

            //close modal and reset?
            setShowCreateModal(false);
            setNewClientId('');
            setCreating(false);

        } catch (err) {
            setCreatingError(err.message || 'Failed to create room');
            setCreating(false);
        }

    };
    //write out the loading state
    if(loading){
        return(
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-xl text-gray-600">
                        Loading Your Dashboard...
                    </div>
                </div>
            </div>
        );
    }

    //Error State
    if(error){
        return(
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="text-xl text-red-600 mb-4">
                        {error}
                    </div>
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

    //Main Dashboard View:
    return(
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-6xl mx-auto px-4">
                {/*Header*/}
                <div className="bg-white rounded-lg shadow p-6 mb-6">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Welcome Dr. {user?.username}!
                            </h1>
                            <p className="text-gray-600 mt-1">
                                {rooms.length} active client {rooms.length === 1 ? "rooms": "rooms"}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"    
                            >
                                + New Room
                            </button>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors cursor-pointer"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
                
                {/*Rooms List */}
                <div className="bg-white rounded-lg shadow p-6">
                    <h2 className="text-xl font-semibold text-gray-900 mb-4">
                        Your Client Rooms
                    </h2>
                    {rooms.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-gray-500 mb-4">
                                No client rooms yet. Create your first room to get started!
                            </div>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium cursor-pointer"
                            >
                                Create First Room
                            </button>
                        </div>

                    ) : (
                        <div className="space-y-4">
                            {rooms.map((room) => (
                                <div
                                    key={room._id}
                                    classname="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-center">
                                        <div className="flex-1">
                                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                                                {room.clientId?.username || 'Unknown Client'}
                                            </h3>
                                            <p className="text-gray-600 text-sm mb-2">
                                                {room.clientId?.email || 'No Email'}
                                            </p>
                                            <div className="flex gap-4 text-sm text-gray-500">
                                                <span>
                                                    {room.sharedJournal?.length || 0} Journal Entries
                                                </span>
                                                <span>
                                                    {room.messages?.length || 0} Messages
                                                </span>
                                                <span>
                                                    Created: {new Date(room.createdAt).toLocaleDateString()}
                                                </span>
                                            </div>
                                        </div>
                                        <button
                                            onClick={() => handleEnterRoom(room._id)}
                                            className="px-6 py-3 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium ml-4"
                                        >
                                            Enter Room
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
            {/*create room modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold text-gray-900 mb-4">
                            Create New Room
                        </h2>
                        <form onSubmit={handleCreateRoom}>
                            <div className="mb-4">
                                <label className="block text-gray-700 font-medium mb-2">
                                    Client Id
                                </label>
                                <input
                                    type="text"
                                    value={newClientId}
                                    onChange={(e) => setNewClientId(e.target.value)}
                                    placeholder="Enter client's user ID"
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                                <p className="text-gray-500 text-sm mt-1">
                                    You'll need the client's MongoDB user ID to create a room
                                </p>
                            </div>
                            {createError && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
                                    {createError}
                                </div>
                            )}

                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => {
                                        setShowCreateModal(false);
                                        setNewClientId('');
                                        setCreateError('');
                                    }}
                                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors disabled:opacity-50"
                                >
                                    {creating ? 'Creating...' : 'Create Room'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
export default TherapistDashboardPage;
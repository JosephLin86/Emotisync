import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { io } from 'socket.io-client';
import api from '../../services/api';
// At the top
const getBackendURL = () => {
    if (import.meta.env.PROD) {
        return import.meta.env.VITE_BACKEND_URL || 'https://emotisync-api.onrender.com';
    }
    return import.meta.env.VITE_BACKEND_URL || 'http://localhost:5001';
};

const BACKEND_URL = getBackendURL();

export default function MessageTab({ roomId }) {
    const { user } = useAuth();
    const [messages, setMessages] = useState([]);
    const [newMessage, setNewMessage] = useState('');
    const [socket, setSocket] = useState(null);
    const [isTyping, setIsTyping] = useState(false);
    const [typingUser, setTypingUser] = useState('');
    const [loading, setLoading] = useState(true);
    const messagesEndRef = useRef(null);
    const typingTimeoutRef = useRef(null);

    
    // Initialize Socket.io connection
    useEffect(() => {
        const newSocket = io(BACKEND_URL);
        setSocket(newSocket);

        // Join the room
        newSocket.emit('join_room', {
            roomId,
            userId: user.id,
            username: user.username
        });

        // Listen for messages
        newSocket.on('receive_message', (message) => {
            setMessages((prev) => [...prev, message]);
        });

        // Listen for typing indicators
        newSocket.on('user_typing', ({ username }) => {
            setTypingUser(username);
            setIsTyping(true);
        });

        newSocket.on('user_stop_typing', () => {
            setIsTyping(false);
            setTypingUser('');
        });

        // Cleanup on unmount
        return () => {
            newSocket.emit('leave_room', {
                roomId,
                userId: user.id,
                username: user.username
            });
            newSocket.close();
        };
    }, [roomId, user]);

    // Fetch message history
    useEffect(() => {
        const fetchMessages = async () => {
            try {
                setLoading(true);
                const response = await api.get(`/api/room/${roomId}/messages`);
                setMessages(response.data);
                setLoading(false);
            } catch (err) {
                console.error('Failed to fetch messages:', err);
                setLoading(false);
            }
        };

        fetchMessages();
    }, [roomId]);

    // Auto-scroll to bottom when new message arrives
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const handleTyping = () => {
        if (!socket) return;

        socket.emit('typing', { roomId, username: user.username });

        // Clear previous timeout
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Stop typing after 2 seconds of inactivity
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('stop_typing', { roomId });
        }, 2000);
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();

        if (!newMessage.trim() || !socket) return;

        const messageData = {
            roomId,
            senderId: user.id,
            senderName: user.username,
            text: newMessage.trim(),
            timestamp: new Date()
        };

        // Send via Socket.io for real-time delivery
        socket.emit('send_message', messageData);

        // Save to database
        try {
            await api.post(`/api/room/${roomId}/messages`, { text: newMessage.trim() });
        } catch (err) {
            console.error('Failed to save message:', err);
        }

        // Clear input
        setNewMessage('');

        // Stop typing indicator
        socket.emit('stop_typing', { roomId });
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-16">
                <div className="w-12 h-12 border-4 border-purple-300 border-t-purple-600 rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex flex-col h-[600px]">
            {/* Messages Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50 rounded-t-lg">
                {messages.length === 0 ? (
                    <div className="text-center py-16">
                        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No messages yet</h3>
                        <p className="text-gray-600">Start the conversation!</p>
                    </div>
                ) : (
                    messages.map((message, index) => {
                        const isOwnMessage = message.senderId === user.id;
                        return (
                            <div
                                key={message._id || index}
                                className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                            >
                                <div
                                    className={`max-w-[70%] rounded-lg px-4 py-2 ${
                                        isOwnMessage
                                            ? 'bg-purple-600 text-white'
                                            : 'bg-white text-gray-900 border border-gray-200'
                                    }`}
                                >
                                    {!isOwnMessage && (
                                        <div className="text-xs font-semibold mb-1 text-purple-600">
                                            {message.senderName}
                                        </div>
                                    )}
                                    <div className="break-words">{message.text}</div>
                                    <div className={`text-xs mt-1 ${isOwnMessage ? 'text-purple-200' : 'text-gray-500'}`}>
                                        {new Date(message.timestamp).toLocaleTimeString([], {
                                            hour: '2-digit',
                                            minute: '2-digit'
                                        })}
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Typing Indicator */}
            {isTyping && (
                <div className="px-4 py-2 bg-gray-50 text-sm text-gray-600 italic">
                    {typingUser} is typing...
                </div>
            )}

            {/* Message Input */}
            <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-gray-200 rounded-b-lg">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => {
                            setNewMessage(e.target.value);
                            handleTyping();
                        }}
                        placeholder="Type a message..."
                        className="flex-1 px-4 py-3 border-2 border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <button
                        type="submit"
                        disabled={!newMessage.trim()}
                        className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer inline-flex items-center gap-2"
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Send
                    </button>
                </div>
            </form>
        </div>
    );
}
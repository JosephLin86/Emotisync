const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/room');
const journalRoutes = require('./routes/journal');
const resourceRoutes = require('./routes/resources');
const messageRoutes = require('./routes/messages');

const app = express();

// Create HTTP server
const server = http.createServer(app);

// Configure Socket.io with CORS
const io = new Server(server, {
    cors: {
        origin: 'http://localhost:5173', // Your frontend URL
        methods: ['GET', 'POST'],
        credentials: true
    }
});

// Middleware - UPDATE THIS PART
app.use(cors({
    origin: 'http://localhost:5173', // Your frontend URL
    credentials: true
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/room', roomRoutes);
app.use('/api/journal', journalRoutes);
app.use('/api/room', resourceRoutes);
app.use('/api/room', messageRoutes);

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('MongoDB connected successfully'))
    .catch((err) => console.error('MongoDB connection error:', err));

// Socket.io Connection Handling
const userSockets = new Map();

io.on('connection', (socket) => {
    console.log('User connected:', socket.id);

    socket.on('join_room', ({ roomId, userId, username }) => {
        socket.join(roomId);
        userSockets.set(userId, socket.id);
        console.log(`${username} joined room ${roomId}`);
        socket.to(roomId).emit('user_joined', { username });
    });

    socket.on('send_message', async (messageData) => {
        const { roomId, senderId, senderName, text, timestamp } = messageData;
        io.to(roomId).emit('receive_message', {
            senderId,
            senderName,
            text,
            timestamp,
            _id: Date.now().toString()
        });
    });

    socket.on('typing', ({ roomId, username }) => {
        socket.to(roomId).emit('user_typing', { username });
    });

    socket.on('stop_typing', ({ roomId }) => {
        socket.to(roomId).emit('user_stop_typing');
    });

    socket.on('leave_room', ({ roomId, userId, username }) => {
        socket.leave(roomId);
        userSockets.delete(userId);
        console.log(`${username} left room ${roomId}`);
        socket.to(roomId).emit('user_left', { username });
    });

    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
        for (let [userId, socketId] of userSockets.entries()) {
            if (socketId === socket.id) {
                userSockets.delete(userId);
                break;
            }
        }
    });
});

// Start server with Socket.io
const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
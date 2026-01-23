require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');
const journalRoutes = require('./routes/journal');
const roomRoutes = require('./routes/room');

//initializes express app
const app = express();
//middleware chain begins
app.use(express.json());

app.use(cors({
    origin: true,  // Allow any origin (like default)
    credentials: true  // But still allow credentials
}));
app.use(helmet());

app.use('/api/protected', protectedRoutes);
app.use(cookieParser()); //for refresh in auth
//route mounting: goes to routes/auth.js when req starts with /api/auth
//Example: POST /api/auth/register passed to router.post('/register', registerUser);
app.use('/api/auth', authRoutes);

app.use('/api/journal', journalRoutes);
app.use('/api/room', roomRoutes);

//simple test route
app.get('/', (req, res) => {
    res.send('EmotiSync backend is running!');
});



const PORT = process.env.PORT || 5000;

mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        app.listen(PORT, () => {
            console.log(`Server is running on port ${PORT}`);
        });
        console.log('Connected to MongoDB');
    })
    .catch((err) => {
        console.error('MongoDB connection error:', err);
    });


require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');
const protectedRoutes = require('./routes/protected');

//initializes express app
const app = express();
//middleware chain begins
app.use(express.json());

app.use(cors());
app.use(helmet());
app.use('/api/protected', protectedRoutes);
//route mounting: goes to routes/auth.js when req starts with /api/auth
//Example: POST /api/auth/register passed to router.post('/register', registerUser);
app.use('/api/auth', authRoutes);


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


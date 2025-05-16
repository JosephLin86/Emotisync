require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const mongoose = require('mongoose');
const authRoutes = require('./routes/auth');

const app = express();

app.use(express.json());
app.use(cors());
app.use(helmet());

//simple test route
app.get('/', (req, res) => {
    res.send('EmotiSync backend is running!');
});

const PORT = process.env.PORT || 5000;

app.use('/api/auth', authRoutes);

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


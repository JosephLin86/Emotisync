const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const router = express.Router();

//register a new user route
router.post('/register', async (req, res) => {
    try {
        const { username, email, password, role } = req.body;
        
        //check if user already exists
        const existingUser = await User.findOne({email});
        if(existingUser) return res.status(400).json({message: 'Email already in use'});

        //hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        //create new user
        const user = new User({username, email, password: hashedPassword, role});
        await user.save();

        res.status(201).json({message: 'User registered successfully'});
        
    } catch (error) {
        res.status(400).json({message: 'Registration failed', error: error.message});
    }
});

//login route
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        //check if user exists
        const user = await User.findOne({email});
        if(!user) return res.status(400).json({error: 'Invalid credentials'});

        //check password
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) return res.status(400).json({error: 'Invalid credentials'});

        //Create JWT
        const accessToken = jwt.sign(
            { id: user._id, role: user.role}, 
            process.env.JWT_SECRET, 
            {expiresIn: '2h'}
        );

        const refreshToken = jwt.sign(
            {id: user._id},
            process.env.JWT_REFRESH,
            {expiresIn: '7d'}
        );

        //store refresh token in database
        user.refreshToken = refreshToken;
        await user.save();

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== 'production',
            maxAge: 7 * 24 * 60 * 60 * 1000,
            sameSite: 'Strict',
        });

        res.json({
            token: accessToken, 
            user: {
                id: user._id, 
                username: user.username, 
                email: user.email, 
                role: user.role}
        });
        
    } catch (error) {
        res.status(400).json({message: 'Login failed', error: error.message});
    }
});

//Refresh token route
router.post('/refresh', async (req, res) => {
    const refreshToken = req.cookies.refreshToken;
    if(!refreshToken) return res.status(401).json({error: 'No refresh token provided'});
    
    try {
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH);

        const newAccessToken = jwt.sign(
            {id: decoded.id},
            process.env.JWT_SECRET,
            {expiresIn: '2h'}
        );

        res.json({token: newAccessToken});
    } catch (error) {
        res.status(401).json({error: 'Invalid or expired refresh token'});
    }
});

//Logout route
router.post('/logout', async (req, res) => {
    const {refreshToken} = req.body;

    try {
        res.clearCookie('refreshToken');
        res.json({message: 'Logged out successfully'});
        
    } catch (error) {
        res.status(400).json({message: 'Logout failed', error: error.message});
    }
});
module.exports = router;
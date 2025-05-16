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
        const token = jwt.sign(
            { id: user._id, role: user.role}, 
            process.env.JWT_SECRET, 
            {expiresIn: '2h'}
        );

        res.json({
            token, 
            user: {id: user._id, username: user.username, email: user.email, role: user.role}
        });
        
    } catch (error) {
        res.status(400).json({message: 'Login failed', error: error.message});
    }
});

module.exports = router;
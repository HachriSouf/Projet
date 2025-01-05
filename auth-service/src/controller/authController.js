const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Register a new user
exports.register = async (req, res) => {
    const { username, password, email } = req.body;

    // Validate the input
    if (!username || !password || !email) {
        return res.status(400).json({ message: 'All fields are required' });
    }

    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        // Create a new user without hashing the password
        const newUser = new User({
            username,
            email,
            password  // Store the password as plain text
        });

        // Generate refresh token
        const refreshToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // Save the refresh token in the user document
        newUser.refreshToken = refreshToken;

        // Save the new user in the database
        await newUser.save();

        // Create access token (short-lived)
        const accessToken = jwt.sign({ userId: newUser._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Send the tokens to the client
        res.status(201).json({ message: 'User created successfully', accessToken, refreshToken });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};


exports.login = async (req, res) => {
    const { email, password } = req.body;

    try {
        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        // Compare the entered password with the stored password (plain text)
        if (password !== user.password) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // Generate access token (short-lived)
        const accessToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        // Generate refresh token (longer-lived)
        const refreshToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, { expiresIn: '7d' });

        // Store the refresh token in the user document
        user.refreshToken = refreshToken;
        await user.save();

        // Send the tokens to the client
        res.status(200).json({ accessToken, refreshToken });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error' });
    }
};

exports.verify = async (req, res) => {
    const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];
    console.log(token);
    if (!token) {
        return res.status(401).json({ message: 'No token provided' });
    }

    try {
        // Verify the token using JWT
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Find the user based on the decoded userId
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        res.status(200).json({ message: 'User authenticated', user });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Invalid token' });
    }
};

exports.logout = async (req, res) => {
    const { refreshToken } = req.body;

    try {
        const user = await User.findOne({ refreshToken });
        if (!user) {
            return res.status(400).json({ message: 'Invalid refresh token' });
        }

        // Remove refresh token from user document
        user.refreshToken = null;
        await user.save();

        res.status(200).json({ message: 'User logged out successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Failed to log out' });
    }
};

exports.me = async (req, res) => {
    try {
        
        const token = req.header('Authorization') && req.header('Authorization').split(' ')[1];
        if (!token) {
            return res.status(401).json({ message: 'No token provided' });
        }

     
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.userId;

       
        const user = await User.findById(userId).select('-password -refreshToken');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({ user });
    } catch (err) {
        console.error(err);
        res.status(400).json({ message: 'Invalid token or server error' });
    }
};
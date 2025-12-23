import User from '../models/User.js';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { sendWelcomeEmail } from '../utils/mailer.js';

// Register a new user
export const registerUser = async (req, res) => {
    try {
        const { username, email, password, confirmPassword } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ message: 'User with this email or username already exists' });
        }

        // Validate password match
        if (password !== confirmPassword) {
            return res.status(400).json({ message: 'Passwords do not match' });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create new user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            confirmPassword: hashedPassword
        });

        await newUser.save();

        // Generate JWT token
        const token = jwt.sign({ userId: newUser._id, email: newUser.email }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '24h' });

        // Send welcome email
        try {
            await sendWelcomeEmail(newUser.email, {
                username: newUser.username,
                email: newUser.email
            });
        } catch (emailError) {
            console.error('Failed to send welcome email:', emailError);
            // Don't fail registration if email fails
        }

        res.status(201).json({
            message: 'User registered successfully',
            token,
            user: {
                id: newUser._id,
                username: newUser.username,
                email: newUser.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Server error during registration' });
    }
};

// Get user profile
export const getProfile = async (req, res) => {
    try {
        // For admin (hardcoded)
        if (req.user._id === 'admin-123') {
            return res.status(200).json({
                name: req.user.username,
                email: req.user.email
            });
        }

        // For regular users, req.user is already the user object from middleware
        const user = req.user;
        res.status(200).json({
            name: user.username || user.googleDisplayName || 'User',
            email: user.email
        });
    } catch (error) {
        console.error('Profile fetch error:', error);
        res.status(500).json({ message: 'Server error during profile fetch' });
    }
};

// Google Sign-In registration/login
export const googleSignIn = async (req, res) => {
    try {
        const { googleId, email, displayName, photoURL } = req.body;

        // Check if user already exists with this Google ID or email
        let user = await User.findOne({ $or: [{ googleId }, { email }] });

        if (user) {
            // If user exists but doesn't have Google ID, update it
            if (!user.googleId) {
                user.googleId = googleId;
                user.googleDisplayName = displayName;
                user.googlePhotoURL = photoURL;
                await user.save();
            }
        } else {
            // Create new user for Google sign-in
            user = new User({
                email,
                googleId,
                googleDisplayName: displayName,
                googlePhotoURL: photoURL,
                // Set default values for required fields that are not provided by Google
                username: displayName.replace(/\s+/g, '').toLowerCase() + Math.random().toString(36).substr(2, 5)
            });
            await user.save();

            // Send welcome email for new Google sign-in users
            try {
                await sendWelcomeEmail(user.email, {
                    username: user.username,
                    displayName: user.googleDisplayName,
                    email: user.email
                });
            } catch (emailError) {
                console.error('Failed to send welcome email for Google sign-in:', emailError);
                // Don't fail sign-in if email fails
            }
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id, email: user.email }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({
            message: 'Google sign-in successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                googleDisplayName: user.googleDisplayName,
                googlePhotoURL: user.googlePhotoURL,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Google sign-in error:', error);
        res.status(500).json({ message: 'Server error during Google sign-in' });
    }
};




// Login user (regular user login)
export const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET , { expiresIn: '1h' });

        res.status(200).json({
            message: 'Login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Server error during login' });
    }
};

// Admin login
export const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Simple hardcoded admin credentials for demo purposes
        if (email === 'admin@admin.com' && password === 'admin123') {
            // Generate JWT token for admin
            const token = jwt.sign({
                userId: 'admin-123',
                email: email,
                role: 'admin'
            }, process.env.JWT_SECRET || 'fallback-secret', { expiresIn: '24h' });

            res.status(200).json({
                message: 'Admin login successful',
                token,
                user: {
                    id: 'admin-123',
                    username: 'Admin',
                    email: email,
                    role: 'admin'
                }
            });
            return;
        }

        // Fallback to database check for other admin users (if any)
        const user = await User.findOne({ email });
        if (!user) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        // Check if user is admin
        if (user.role !== 'admin') {
            return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
        }

        // Generate JWT token
        const token = jwt.sign({ userId: user._id, email: user.email, role: user.role }, process.env.JWT_SECRET , { expiresIn: '1h' });

        res.status(200).json({
            message: 'Admin login successful',
            token,
            user: {
                id: user._id,
                username: user.username,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Admin login error:', error);
        res.status(500).json({ message: 'Server error during admin login' });
    }
};

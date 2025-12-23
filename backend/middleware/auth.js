import jwt from 'jsonwebtoken';
import User from '../models/User.js';

export const authenticateToken = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        if (!token) {
            return res.status(401).json({ message: 'Access denied. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret');

        // Handle hardcoded admin credentials
        if (decoded.userId === 'admin-123' && decoded.role === 'admin') {
            req.user = {
                _id: 'admin-123',
                email: decoded.email,
                role: 'admin',
                username: 'Admin'
            };
            return next();
        }

        // For regular users, check database
        const user = await User.findById(decoded.userId);
        if (!user) {
            return res.status(401).json({ message: 'Invalid token.' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid token.' });
    }
};

export const requireAdmin = (req, res, next) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
    }
    next();
};

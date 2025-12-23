import UserRequest from '../models/UserRequest.js';
import Destination from '../models/Destination.js';
import { v2 as cloudinary } from 'cloudinary';

// Create a new user request
export const createUserRequest = async (req, res) => {
    try {
        const { name, landscape, description, rating, price, duration, popular } = req.body;

        // Validate required fields
        if (!name || !landscape || !description || !rating || !price || !duration) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if file is uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'Image is required' });
        }

        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'user-requests',
            public_id: `${Date.now()}-${req.file.originalname}`,
            resource_type: 'auto'
        });

        // Create new user request
        const newRequest = new UserRequest({
            user: req.user.id, // from auth middleware
            name,
            landscape,
            description,
            image: result.secure_url,
            rating: parseFloat(rating),
            price: parseFloat(price),
            duration,
            popular: popular === 'true' || popular === true
        });

        await newRequest.save();

        res.status(201).json({
            message: 'Request submitted successfully',
            request: newRequest
        });
    } catch (error) {
        console.error('Create user request error:', error);
        res.status(500).json({ message: 'Server error creating request' });
    }
};

// Get all user requests (admin only)
export const getAllUserRequests = async (req, res) => {
    try {
        const requests = await UserRequest.find().sort({ createdAt: -1 });
        res.status(200).json({
            message: 'Requests retrieved successfully',
            requests
        });
    } catch (error) {
        console.error('Get user requests error:', error);
        res.status(500).json({ message: 'Server error retrieving requests' });
    }
};

// Approve a user request (admin only)
export const approveUserRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const request = await UserRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'Request has already been processed' });
        }

        // Create destination from request
        const newDestination = new Destination({
            name: request.name,
            landscape: request.landscape,
            description: request.description,
            image: request.image,
            rating: request.rating,
            price: request.price,
            duration: request.duration,
            popular: request.popular
        });

        await newDestination.save();

        // Update request status
        request.status = 'approved';
        await request.save();

        res.status(200).json({
            message: 'Request approved and destination added successfully',
            destination: newDestination
        });
    } catch (error) {
        console.error('Approve user request error:', error);
        res.status(500).json({ message: 'Server error approving request' });
    }
};

// Reject a user request (admin only)
export const rejectUserRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const request = await UserRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'Request has already been processed' });
        }

        // Update request status
        request.status = 'rejected';
        await request.save();

        res.status(200).json({ message: 'Request rejected successfully' });
    } catch (error) {
        console.error('Reject user request error:', error);
        res.status(500).json({ message: 'Server error rejecting request' });
    }
};

// Edit a user request (admin only)
export const editUserRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { name, landscape, description, rating, price, duration, popular } = req.body;

        const request = await UserRequest.findById(requestId);
        if (!request) {
            return res.status(404).json({ message: 'Request not found' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ message: 'Cannot edit processed request' });
        }

        // Update request
        request.name = name || request.name;
        request.landscape = landscape || request.landscape;
        request.description = description || request.description;
        request.rating = rating ? parseFloat(rating) : request.rating;
        request.price = price ? parseFloat(price) : request.price;
        request.duration = duration || request.duration;
        request.popular = popular !== undefined ? (popular === 'true' || popular === true) : request.popular;

        await request.save();

        res.status(200).json({
            message: 'Request updated successfully',
            request
        });
    } catch (error) {
        console.error('Edit user request error:', error);
        res.status(500).json({ message: 'Server error updating request' });
    }
};

// Get user requests for the authenticated user
export const getUserRequests = async (req, res) => {
    try {
        const requests = await UserRequest.find({ user: req.user.id }).sort({ createdAt: -1 });
        res.status(200).json({
            message: 'Requests retrieved successfully',
            requests
        });
    } catch (error) {
        console.error('Get user requests error:', error);
        res.status(500).json({ message: 'Server error retrieving requests' });
    }
};

// Multer upload configuration
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/user-requests';
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed'), false);
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

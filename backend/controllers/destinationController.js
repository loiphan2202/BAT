import Destination from '../models/Destination.js';
import mongoose from 'mongoose';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { v2 as cloudinary } from 'cloudinary';

// Configure multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const uploadDir = 'uploads/destinations/';
        // Create directory if it doesn't exist
        if (!fs.existsSync(uploadDir)) {
            fs.mkdirSync(uploadDir, { recursive: true });
        }
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        // Generate unique filename
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
    }
});

// File filter to allow only images
const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Only image files are allowed!'), false);
    }
};

export const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB limit
    }
});

// Get all destinations
export const getAllDestinations = async (req, res) => {
    try {
        const destinations = await Destination.find().sort({ createdAt: -1 });
        res.status(200).json({
            message: 'Destinations retrieved successfully',
            destinations
        });
    } catch (error) {
        console.error('Get destinations error:', error);
        res.status(500).json({ message: 'Server error retrieving destinations' });
    }
};

// Get destination by ID
export const getDestinationById = async (req, res) => {
    try {
        const { id } = req.params;
        const destination = await Destination.findById(id);

        if (!destination) {
            return res.status(404).json({ message: 'Destination not found' });
        }

        res.status(200).json({
            message: 'Destination retrieved successfully',
            destination
        });
    } catch (error) {
        console.error('Get destination error:', error);
        res.status(500).json({ message: 'Server error retrieving destination' });
    }
};

// Create new destination
export const createDestination = async (req, res) => {
    try {
        const { name, landscape, description, rating, price, duration, popular } = req.body;

        // Validate required fields
        if (!name || !landscape || !description || !rating || !price || !duration) {
            return res.status(400).json({ message: 'All required fields must be provided' });
        }

        // Check if image was uploaded
        if (!req.file) {
            return res.status(400).json({ message: 'Image is required' });
        }

        // Upload image to Cloudinary
        const result = await cloudinary.uploader.upload(req.file.path, {
            folder: 'destinations',
            use_filename: true,
            unique_filename: false,
        });

        // Create new destination
        const newDestination = new Destination({
            name: name.trim(),
            landscape,
            description,
            image: result.secure_url,
            rating: parseFloat(rating),
            price: parseInt(price),
            duration: duration.trim(),
            popular: popular === 'true' || popular === true
        });

        await newDestination.save();

        // Delete the temporary file from local storage
        fs.unlinkSync(req.file.path);

        res.status(201).json({
            message: 'Destination created successfully',
            destination: newDestination
        });
    } catch (error) {
        console.error('Create destination error:', error);
        res.status(500).json({ message: 'Server error creating destination' });
    }
};

// Update destination
export const updateDestination = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, landscape, description, rating, price, duration, popular } = req.body;

        const updateData = {};
        if (name) updateData.name = name.trim();
        if (landscape) updateData.landscape = landscape;
        if (description) updateData.description = description;
        if (rating) updateData.rating = parseFloat(rating);
        if (price) updateData.price = parseInt(price);
        if (duration) updateData.duration = duration.trim();
        if (popular !== undefined) updateData.popular = popular === 'true' || popular === true;

        // Handle image update
        if (req.file) {
            // Upload new image to Cloudinary
            const result = await cloudinary.uploader.upload(req.file.path, {
                folder: 'destinations',
                use_filename: true,
                unique_filename: false,
            });
            updateData.image = result.secure_url;

            // Delete the temporary file from local storage
            fs.unlinkSync(req.file.path);

            // Optionally delete old image from Cloudinary if it's a Cloudinary URL
            const oldDestination = await Destination.findById(id);
            if (oldDestination && oldDestination.image && oldDestination.image.includes('cloudinary')) {
                const publicId = oldDestination.image.split('/').pop().split('.')[0];
                await cloudinary.uploader.destroy(`destinations/${publicId}`);
            }
        }

        const destination = await Destination.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        );

        if (!destination) {
            return res.status(404).json({ message: 'Destination not found' });
        }

        res.status(200).json({
            message: 'Destination updated successfully',
            destination
        });
    } catch (error) {
        console.error('Update destination error:', error);
        res.status(500).json({ message: 'Server error updating destination' });
    }
};

// Delete destination
export const deleteDestination = async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID format
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid destination ID' });
        }

        const destination = await Destination.findByIdAndDelete(id);

        if (!destination) {
            return res.status(404).json({ message: 'Destination not found' });
        }

        // Delete associated image from Cloudinary if it's a Cloudinary URL
        if (destination.image && destination.image.includes('cloudinary')) {
            const publicId = destination.image.split('/').pop().split('.')[0];
            await cloudinary.uploader.destroy(`destinations/${publicId}`);
        } else if (destination.image) {
            // Fallback to local file deletion
            const imagePath = path.join(process.cwd(), destination.image);
            if (fs.existsSync(imagePath)) {
                fs.unlinkSync(imagePath);
            }
        }

        res.status(200).json({ message: 'Destination deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error deleting destination' });
    }
};

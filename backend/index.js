import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import path from 'path';
import connectDB from './db/connectDB.js';
import userRoutes from './routes/routes.js';
import bookingRoutes from './routes/bookingRoutes.js';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

// Initialize Express
const app = express();

// Connect Database
connectDB(process.env.CONNECTDB);

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// CORS
const allowedOrigins = [
  'http://localhost:5173', // frontend
  'http://localhost:5174', // admin
  'http://localhost:5175',
  'http://localhost:5178', // current frontend port
  'https://travel-karnataka-jo9p.vercel.app',
  'https://travel-karnataka-xt8s.vercel.app',
  'https://travel-karnataka.vercel.app',
];
app.use(
  cors({
    origin: allowedOrigins,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
  })
);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

// Routes
app.use('/api', userRoutes);
app.use('/api', bookingRoutes);
app.use('/api', adminRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`✅ Server running at http://localhost:${PORT}`));

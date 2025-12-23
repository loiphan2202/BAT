import Router from 'express';
import { registerUser, loginUser, adminLogin, googleSignIn, getProfile } from '../controllers/userController.js';
import { getAllUsers, updateUserStatus, deleteUser, updateUser } from '../controllers/adminController.js';
import {
    getAllDestinations,
    getDestinationById,
    createDestination,
    updateDestination,
    deleteDestination,
    upload
} from '../controllers/destinationController.js';
import {
    createUserRequest,
    getAllUserRequests,
    getUserRequests,
    approveUserRequest,
    rejectUserRequest,
    editUserRequest,
    upload as userRequestUpload
} from '../controllers/userRequestController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import Razorpay from 'razorpay';
import crypto from 'crypto';
import { sendPaymentSuccessEmail } from '../utils/mailer.js';

const router = Router();

// User registration route
router.post('/register', registerUser);
// User login route
router.post('/login', loginUser);
// Admin login route
router.post('/admin-login', adminLogin);
// Google sign-in route
router.post('/google-signin', googleSignIn);
// Profile route
router.get('/profile', authenticateToken, getProfile);

// Admin routes
router.get('/admin/users', authenticateToken, requireAdmin, getAllUsers);
router.put('/admin/users/:userId/status', authenticateToken, requireAdmin, updateUserStatus);
router.put('/admin/users/:userId', authenticateToken, requireAdmin, updateUser);
router.delete('/admin/users/:userId', authenticateToken, requireAdmin, deleteUser);

// Destination routes
router.get('/destinations', getAllDestinations); // Public route for frontend to get all destinations
router.get('/admin/destinations', authenticateToken, requireAdmin, getAllDestinations);
router.get('/destinations/:id', getDestinationById); // Public route for frontend
router.post('/admin/destinations', authenticateToken, requireAdmin, upload.single('image'), createDestination);
router.put('/admin/destinations/:id', authenticateToken, requireAdmin, upload.single('image'), updateDestination);
router.delete('/admin/destinations/:id', authenticateToken, requireAdmin, deleteDestination);



// User request routes
router.post('/user-request', authenticateToken, userRequestUpload.single('image'), createUserRequest); // Authenticated route for users to submit requests
router.get('/user/requests', authenticateToken, getUserRequests); // Get user's own requests
router.get('/admin/requests', authenticateToken, requireAdmin, getAllUserRequests);
router.post('/admin/requests/:requestId/approve', authenticateToken, requireAdmin, approveUserRequest);
router.post('/admin/requests/:requestId/reject', authenticateToken, requireAdmin, rejectUserRequest);
router.put('/admin/requests/:requestId/edit', authenticateToken, requireAdmin, editUserRequest);

export default router;

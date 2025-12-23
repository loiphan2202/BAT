import express from 'express';
import { getAllUsers } from '../controllers/adminController.js';
import { getDashboardStats, getRecentBookings } from '../controllers/dashboardController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();
router.get('/admin/users', authenticateToken, requireAdmin, getAllUsers);

router.get('/admin/stats', authenticateToken, requireAdmin, getDashboardStats);
router.get('/admin/bookings/recent', authenticateToken, requireAdmin, getRecentBookings);

export default router;

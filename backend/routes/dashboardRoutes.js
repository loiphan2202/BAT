import Router from 'express';
import { getDashboardStats, getRecentBookings } from '../controllers/dashboardController.js';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = Router();

// Dashboard routes
router.get('/admin/stats', authenticateToken, requireAdmin, getDashboardStats);
router.get('/admin/bookings/recent', authenticateToken, requireAdmin, getRecentBookings);

export default router;

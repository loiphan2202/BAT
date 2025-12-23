import Router from 'express';
import { authenticateToken, requireAdmin } from '../middleware/auth.js';
import {
    createBooking,
    getAllBookings,
    getUserBookings,
    updateBooking,
    updateBookingStatus,
    deleteBooking,
    createOrder,
  } from '../controllers/bookingController.js';

const router = Router();

// ----- StripeStripe Payment Routes -----
router.post('/create-order', authenticateToken, createOrder);



// ----- Regular Booking CRUD Routes -----
router.post('/bookings', authenticateToken, createBooking);
router.get('/bookings/user', authenticateToken, getUserBookings);
router.put('/bookings/:id', authenticateToken, updateBooking);
router.delete('/bookings/:id', authenticateToken, deleteBooking);

router.get('/admin/bookings', authenticateToken, requireAdmin, getAllBookings);
router.put('/admin/bookings/:id/status', authenticateToken, requireAdmin, updateBookingStatus);
router.delete('/admin/bookings/:id', authenticateToken, requireAdmin, deleteBooking);

export default router;

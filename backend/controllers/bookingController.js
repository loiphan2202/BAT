import Booking from '../models/Booking.js';
import User from '../models/User.js';
import Destination from '../models/Destination.js';
import { sendBookingPendingEmail, sendBookingConfirmationEmail, sendBookingCancelledEmail } from '../utils/mailer.js';
import crypto from 'crypto';
import Stripe from 'stripe';

// Stripe client (replace Razorpay)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-27.acacia', // use latest available in your project
});

// Create a new booking
export const createBooking = async (req, res) => {
    try {
        const { destinationId, packageName, travelDate, travelers, totalAmount, specialRequests, userEmail } = req.body;
        const userId = req.user._id || req.user.userId;

        // Validate required fields
        if (!userId || !destinationId || !packageName || !travelDate || !travelers || !totalAmount) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Check if user exists
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if destination exists
        const destination = await Destination.findById(destinationId);
        if (!destination) {
            return res.status(404).json({ message: 'Destination not found' });
        }

        // Create booking
        const booking = new Booking({
            user: userId,
            destination: destinationId,
            packageName,
            travelDate,
            travelers,
            totalAmount,
            specialRequests: specialRequests || ""
        });

        await booking.save();

        // Populate the booking with user and destination details
        await booking.populate('user', 'username email googleDisplayName');
        await booking.populate('destination', 'name');

        // Send pending email to user
        try {
            const emailToSend = userEmail || booking.user.email;
            console.log('Attempting to send email to:', emailToSend);
            console.log('Booking details:', {
                packageName: booking.packageName,
                destination: booking.destination.name,
                travelDate: booking.travelDate.toISOString().split('T')[0],
                travelers: booking.travelers,
                totalAmount: booking.totalAmount
            });
            await sendBookingPendingEmail(emailToSend, {
                packageName: booking.packageName,
                destination: booking.destination.name,
                travelDate: booking.travelDate.toISOString().split('T')[0],
                travelers: booking.travelers,
                totalAmount: booking.totalAmount
            });
            console.log('Email sent successfully to:', emailToSend);
        } catch (emailError) {
            console.error('Failed to send pending email:', emailError);
            console.error('Email error details:', emailError.message);
            // Don't fail the booking creation if email fails
        }

        res.status(201).json({
            message: 'Booking created successfully',
            booking: {
                id: booking._id,
                user: booking.user.username || booking.user.googleDisplayName || booking.user.email,
                destination: booking.destination.name,
                packageName: booking.packageName,
                travelDate: booking.travelDate,
                travelers: booking.travelers,
                totalAmount: booking.totalAmount,
                status: booking.status,
                paymentStatus: booking.paymentStatus || 'pending',
                bookingDate: booking.bookingDate,
                specialRequests: booking.specialRequests
            }
        });
    } catch (error) {
        console.error('Create booking error:', error);
        res.status(500).json({ message: 'Server error creating booking' });
    }
};

// Get all bookings (Admin only)
export const getAllBookings = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, userId } = req.query;

        const query = {};
        if (status) query.status = status;
        if (userId) query.user = userId;

        let bookings;
        const limitNum = limit ? parseInt(limit) : 10;
        if (limitNum > 0) {
            bookings = await Booking.find(query)
                .populate('user', 'username email googleDisplayName')
                .populate('destination', 'name')
                .sort({ createdAt: -1 })
                .limit(limitNum)
                .skip((page - 1) * limitNum);
        } else {
            bookings = await Booking.find(query)
                .populate('user', 'username email googleDisplayName')
                .populate('destination', 'name')
                .sort({ createdAt: -1 });
        }

        const total = await Booking.countDocuments(query);

        const formattedBookings = bookings.map(booking => ({
            id: booking._id,
            user: booking.user ? (booking.user.username || booking.user.googleDisplayName || booking.user.email) : 'Unknown User',
            userEmail: booking.user ? booking.user.email : 'Unknown Email',
            destination: booking.destination ? booking.destination.name : 'Unknown Destination',
            packageName: booking.packageName,
            travelDate: booking.travelDate.toISOString().split('T')[0],
            travelers: booking.travelers,
            totalAmount: booking.totalAmount,
            status: booking.status,
            bookingDate: booking.bookingDate.toISOString().split('T')[0],
            specialRequests: booking.specialRequests
        }));

        let totalPages, hasNext, hasPrev;
        if (limitNum > 0) {
            totalPages = Math.ceil(total / limitNum);
            hasNext = page * limitNum < total;
            hasPrev = page > 1;
        } else {
            totalPages = 1;
            hasNext = false;
            hasPrev = false;
        }

        res.status(200).json({
            bookings: formattedBookings,
            pagination: {
                currentPage: parseInt(page),
                totalPages,
                totalBookings: total,
                hasNext,
                hasPrev
            }
        });
    } catch (error) {
        console.error('Get all bookings error:', error);
        res.status(500).json({ message: 'Server error retrieving bookings' });
    }
};

// Get user's bookings
export const getUserBookings = async (req, res) => {
    try {
        const userId = req.user._id || req.user.userId; // From auth middleware

        const bookings = await Booking.find({ user: userId })
            .populate('destination', 'name image price')
            .sort({ createdAt: -1 });

        const formattedBookings = bookings.map(booking => ({
            _id: booking._id,
            packageName: booking.packageName,
            destination: booking.destination.name,
            destinationImage: booking.destination.image,
            travelDate: booking.travelDate,
            travelers: booking.travelers,
            totalAmount: booking.totalAmount,
            status: booking.status,
            paymentStatus: booking.paymentStatus || 'pending',
            bookingDate: booking.bookingDate,
            specialRequests: booking.specialRequests
        }));

        res.status(200).json(formattedBookings);
    } catch (error) {
        console.error('Get user bookings error:', error);
        res.status(500).json({ message: 'Server error retrieving user bookings' });
    }
};

// Update booking (User can update their own booking)
export const updateBooking = async (req, res) => {
    try {
        const { id } = req.params;
        const { travelers, specialRequests } = req.body;

        const booking = await Booking.findOne({ _id: id, user: req.user._id || req.user.userId });

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Update fields
        if (travelers !== undefined) booking.travelers = travelers;
        if (specialRequests !== undefined) booking.specialRequests = specialRequests;

        await booking.save();

        res.status(200).json({
            message: 'Booking updated successfully',
            booking: {
                _id: booking._id,
                packageName: booking.packageName,
                destination: booking.destination,
                travelDate: booking.travelDate,
                travelers: booking.travelers,
                totalAmount: booking.totalAmount,
                status: booking.status,
                paymentStatus: booking.paymentStatus || 'pending',
                specialRequests: booking.specialRequests
            }
        });
    } catch (error) {
        console.error('Update booking error:', error);
        res.status(500).json({ message: 'Server error updating booking' });
    }
};

// Update booking status (Admin only)
export const updateBookingStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        if (!['pending', 'confirmed', 'cancelled'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const booking = await Booking.findByIdAndUpdate(
            id,
            { status },
            { new: true }
        ).populate('user', 'username email googleDisplayName')
         .populate('destination', 'name');

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        // Send email based on status change
        try {
            if (status === 'confirmed') {
                await sendBookingConfirmationEmail(booking.user.email, {
                    packageName: booking.packageName,
                    destination: booking.destination.name,
                    travelDate: booking.travelDate.toISOString().split('T')[0],
                    travelers: booking.travelers,
                    totalAmount: booking.totalAmount
                });
            } else if (status === 'cancelled') {
                await sendBookingCancelledEmail(booking.user.email, {
                    packageName: booking.packageName,
                    destination: booking.destination.name,
                    travelDate: booking.travelDate.toISOString().split('T')[0],
                    travelers: booking.travelers,
                    totalAmount: booking.totalAmount
                });
            }
        } catch (emailError) {
            console.error(`Failed to send ${status} email:`, emailError);
            // Don't fail the status update if email fails
        }

        res.status(200).json({
            message: 'Booking status updated successfully',
            booking: {
                id: booking._id,
                user: booking.user.username || booking.user.googleDisplayName || booking.user.email,
                destination: booking.destination.name,
                status: booking.status,
                paymentStatus: booking.paymentStatus || 'pending'
            }
        });
    } catch (error) {
        console.error('Update booking status error:', error);
        res.status(500).json({ message: 'Server error updating booking status' });
    }
};

// Delete booking (Admin can delete any booking)
export const deleteBooking = async (req, res) => {
    try {
        const { id } = req.params;

        const booking = await Booking.findByIdAndDelete(id);

        if (!booking) {
            return res.status(404).json({ message: 'Booking not found' });
        }

        res.status(200).json({ message: 'Booking deleted successfully' });
    } catch (error) {
        console.error('Delete booking error:', error);
        res.status(500).json({ message: 'Server error deleting booking' });
    }
};

export const createOrder = async (req, res) => {
  try {
    const {
        amount, // amount in smallest currency unit (e.g. paise)
        currency = 'inr',
        bookingDescription = 'Travel booking',
    } = req.body;

    if (!amount || amount <= 0) {
        return res.status(400).json({ message: 'Invalid amount' });
    }

    const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5174';

    const session = await stripe.checkout.sessions.create({
        mode: 'payment',
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency,
              product_data: {
                name: bookingDescription,
              },
              unit_amount: amount,
            },
            quantity: 1,
          },
        ],
        success_url: `${frontendUrl}/booking-status?success=true`,
        cancel_url: `${frontendUrl}/booking?canceled=true`,
      });

      res.status(200).json({
        success: true,
        sessionUrl: session.url,
      });
    } catch (error) {
      console.error('Create Stripe session error:', error);
      res.status(500).json({ message: 'Failed to create payment session' });
    }
  };

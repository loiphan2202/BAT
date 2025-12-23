import User from '../models/User.js';
import Destination from '../models/Destination.js';
import Booking from '../models/Booking.js';

// Get dashboard stats
export const getDashboardStats = async (req, res) => {
    try {
        // Get total users (excluding admins)
        const totalUsers = await User.countDocuments({ role: { $ne: 'admin' } });

        // Get total bookings
        const totalBookings = await Booking.countDocuments();

        // Get total destinations
        const totalDestinations = await Destination.countDocuments();

        // Calculate total revenue from confirmed bookings
        const revenueResult = await Booking.aggregate([
            { $match: { status: 'confirmed' } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalRevenue = revenueResult.length > 0 ? revenueResult[0].total : 0;

        // Calculate percentage changes (comparing to last month)
        const currentDate = new Date();
        const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);
        const thisMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

        const lastMonthUsers = await User.countDocuments({
            role: { $ne: 'admin' },
            createdAt: { $lt: thisMonth, $gte: lastMonth }
        });

        const lastMonthBookings = await Booking.countDocuments({
            createdAt: { $lt: thisMonth, $gte: lastMonth }
        });

        const lastMonthDestinations = await Destination.countDocuments({
            createdAt: { $lt: thisMonth, $gte: lastMonth }
        });

        const lastMonthRevenueResult = await Booking.aggregate([
            { $match: { status: 'confirmed', createdAt: { $lt: thisMonth, $gte: lastMonth } } },
            { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const lastMonthRevenue = lastMonthRevenueResult.length > 0 ? lastMonthRevenueResult[0].total : 0;

        // Calculate percentage changes
        const usersChange = lastMonthUsers > 0 ? ((totalUsers - lastMonthUsers) / lastMonthUsers * 100).toFixed(1) : '+0';
        const bookingsChange = lastMonthBookings > 0 ? ((totalBookings - lastMonthBookings) / lastMonthBookings * 100).toFixed(1) : '+0';
        const destinationsChange = lastMonthDestinations > 0 ? ((totalDestinations - lastMonthDestinations) / lastMonthDestinations * 100).toFixed(1) : '+0';
        const revenueChange = lastMonthRevenue > 0 ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue * 100).toFixed(1) : '+0';

        res.status(200).json({
            totalUsers,
            totalBookings,
            totalDestinations,
            totalRevenue,
            usersChange: usersChange.startsWith('-') ? usersChange : `+${usersChange}`,
            bookingsChange: bookingsChange.startsWith('-') ? bookingsChange : `+${bookingsChange}`,
            destinationsChange: destinationsChange.startsWith('-') ? destinationsChange : `+${destinationsChange}`,
            revenueChange: revenueChange.startsWith('-') ? revenueChange : `+${revenueChange}`
        });
    } catch (error) {
        console.error('Get dashboard stats error:', error);
        res.status(500).json({ message: 'Server error retrieving dashboard stats' });
    }
};

// Get recent bookings
export const getRecentBookings = async (req, res) => {
    try {
        const recentBookings = await Booking.find()
            .populate('user', 'username googleDisplayName email')
            .populate('destination', 'name')
            .sort({ createdAt: -1 })
            .limit(10);

        const formattedBookings = recentBookings.map(booking => ({
            id: booking._id,
            user: booking.user ? (booking.user.username || booking.user.googleDisplayName || booking.user.email) : 'Unknown User',
            destination: booking.destination ? booking.destination.name : 'Unknown Destination',
            date: booking.createdAt.toISOString().split('T')[0],
            status: booking.status
        }));

        res.status(200).json(formattedBookings);
    } catch (error) {
        console.error('Get recent bookings error:', error);
        res.status(500).json({ message: 'Server error retrieving recent bookings' });
    }
};

const express = require('express');
const bookingController = require('../controllers/bookingController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../utils/validation');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Booking statistics
router.get('/stats', bookingController.getBookingStats);

// CRUD operations for bookings
router
  .route('/')
  .get(bookingController.getBookings)
  .post(restrictTo('owner'), validate(schemas.booking), bookingController.createBooking);

router.get('/:id', bookingController.getBooking);

// Status management
router.patch('/:id/status', bookingController.updateBookingStatus);

// Sitter-only routes
router.post('/:id/updates', restrictTo('sitter'), bookingController.addBookingUpdate);
router.post('/:id/checkin', restrictTo('sitter'), bookingController.checkInOut);
router.post('/:id/checkout', restrictTo('sitter'), bookingController.checkInOut);

module.exports = router;

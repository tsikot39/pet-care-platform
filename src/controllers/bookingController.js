const Booking = require('../models/Booking');
const Service = require('../models/Service');
const Pet = require('../models/Pet');

// @desc    Get all bookings for authenticated user
// @route   GET /api/bookings
// @access  Private
const getBookings = async (req, res, next) => {
  try {
    let query = {};
    
    // Filter based on user role
    if (req.user.role === 'owner') {
      query.owner = req.user.id;
    } else if (req.user.role === 'sitter') {
      query.sitter = req.user.id;
    }
    
    // Filter by status if provided
    if (req.query.status) {
      query.status = req.query.status;
    }
    
    // Date range filters
    if (req.query.startDate) {
      query.startDate = { $gte: new Date(req.query.startDate) };
    }
    
    if (req.query.endDate) {
      if (query.startDate) {
        query.startDate.$lte = new Date(req.query.endDate);
      } else {
        query.startDate = { $lte: new Date(req.query.endDate) };
      }
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const bookings = await Booking.find(query)
      .populate('owner', 'name email phone avatar')
      .populate('sitter', 'name email phone avatar')
      .populate('service', 'title serviceType price priceType location')
      .populate('pet', 'name species breed age photos')
      .sort({ startDate: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Booking.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      results: bookings.length,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit),
        total
      },
      data: {
        bookings
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single booking by ID
// @route   GET /api/bookings/:id
// @access  Private
const getBooking = async (req, res, next) => {
  try {
    let query = { _id: req.params.id };
    
    // Ensure user can only access their own bookings
    if (req.user.role === 'owner') {
      query.owner = req.user.id;
    } else if (req.user.role === 'sitter') {
      query.sitter = req.user.id;
    }
    
    const booking = await Booking.findOne(query)
      .populate('owner', 'name email phone avatar address emergencyContact')
      .populate('sitter', 'name email phone avatar address')
      .populate('service', 'title serviceType description price priceType location amenities')
      .populate('pet', 'name species breed age weight photos specialNeeds medications allergies vetInfo')
      .populate('updates.author', 'name avatar');
    
    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'No booking found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new booking
// @route   POST /api/bookings
// @access  Private (Owner only)
const createBooking = async (req, res, next) => {
  try {
    const { service: serviceId, pet: petId, startDate, endDate, startTime, endTime, notes, emergencyContact } = req.body;
    
    // Verify service exists and is active
    const service = await Service.findOne({ _id: serviceId, isActive: true })
      .populate('sitter', 'name email');
    
    if (!service) {
      return res.status(404).json({
        status: 'fail',
        message: 'Service not found or not available'
      });
    }
    
    // Verify pet belongs to the owner
    const pet = await Pet.findOne({ _id: petId, owner: req.user.id, isActive: true });
    
    if (!pet) {
      return res.status(404).json({
        status: 'fail',
        message: 'Pet not found or does not belong to you'
      });
    }
    
    // Check if pet type is supported by the service
    if (!service.petTypes.includes(pet.species)) {
      return res.status(400).json({
        status: 'fail',
        message: `This service does not support ${pet.species}s`
      });
    }
    
    // Check for conflicting bookings
    const conflicts = await Booking.findConflicts(
      service.sitter._id,
      new Date(startDate),
      new Date(endDate)
    );
    
    if (conflicts.length > 0) {
      return res.status(400).json({
        status: 'fail',
        message: 'The requested time slot is not available'
      });
    }
    
    // Calculate total price
    const start = new Date(startDate);
    const end = new Date(endDate);
    let totalPrice = 0;
    
    if (service.priceType === 'hourly') {
      const hours = Math.abs(end - start) / 36e5; // 36e5 = 3.6 * 10^6 ms in hour
      totalPrice = service.price * Math.ceil(hours);
    } else if (service.priceType === 'daily') {
      const days = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24));
      totalPrice = service.price * days;
    } else if (service.priceType === 'weekly') {
      const weeks = Math.ceil(Math.abs(end - start) / (1000 * 60 * 60 * 24 * 7));
      totalPrice = service.price * weeks;
    } else {
      totalPrice = service.price;
    }
    
    // Add service fee (5% of total price)
    const serviceFee = totalPrice * 0.05;
    
    const bookingData = {
      owner: req.user.id,
      sitter: service.sitter._id,
      service: serviceId,
      pet: petId,
      startDate: start,
      endDate: end,
      startTime,
      endTime,
      totalPrice: totalPrice + serviceFee,
      serviceFee,
      notes,
      emergencyContact,
      status: service.instantBooking ? 'confirmed' : 'pending'
    };
    
    const booking = await Booking.create(bookingData);
    
    // Populate the booking before sending response
    await booking.populate([
      { path: 'owner', select: 'name email phone' },
      { path: 'sitter', select: 'name email phone' },
      { path: 'service', select: 'title serviceType price priceType' },
      { path: 'pet', select: 'name species breed age' }
    ]);
    
    res.status(201).json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update booking status
// @route   PATCH /api/bookings/:id/status
// @access  Private
const updateBookingStatus = async (req, res, next) => {
  try {
    const { status, notes } = req.body;
    
    let query = { _id: req.params.id };
    
    // Owners can only cancel their bookings
    if (req.user.role === 'owner') {
      query.owner = req.user.id;
      
      if (status !== 'cancelled') {
        return res.status(403).json({
          status: 'fail',
          message: 'Pet owners can only cancel bookings'
        });
      }
    }
    // Sitters can confirm, decline, start, or complete bookings
    else if (req.user.role === 'sitter') {
      query.sitter = req.user.id;
      
      const allowedStatuses = ['confirmed', 'declined', 'in_progress', 'completed'];
      if (!allowedStatuses.includes(status)) {
        return res.status(403).json({
          status: 'fail',
          message: 'Invalid status update for sitter'
        });
      }
    }
    
    const booking = await Booking.findOne(query);
    
    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'No booking found with that ID'
      });
    }
    
    // Validate status transitions
    const validTransitions = {
      pending: ['confirmed', 'declined', 'cancelled'],
      confirmed: ['in_progress', 'cancelled'],
      in_progress: ['completed', 'cancelled'],
      completed: [],
      cancelled: [],
      declined: []
    };
    
    if (!validTransitions[booking.status].includes(status)) {
      return res.status(400).json({
        status: 'fail',
        message: `Cannot change status from ${booking.status} to ${status}`
      });
    }
    
    // Handle cancellation
    if (status === 'cancelled') {
      if (!booking.canBeCancelled()) {
        return res.status(400).json({
          status: 'fail',
          message: 'Booking cannot be cancelled at this time'
        });
      }
      
      booking.cancellation = {
        cancelledBy: req.user.id,
        cancelledAt: new Date(),
        reason: notes,
        refundAmount: booking.calculateRefund()
      };
    }
    
    booking.status = status;
    
    // Add notes based on user role
    if (req.user.role === 'owner' && notes) {
      booking.ownerNotes = notes;
    } else if (req.user.role === 'sitter' && notes) {
      booking.sitterNotes = notes;
    }
    
    await booking.save();
    
    // Update service total bookings count if confirmed
    if (status === 'confirmed') {
      await Service.findByIdAndUpdate(booking.service, {
        $inc: { totalBookings: 1 }
      });
    }
    
    await booking.populate([
      { path: 'owner', select: 'name email phone' },
      { path: 'sitter', select: 'name email phone' },
      { path: 'service', select: 'title serviceType' },
      { path: 'pet', select: 'name species' }
    ]);
    
    res.status(200).json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add update to booking
// @route   POST /api/bookings/:id/updates
// @access  Private (Sitter only)
const addBookingUpdate = async (req, res, next) => {
  try {
    const { message, photos } = req.body;
    
    const booking = await Booking.findOne({
      _id: req.params.id,
      sitter: req.user.id,
      status: 'in_progress'
    });
    
    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'No active booking found with that ID'
      });
    }
    
    const update = {
      time: new Date(),
      message,
      photos: photos || [],
      author: req.user.id
    };
    
    booking.updates.push(update);
    await booking.save();
    
    await booking.populate('updates.author', 'name avatar');
    
    res.status(200).json({
      status: 'success',
      data: {
        booking,
        update: booking.updates[booking.updates.length - 1]
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Check in/out for booking
// @route   POST /api/bookings/:id/checkin
// @route   POST /api/bookings/:id/checkout
// @access  Private (Sitter only)
const checkInOut = async (req, res, next) => {
  try {
    const { notes, photos } = req.body;
    const isCheckIn = req.path.includes('checkin');
    
    const booking = await Booking.findOne({
      _id: req.params.id,
      sitter: req.user.id
    });
    
    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'No booking found with that ID'
      });
    }
    
    const checkData = {
      time: new Date(),
      notes,
      photos: photos || []
    };
    
    if (isCheckIn) {
      if (booking.checkIn.time) {
        return res.status(400).json({
          status: 'fail',
          message: 'Already checked in for this booking'
        });
      }
      booking.checkIn = checkData;
      booking.status = 'in_progress';
    } else {
      if (!booking.checkIn.time) {
        return res.status(400).json({
          status: 'fail',
          message: 'Must check in before checking out'
        });
      }
      if (booking.checkOut.time) {
        return res.status(400).json({
          status: 'fail',
          message: 'Already checked out for this booking'
        });
      }
      booking.checkOut = checkData;
      booking.status = 'completed';
    }
    
    await booking.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        booking
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get booking statistics
// @route   GET /api/bookings/stats
// @access  Private
const getBookingStats = async (req, res, next) => {
  try {
    const stats = await Booking.getStats(req.user._id, req.user.role);
    
    // Calculate additional metrics
    const totalBookings = stats.reduce((sum, stat) => sum + stat.count, 0);
    const totalRevenue = stats.reduce((sum, stat) => sum + stat.totalRevenue, 0);
    
    // Get upcoming bookings count
    const upcomingCount = await Booking.countDocuments({
      [req.user.role === 'owner' ? 'owner' : 'sitter']: req.user.id,
      status: { $in: ['pending', 'confirmed'] },
      startDate: { $gte: new Date() }
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        totalBookings,
        totalRevenue,
        upcomingBookings: upcomingCount,
        statusBreakdown: stats
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getBookings,
  getBooking,
  createBooking,
  updateBookingStatus,
  addBookingUpdate,
  checkInOut,
  getBookingStats
};

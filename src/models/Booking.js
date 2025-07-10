const mongoose = require('mongoose');

const bookingSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Booking must have an owner']
  },
  sitter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Booking must have a sitter']
  },
  service: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Service',
    required: [true, 'Booking must be for a service']
  },
  pet: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Pet',
    required: [true, 'Booking must specify a pet']
  },
  startDate: {
    type: Date,
    required: [true, 'Please provide start date']
  },
  endDate: {
    type: Date,
    required: [true, 'Please provide end date']
  },
  startTime: {
    type: String,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid start time format (HH:MM)']
  },
  endTime: {
    type: String,
    match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid end time format (HH:MM)']
  },
  status: {
    type: String,
    enum: {
      values: ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled', 'declined'],
      message: 'Status must be one of: pending, confirmed, in_progress, completed, cancelled, declined'
    },
    default: 'pending'
  },
  totalPrice: {
    type: Number,
    required: [true, 'Booking must have a total price'],
    min: [0, 'Total price cannot be negative']
  },
  serviceFee: {
    type: Number,
    default: 0,
    min: [0, 'Service fee cannot be negative']
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['credit_card', 'debit_card', 'paypal', 'cash'],
    default: 'credit_card'
  },
  notes: {
    type: String,
    maxlength: [500, 'Notes cannot exceed 500 characters']
  },
  ownerNotes: {
    type: String,
    maxlength: [500, 'Owner notes cannot exceed 500 characters']
  },
  sitterNotes: {
    type: String,
    maxlength: [500, 'Sitter notes cannot exceed 500 characters']
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  specialInstructions: {
    type: String,
    maxlength: [1000, 'Special instructions cannot exceed 1000 characters']
  },
  checkIn: {
    time: Date,
    notes: String,
    photos: [String]
  },
  checkOut: {
    time: Date,
    notes: String,
    photos: [String]
  },
  updates: [{
    time: {
      type: Date,
      default: Date.now
    },
    message: String,
    photos: [String],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  cancellation: {
    cancelledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    cancelledAt: Date,
    reason: String,
    refundAmount: Number
  },
  review: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Review'
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
bookingSchema.index({ owner: 1, status: 1 });
bookingSchema.index({ sitter: 1, status: 1 });
bookingSchema.index({ service: 1 });
bookingSchema.index({ startDate: 1, endDate: 1 });
bookingSchema.index({ status: 1, startDate: 1 });

// Virtual for duration in hours
bookingSchema.virtual('durationHours').get(function() {
  if (this.startDate && this.endDate) {
    return Math.abs(this.endDate - this.startDate) / 36e5; // 36e5 = 3.6 * 10^6 ms in hour
  }
  return 0;
});

// Virtual for duration in days
bookingSchema.virtual('durationDays').get(function() {
  if (this.startDate && this.endDate) {
    return Math.ceil(Math.abs(this.endDate - this.startDate) / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Virtual for total duration string
bookingSchema.virtual('durationString').get(function() {
  const hours = this.durationHours;
  if (hours < 24) {
    return `${Math.round(hours)} hour${Math.round(hours) !== 1 ? 's' : ''}`;
  } else {
    const days = this.durationDays;
    return `${days} day${days !== 1 ? 's' : ''}`;
  }
});

// Pre-save middleware to validate dates
bookingSchema.pre('save', function(next) {
  // Check if end date is after start date
  if (this.startDate && this.endDate && this.endDate <= this.startDate) {
    return next(new Error('End date must be after start date'));
  }
  
  // Check if booking is not in the past
  if (this.isNew && this.startDate < new Date()) {
    return next(new Error('Cannot create bookings in the past'));
  }
  
  next();
});

// Pre-find middleware to populate related data
bookingSchema.pre(/^find/, function(next) {
  if (this.getOptions().populate) {
    this.populate([
      {
        path: 'owner',
        select: 'name email phone avatar'
      },
      {
        path: 'sitter',
        select: 'name email phone avatar'
      },
      {
        path: 'service',
        select: 'title serviceType price priceType location'
      },
      {
        path: 'pet',
        select: 'name species breed age photos specialNeeds'
      }
    ]);
  }
  next();
});

// Instance method to check if booking can be cancelled
bookingSchema.methods.canBeCancelled = function() {
  if (this.status === 'completed' || this.status === 'cancelled') {
    return false;
  }
  
  // Can't cancel if booking starts in less than 24 hours
  const hoursUntilStart = (this.startDate - new Date()) / (1000 * 60 * 60);
  return hoursUntilStart > 24;
};

// Instance method to check if booking can be modified
bookingSchema.methods.canBeModified = function() {
  if (this.status !== 'pending' && this.status !== 'confirmed') {
    return false;
  }
  
  // Can't modify if booking starts in less than 48 hours
  const hoursUntilStart = (this.startDate - new Date()) / (1000 * 60 * 60);
  return hoursUntilStart > 48;
};

// Instance method to check if review can be left
bookingSchema.methods.canBeReviewed = function() {
  return this.status === 'completed' && !this.review;
};

// Instance method to calculate refund amount
bookingSchema.methods.calculateRefund = function() {
  const hoursUntilStart = (this.startDate - new Date()) / (1000 * 60 * 60);
  
  if (hoursUntilStart > 48) {
    return this.totalPrice; // Full refund
  } else if (hoursUntilStart > 24) {
    return this.totalPrice * 0.5; // 50% refund
  } else {
    return 0; // No refund
  }
};

// Static method to find conflicting bookings
bookingSchema.statics.findConflicts = function(sitterId, startDate, endDate, excludeBookingId = null) {
  let query = {
    sitter: sitterId,
    status: { $in: ['pending', 'confirmed', 'in_progress'] },
    $or: [
      {
        startDate: { $lte: endDate },
        endDate: { $gte: startDate }
      }
    ]
  };
  
  if (excludeBookingId) {
    query._id = { $ne: excludeBookingId };
  }
  
  return this.find(query);
};

// Static method to get booking statistics
bookingSchema.statics.getStats = function(userId, userRole) {
  const matchField = userRole === 'owner' ? 'owner' : 'sitter';
  
  return this.aggregate([
    {
      $match: { [matchField]: userId }
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalRevenue: { $sum: '$totalPrice' }
      }
    }
  ]);
};

const Booking = mongoose.model('Booking', bookingSchema);

module.exports = Booking;

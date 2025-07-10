const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  sitter: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Service must belong to a sitter']
  },
  serviceType: {
    type: String,
    required: [true, 'Please specify service type'],
    enum: {
      values: ['dog_walking', 'pet_sitting', 'grooming', 'training', 'daycare', 'boarding', 'other'],
      message: 'Service type must be one of: dog_walking, pet_sitting, grooming, training, daycare, boarding, other'
    }
  },
  title: {
    type: String,
    required: [true, 'Please provide service title'],
    trim: true,
    minlength: [5, 'Title must be at least 5 characters long'],
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Please provide service description'],
    trim: true,
    minlength: [10, 'Description must be at least 10 characters long'],
    maxlength: [1000, 'Description cannot exceed 1000 characters']
  },
  price: {
    type: Number,
    required: [true, 'Please provide service price'],
    min: [0, 'Price cannot be negative']
  },
  priceType: {
    type: String,
    enum: ['hourly', 'daily', 'weekly', 'per_service'],
    default: 'hourly'
  },
  duration: {
    type: Number, // in minutes
    min: [15, 'Minimum duration is 15 minutes']
  },
  location: {
    address: {
      type: String,
      required: [true, 'Please provide service address']
    },
    city: {
      type: String,
      required: [true, 'Please provide city']
    },
    state: {
      type: String,
      required: [true, 'Please provide state']
    },
    zipCode: {
      type: String,
      required: [true, 'Please provide zip code']
    },
    coordinates: {
      lat: Number,
      lng: Number
    }
  },
  availability: [{
    day: {
      type: String,
      enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
      required: true
    },
    startTime: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time format (HH:MM)']
    },
    endTime: {
      type: String,
      required: true,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Please provide valid time format (HH:MM)']
    }
  }],
  petTypes: [{
    type: String,
    enum: ['dog', 'cat', 'bird', 'fish', 'rabbit', 'hamster', 'other'],
    required: true
  }],
  petSizes: [{
    type: String,
    enum: ['small', 'medium', 'large', 'extra_large']
  }],
  maxPets: {
    type: Number,
    min: [1, 'Must accommodate at least 1 pet'],
    default: 1
  },
  requirements: {
    vaccinated: {
      type: Boolean,
      default: true
    },
    spayedNeutered: {
      type: Boolean,
      default: false
    },
    microchipped: {
      type: Boolean,
      default: false
    }
  },
  amenities: [String], // e.g., 'fenced_yard', 'indoor_play', 'cameras', 'updates_with_photos'
  images: [String], // URLs or file paths
  cancellationPolicy: {
    type: String,
    enum: ['flexible', 'moderate', 'strict'],
    default: 'moderate'
  },
  instantBooking: {
    type: Boolean,
    default: false
  },
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  totalBookings: {
    type: Number,
    default: 0
  },
  isActive: {
    type: Boolean,
    default: true
  },
  featured: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
serviceSchema.index({ sitter: 1 });
serviceSchema.index({ serviceType: 1 });
serviceSchema.index({ petTypes: 1 });
serviceSchema.index({ 'location.city': 1, 'location.state': 1 });
serviceSchema.index({ price: 1 });
serviceSchema.index({ 'rating.average': -1 });
serviceSchema.index({ isActive: 1 });
serviceSchema.index({ featured: -1, 'rating.average': -1 });

// Compound index for location-based searches
serviceSchema.index({ 
  'location.coordinates.lat': 1, 
  'location.coordinates.lng': 1 
});

// Text index for search functionality
serviceSchema.index({
  title: 'text',
  description: 'text',
  'location.city': 'text',
  'location.state': 'text'
});

// Virtual for reviews
serviceSchema.virtual('reviews', {
  ref: 'Review',
  localField: '_id',
  foreignField: 'service'
});

// Virtual for bookings
serviceSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'service'
});

// Pre-find middleware to populate sitter info when needed
serviceSchema.pre(/^find/, function(next) {
  if (this.getOptions().populate) {
    this.populate({
      path: 'sitter',
      select: 'name avatar bio rating experience'
    });
  }
  next();
});

// Instance method to check availability on a specific date/time
serviceSchema.methods.isAvailable = function(date, startTime, endTime) {
  const dayOfWeek = date.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
  
  const dayAvailability = this.availability.find(avail => avail.day === dayOfWeek);
  if (!dayAvailability) return false;
  
  // Simple time comparison (in a real app, you'd want more sophisticated logic)
  return startTime >= dayAvailability.startTime && endTime <= dayAvailability.endTime;
};

// Instance method to get formatted price
serviceSchema.methods.getFormattedPrice = function() {
  const formatMap = {
    hourly: '/hour',
    daily: '/day',
    weekly: '/week',
    per_service: '/service'
  };
  
  return `$${this.price}${formatMap[this.priceType] || ''}`;
};

// Static method to find services by location
serviceSchema.statics.findByLocation = function(city, state, radius = 25) {
  return this.find({
    'location.city': new RegExp(city, 'i'),
    'location.state': new RegExp(state, 'i'),
    isActive: true
  });
};

// Static method to find services by pet type
serviceSchema.statics.findByPetType = function(petType) {
  return this.find({
    petTypes: petType,
    isActive: true
  });
};

// Static method to search services
serviceSchema.statics.searchServices = function(query) {
  return this.find({
    $text: { $search: query },
    isActive: true
  }, {
    score: { $meta: 'textScore' }
  }).sort({
    score: { $meta: 'textScore' }
  });
};

// Method to update rating when a new review is added
serviceSchema.methods.updateRating = async function(newRating) {
  const totalRating = (this.rating.average * this.rating.count) + newRating;
  this.rating.count += 1;
  this.rating.average = totalRating / this.rating.count;
  
  return this.save();
};

const Service = mongoose.model('Service', serviceSchema);

module.exports = Service;

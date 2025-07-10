const mongoose = require('mongoose');

const petSchema = new mongoose.Schema({
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Pet must belong to an owner']
  },
  name: {
    type: String,
    required: [true, 'Please provide pet name'],
    trim: true,
    maxlength: [50, 'Pet name cannot be more than 50 characters']
  },
  species: {
    type: String,
    required: [true, 'Please specify pet species'],
    enum: {
      values: ['dog', 'cat', 'bird', 'fish', 'rabbit', 'hamster', 'other'],
      message: 'Species must be one of: dog, cat, bird, fish, rabbit, hamster, other'
    }
  },
  breed: {
    type: String,
    trim: true,
    maxlength: [50, 'Breed cannot be more than 50 characters']
  },
  age: {
    type: Number,
    min: [0, 'Age cannot be negative'],
    max: [30, 'Age seems unrealistic']
  },
  weight: {
    type: Number,
    min: [0, 'Weight cannot be negative']
  },
  gender: {
    type: String,
    enum: ['male', 'female', 'unknown'],
    default: 'unknown'
  },
  color: {
    type: String,
    trim: true
  },
  photos: [{
    type: String // URLs or file paths
  }],
  specialNeeds: {
    type: String,
    maxlength: [500, 'Special needs description cannot be more than 500 characters']
  },
  vaccinated: {
    type: Boolean,
    default: false
  },
  microchipped: {
    type: Boolean,
    default: false
  },
  spayedNeutered: {
    type: Boolean,
    default: false
  },
  medications: [{
    name: String,
    dosage: String,
    frequency: String,
    notes: String
  }],
  allergies: [String],
  vetInfo: {
    name: String,
    phone: String,
    address: String,
    email: String
  },
  behaviorNotes: {
    type: String,
    maxlength: [1000, 'Behavior notes cannot be more than 1000 characters']
  },
  emergencyContact: {
    name: String,
    phone: String,
    relationship: String
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
petSchema.index({ owner: 1 });
petSchema.index({ species: 1 });
petSchema.index({ owner: 1, isActive: 1 });

// Virtual for bookings
petSchema.virtual('bookings', {
  ref: 'Booking',
  localField: '_id',
  foreignField: 'pet'
});

// Pre-find middleware to populate owner info when needed
petSchema.pre(/^find/, function(next) {
  // Only populate if explicitly requested
  if (this.getOptions().populate) {
    this.populate({
      path: 'owner',
      select: 'name email phone'
    });
  }
  next();
});

// Instance method to get age in human-readable format
petSchema.methods.getAgeString = function() {
  if (!this.age) return 'Age unknown';
  
  if (this.age < 1) {
    const months = Math.floor(this.age * 12);
    return `${months} month${months !== 1 ? 's' : ''} old`;
  }
  
  return `${this.age} year${this.age !== 1 ? 's' : ''} old`;
};

// Static method to find pets by species
petSchema.statics.findBySpecies = function(species) {
  return this.find({ species, isActive: true });
};

// Static method to find pets needing special care
petSchema.statics.findSpecialNeeds = function() {
  return this.find({ 
    $or: [
      { specialNeeds: { $exists: true, $ne: '' } },
      { 'medications.0': { $exists: true } },
      { 'allergies.0': { $exists: true } }
    ],
    isActive: true 
  });
};

const Pet = mongoose.model('Pet', petSchema);

module.exports = Pet;

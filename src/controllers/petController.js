const Pet = require('../models/Pet');
const { uploadMultiple, handleUploadError, deleteFile, getFileUrl } = require('../utils/fileUpload');
const path = require('path');

// @desc    Get all pets for the authenticated user
// @route   GET /api/pets
// @access  Private (Owner only)
const getPets = async (req, res, next) => {
  try {
    const pets = await Pet.find({ 
      owner: req.user.id, 
      isActive: true 
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      results: pets.length,
      data: {
        pets
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single pet by ID
// @route   GET /api/pets/:id
// @access  Private (Owner only)
const getPet = async (req, res, next) => {
  try {
    const pet = await Pet.findOne({
      _id: req.params.id,
      owner: req.user.id,
      isActive: true
    });
    
    if (!pet) {
      return res.status(404).json({
        status: 'fail',
        message: 'No pet found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        pet
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new pet
// @route   POST /api/pets
// @access  Private (Owner only)
const createPet = async (req, res, next) => {
  // Handle file upload
  uploadMultiple(req, res, async (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    
    try {
      // Add owner ID to request body
      req.body.owner = req.user.id;
      
      // Convert FormData strings to proper types for validation
      if (req.body.age && req.body.age !== '') {
        req.body.age = parseInt(req.body.age, 10);
        if (isNaN(req.body.age)) {
          delete req.body.age;
        }
      } else {
        delete req.body.age;
      }
      
      if (req.body.weight && req.body.weight !== '') {
        req.body.weight = parseFloat(req.body.weight);
        if (isNaN(req.body.weight)) {
          delete req.body.weight;
        }
      } else {
        delete req.body.weight;
      }
      
      // Convert boolean fields
      if (req.body.vaccinated !== undefined) {
        req.body.vaccinated = req.body.vaccinated === 'true';
      }
      
      if (req.body.microchipped !== undefined) {
        req.body.microchipped = req.body.microchipped === 'true';
      }
      
      // Remove empty string fields
      Object.keys(req.body).forEach(key => {
        if (req.body[key] === '' || req.body[key] === null) {
          delete req.body[key];
        }
      });
      
      console.log('Processed pet data for validation:', req.body);
      
      // Validate the processed data
      const { validate, schemas } = require('../utils/validation');
      const { error } = schemas.pet.validate(req.body, { 
        abortEarly: false,
        stripUnknown: true
      });
      
      if (error) {
        const errors = error.details.map(detail => ({
          field: detail.path.join('.'),
          message: detail.message,
          value: detail.context.value
        }));
        console.log('Validation errors:', errors);
        
        // Clean up uploaded files if validation fails
        if (req.files && req.files.length > 0) {
          req.files.forEach(file => {
            deleteFile(file.path).catch(console.error);
          });
        }
        
        return res.status(400).json({
          status: 'fail',
          message: 'Validation failed',
          errors
        });
      }
      
      // Handle uploaded photos
      if (req.files && req.files.length > 0) {
        req.body.photos = req.files.map(file => getFileUrl(req, file.filename));
      }
      
      const pet = await Pet.create(req.body);
      
      res.status(201).json({
        status: 'success',
        data: {
          pet
        }
      });
    } catch (error) {
      // Clean up uploaded files if pet creation fails
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          deleteFile(file.path).catch(console.error);
        });
      }
      next(error);
    }
  });
};

// @desc    Update pet
// @route   PUT /api/pets/:id
// @access  Private (Owner only)
const updatePet = async (req, res, next) => {
  // Handle file upload
  uploadMultiple(req, res, async (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    
    try {
      let pet = await Pet.findOne({
        _id: req.params.id,
        owner: req.user.id,
        isActive: true
      });
      
      if (!pet) {
        // Clean up uploaded files if pet not found
        if (req.files && req.files.length > 0) {
          req.files.forEach(file => {
            deleteFile(file.path).catch(console.error);
          });
        }
        return res.status(404).json({
          status: 'fail',
          message: 'No pet found with that ID'
        });
      }
      
      // Handle new photos
      if (req.files && req.files.length > 0) {
        const newPhotos = req.files.map(file => getFileUrl(req, file.filename));
        
        // If replacePhotos is true, replace all photos; otherwise, add to existing
        if (req.body.replacePhotos === 'true') {
          // Delete old photos
          if (pet.photos && pet.photos.length > 0) {
            pet.photos.forEach(photoUrl => {
              const filename = path.basename(photoUrl);
              const filepath = path.join(__dirname, '../../uploads/pets', filename);
              deleteFile(filepath).catch(console.error);
            });
          }
          req.body.photos = newPhotos;
        } else {
          req.body.photos = [...(pet.photos || []), ...newPhotos];
        }
      }
      
      // Remove fields that shouldn't be updated
      delete req.body.owner;
      delete req.body.replacePhotos;
      
      pet = await Pet.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      });
      
      res.status(200).json({
        status: 'success',
        data: {
          pet
        }
      });
    } catch (error) {
      // Clean up uploaded files on error
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          deleteFile(file.path).catch(console.error);
        });
      }
      next(error);
    }
  });
};

// @desc    Delete pet photo
// @route   DELETE /api/pets/:id/photos/:photoIndex
// @access  Private (Owner only)
const deletePhoto = async (req, res, next) => {
  try {
    const pet = await Pet.findOne({
      _id: req.params.id,
      owner: req.user.id,
      isActive: true
    });
    
    if (!pet) {
      return res.status(404).json({
        status: 'fail',
        message: 'No pet found with that ID'
      });
    }
    
    const photoIndex = parseInt(req.params.photoIndex);
    
    if (photoIndex < 0 || photoIndex >= pet.photos.length) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid photo index'
      });
    }
    
    // Delete photo file
    const photoUrl = pet.photos[photoIndex];
    const filename = path.basename(photoUrl);
    const filepath = path.join(__dirname, '../../uploads/pets', filename);
    
    try {
      await deleteFile(filepath);
    } catch (fileError) {
      console.error('Error deleting photo file:', fileError);
    }
    
    // Remove photo from array
    pet.photos.splice(photoIndex, 1);
    await pet.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        pet
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete pet (soft delete)
// @route   DELETE /api/pets/:id
// @access  Private (Owner only)
const deletePet = async (req, res, next) => {
  try {
    const pet = await Pet.findOne({
      _id: req.params.id,
      owner: req.user.id,
      isActive: true
    });
    
    if (!pet) {
      return res.status(404).json({
        status: 'fail',
        message: 'No pet found with that ID'
      });
    }
    
    // Soft delete - set isActive to false
    pet.isActive = false;
    await pet.save();
    
    res.status(200).json({
      status: 'success',
      message: 'Pet deleted successfully',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get pet statistics for dashboard
// @route   GET /api/pets/stats
// @access  Private (Owner only)
const getPetStats = async (req, res, next) => {
  try {
    const stats = await Pet.aggregate([
      {
        $match: { 
          owner: req.user._id,
          isActive: true
        }
      },
      {
        $group: {
          _id: '$species',
          count: { $sum: 1 },
          avgAge: { $avg: '$age' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    const totalPets = await Pet.countDocuments({ 
      owner: req.user.id, 
      isActive: true 
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        totalPets,
        speciesBreakdown: stats
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPets,
  getPet,
  createPet,
  updatePet,
  deletePhoto,
  deletePet,
  getPetStats
};

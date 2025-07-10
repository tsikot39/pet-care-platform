const Pet = require('../models/Pet');
const { uploadMultiple, handleUploadError, deleteFile, getFileUrl } = require('../utils/fileUpload');
const path = require('path');

/**
 * @swagger
 * /api/pets:
 *   get:
 *     summary: Get all pets for the authenticated user
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of pets per page
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [dog, cat, bird, fish, rabbit, hamster, other]
 *         description: Filter by pet type
 *     responses:
 *       200:
 *         description: Successfully retrieved pets
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 results:
 *                   type: integer
 *                   example: 2
 *                 data:
 *                   type: object
 *                   properties:
 *                     pets:
 *                       type: array
 *                       items:
 *                         $ref: '#/components/schemas/Pet'
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /api/pets/{id}:
 *   get:
 *     summary: Get a specific pet by ID
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Pet ID
 *     responses:
 *       200:
 *         description: Successfully retrieved pet
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     pet:
 *                       $ref: '#/components/schemas/Pet'
 *       404:
 *         description: Pet not found
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       500:
 *         description: Internal server error
 */
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

/**
 * @swagger
 * /api/pets:
 *   post:
 *     summary: Create a new pet
 *     tags: [Pets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - type
 *               - breed
 *             properties:
 *               name:
 *                 type: string
 *                 description: Pet name
 *                 example: Buddy
 *               type:
 *                 type: string
 *                 enum: [dog, cat, bird, fish, rabbit, hamster, other]
 *                 description: Pet type
 *                 example: dog
 *               breed:
 *                 type: string
 *                 description: Pet breed
 *                 example: Golden Retriever
 *               age:
 *                 type: integer
 *                 minimum: 0
 *                 description: Pet age in years
 *                 example: 3
 *               gender:
 *                 type: string
 *                 enum: [male, female, unknown]
 *                 description: Pet gender
 *                 example: male
 *               weight:
 *                 type: number
 *                 minimum: 0
 *                 description: Pet weight in kg
 *                 example: 30.5
 *               color:
 *                 type: string
 *                 description: Pet color
 *                 example: golden
 *               description:
 *                 type: string
 *                 description: Pet description
 *                 example: Friendly and energetic dog
 *               photos:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Pet photos (max 5 files)
 *               vaccinated:
 *                 type: boolean
 *                 description: Vaccination status
 *                 example: true
 *               neutered:
 *                 type: boolean
 *                 description: Neutering status
 *                 example: false
 *               microchipped:
 *                 type: boolean
 *                 description: Microchip status
 *                 example: true
 *               specialNeeds:
 *                 type: string
 *                 description: Special needs or medical conditions
 *                 example: Allergic to certain foods
 *     responses:
 *       201:
 *         description: Pet created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     pet:
 *                       $ref: '#/components/schemas/Pet'
 *       400:
 *         description: Bad request - Invalid data
 *       401:
 *         description: Unauthorized - Invalid or missing token
 *       413:
 *         description: Payload too large - File size exceeded
 *       500:
 *         description: Internal server error
 */
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

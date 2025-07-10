const Service = require('../models/Service');
const { uploadMultiple, handleUploadError, deleteFile, getFileUrl } = require('../utils/fileUpload');
const path = require('path');

// @desc    Get all services (public)
// @route   GET /api/services
// @access  Public
const getServices = async (req, res, next) => {
  try {
    let query = { isActive: true };
    
    // Build filter based on query parameters
    if (req.query.serviceType) {
      query.serviceType = req.query.serviceType;
    }
    
    if (req.query.petType) {
      query.petTypes = req.query.petType;
    }
    
    if (req.query.city) {
      query['location.city'] = new RegExp(req.query.city, 'i');
    }
    
    if (req.query.state) {
      query['location.state'] = new RegExp(req.query.state, 'i');
    }
    
    if (req.query.minPrice || req.query.maxPrice) {
      query.price = {};
      if (req.query.minPrice) query.price.$gte = parseFloat(req.query.minPrice);
      if (req.query.maxPrice) query.price.$lte = parseFloat(req.query.maxPrice);
    }
    
    // Text search
    if (req.query.search) {
      query.$text = { $search: req.query.search };
    }
    
    // Sorting
    let sortBy = {};
    if (req.query.sort) {
      const sortFields = req.query.sort.split(',');
      sortFields.forEach(field => {
        if (field.startsWith('-')) {
          sortBy[field.substring(1)] = -1;
        } else {
          sortBy[field] = 1;
        }
      });
    } else {
      sortBy = { featured: -1, 'rating.average': -1, createdAt: -1 };
    }
    
    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const services = await Service.find(query)
      .populate({
        path: 'sitter',
        select: 'name avatar bio rating experience'
      })
      .sort(sortBy)
      .skip(skip)
      .limit(limit);
    
    const total = await Service.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      results: services.length,
      pagination: {
        page,
        limit,
        pages: Math.ceil(total / limit),
        total
      },
      data: {
        services
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single service by ID
// @route   GET /api/services/:id
// @access  Public
const getService = async (req, res, next) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      isActive: true
    }).populate({
      path: 'sitter',
      select: 'name avatar bio rating experience certifications'
    });
    
    if (!service) {
      return res.status(404).json({
        status: 'fail',
        message: 'No service found with that ID'
      });
    }
    
    res.status(200).json({
      status: 'success',
      data: {
        service
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get services for the authenticated sitter
// @route   GET /api/services/my-services
// @access  Private (Sitter only)
const getMyServices = async (req, res, next) => {
  try {
    const services = await Service.find({ 
      sitter: req.user.id 
    }).sort({ createdAt: -1 });
    
    res.status(200).json({
      status: 'success',
      results: services.length,
      data: {
        services
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new service
// @route   POST /api/services
// @access  Private (Sitter only)
const createService = async (req, res, next) => {
  // Check user role first (additional check)
  if (req.user.role !== 'sitter') {
    return res.status(403).json({
      status: 'fail',
      message: 'Only pet sitters can create services. Please register as a sitter to offer services.'
    });
  }

  // Handle file upload
  uploadMultiple(req, res, async (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    
    try {
      // Add sitter ID to request body
      req.body.sitter = req.user.id;
      
      // Handle uploaded images
      if (req.files && req.files.length > 0) {
        req.body.images = req.files.map(file => getFileUrl(req, file.filename));
      }
      
      const service = await Service.create(req.body);
      
      // Populate sitter info before sending response
      await service.populate('sitter', 'name avatar bio rating experience');
      
      res.status(201).json({
        status: 'success',
        message: 'Service created successfully',
        data: {
          service
        }
      });
    } catch (error) {
      // Clean up uploaded files if service creation fails
      if (req.files && req.files.length > 0) {
        req.files.forEach(file => {
          deleteFile(file.path).catch(console.error);
        });
      }
      
      // Handle validation errors specifically
      if (error.name === 'ValidationError') {
        const validationErrors = Object.values(error.errors).map(err => ({
          field: err.path,
          message: err.message
        }));
        
        return res.status(400).json({
          status: 'fail',
          message: 'Service validation failed. Please check your input.',
          errors: validationErrors
        });
      }
      
      next(error);
    }
  });
};

// @desc    Update service
// @route   PUT /api/services/:id
// @access  Private (Sitter only)
const updateService = async (req, res, next) => {
  // Handle file upload
  uploadMultiple(req, res, async (err) => {
    if (err) {
      return handleUploadError(err, req, res, next);
    }
    
    try {
      let service = await Service.findOne({
        _id: req.params.id,
        sitter: req.user.id
      });
      
      if (!service) {
        // Clean up uploaded files if service not found
        if (req.files && req.files.length > 0) {
          req.files.forEach(file => {
            deleteFile(file.path).catch(console.error);
          });
        }
        return res.status(404).json({
          status: 'fail',
          message: 'No service found with that ID'
        });
      }
      
      // Handle new images
      if (req.files && req.files.length > 0) {
        const newImages = req.files.map(file => getFileUrl(req, file.filename));
        
        // If replaceImages is true, replace all images; otherwise, add to existing
        if (req.body.replaceImages === 'true') {
          // Delete old images
          if (service.images && service.images.length > 0) {
            service.images.forEach(imageUrl => {
              const filename = path.basename(imageUrl);
              const filepath = path.join(__dirname, '../../uploads/services', filename);
              deleteFile(filepath).catch(console.error);
            });
          }
          req.body.images = newImages;
        } else {
          req.body.images = [...(service.images || []), ...newImages];
        }
      }
      
      // Remove fields that shouldn't be updated
      delete req.body.sitter;
      delete req.body.rating;
      delete req.body.totalBookings;
      delete req.body.replaceImages;
      
      service = await Service.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
      }).populate('sitter', 'name avatar bio rating experience');
      
      res.status(200).json({
        status: 'success',
        data: {
          service
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

// @desc    Delete service image
// @route   DELETE /api/services/:id/images/:imageIndex
// @access  Private (Sitter only)
const deleteImage = async (req, res, next) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      sitter: req.user.id
    });
    
    if (!service) {
      return res.status(404).json({
        status: 'fail',
        message: 'No service found with that ID'
      });
    }
    
    const imageIndex = parseInt(req.params.imageIndex);
    
    if (imageIndex < 0 || imageIndex >= service.images.length) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid image index'
      });
    }
    
    // Delete image file
    const imageUrl = service.images[imageIndex];
    const filename = path.basename(imageUrl);
    const filepath = path.join(__dirname, '../../uploads/services', filename);
    
    try {
      await deleteFile(filepath);
    } catch (fileError) {
      console.error('Error deleting image file:', fileError);
    }
    
    // Remove image from array
    service.images.splice(imageIndex, 1);
    await service.save();
    
    res.status(200).json({
      status: 'success',
      data: {
        service
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete service (soft delete)
// @route   DELETE /api/services/:id
// @access  Private (Sitter only)
const deleteService = async (req, res, next) => {
  try {
    const service = await Service.findOne({
      _id: req.params.id,
      sitter: req.user.id
    });
    
    if (!service) {
      return res.status(404).json({
        status: 'fail',
        message: 'No service found with that ID'
      });
    }
    
    // Soft delete - set isActive to false
    service.isActive = false;
    await service.save();
    
    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get service statistics for dashboard
// @route   GET /api/services/stats
// @access  Private (Sitter only)
const getServiceStats = async (req, res, next) => {
  try {
    const stats = await Service.aggregate([
      {
        $match: { 
          sitter: req.user._id,
          isActive: true
        }
      },
      {
        $group: {
          _id: '$serviceType',
          count: { $sum: 1 },
          avgPrice: { $avg: '$price' },
          avgRating: { $avg: '$rating.average' },
          totalBookings: { $sum: '$totalBookings' }
        }
      },
      {
        $sort: { count: -1 }
      }
    ]);
    
    const totalServices = await Service.countDocuments({ 
      sitter: req.user.id, 
      isActive: true 
    });
    
    res.status(200).json({
      status: 'success',
      data: {
        totalServices,
        serviceBreakdown: stats
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Search services with advanced filters
// @route   GET /api/services/search
// @access  Public
const searchServices = async (req, res, next) => {
  try {
    const {
      query: searchQuery,
      serviceType,
      petType,
      city,
      state,
      minPrice,
      maxPrice,
      rating,
      availability,
      instantBooking,
      page = 1,
      limit = 10,
      sort = '-rating.average'
    } = req.query;
    
    let query = { isActive: true };
    
    // Text search
    if (searchQuery) {
      query.$text = { $search: searchQuery };
    }
    
    // Filters
    if (serviceType) query.serviceType = serviceType;
    if (petType) query.petTypes = petType;
    if (city) query['location.city'] = new RegExp(city, 'i');
    if (state) query['location.state'] = new RegExp(state, 'i');
    if (instantBooking === 'true') query.instantBooking = true;
    
    // Price range
    if (minPrice || maxPrice) {
      query.price = {};
      if (minPrice) query.price.$gte = parseFloat(minPrice);
      if (maxPrice) query.price.$lte = parseFloat(maxPrice);
    }
    
    // Rating filter
    if (rating) {
      query['rating.average'] = { $gte: parseFloat(rating) };
    }
    
    // Build sort object
    let sortObj = {};
    if (sort.startsWith('-')) {
      sortObj[sort.substring(1)] = -1;
    } else {
      sortObj[sort] = 1;
    }
    
    const skip = (parseInt(page) - 1) * parseInt(limit);
    
    const services = await Service.find(query)
      .populate('sitter', 'name avatar bio rating experience')
      .sort(sortObj)
      .skip(skip)
      .limit(parseInt(limit));
    
    const total = await Service.countDocuments(query);
    
    res.status(200).json({
      status: 'success',
      results: services.length,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / parseInt(limit)),
        total
      },
      data: {
        services
      }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getServices,
  getService,
  getMyServices,
  createService,
  updateService,
  deleteImage,
  deleteService,
  getServiceStats,
  searchServices
};

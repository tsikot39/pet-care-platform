const express = require('express');
const serviceController = require('../controllers/serviceController');
const { protect, restrictTo, optionalAuth } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../utils/validation');

const router = express.Router();

// Public routes
router.get('/', optionalAuth, serviceController.getServices);
router.get('/search', serviceController.searchServices);
router.get('/:id', serviceController.getService);

// Protected routes (require authentication)
router.use(protect);

// Routes for sitters only
router.get('/my/services', restrictTo('sitter'), serviceController.getMyServices);
router.get('/my/stats', restrictTo('sitter'), serviceController.getServiceStats);

router
  .route('/my')
  .post(restrictTo('sitter'), validate(schemas.service), serviceController.createService);

router
  .route('/:id/manage')
  .put(restrictTo('sitter'), validate(schemas.service), serviceController.updateService)
  .delete(restrictTo('sitter'), serviceController.deleteService);

// Image management for sitters
router.delete('/:id/images/:imageIndex', restrictTo('sitter'), serviceController.deleteImage);

module.exports = router;

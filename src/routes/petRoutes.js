const express = require('express');
const petController = require('../controllers/petController');
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../utils/validation');

const router = express.Router();

// Middleware to preprocess FormData for validation
const preprocessPetData = (req, res, next) => {
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
  
  // Remove empty string fields
  Object.keys(req.body).forEach(key => {
    if (req.body[key] === '' || req.body[key] === null) {
      delete req.body[key];
    }
  });
  
  console.log('Preprocessed pet data:', req.body); // Debug log
  next();
};

// All routes require authentication
router.use(protect);

// Only pet owners can access these routes
router.use(restrictTo('owner'));

// Pet statistics
router.get('/stats', petController.getPetStats);

// CRUD operations for pets
router
  .route('/')
  .get(petController.getPets)
  .post(petController.createPet);

router
  .route('/:id')
  .get(petController.getPet)
  .put(petController.updatePet)
  .delete(petController.deletePet);

// Photo management
router.delete('/:id/photos/:photoIndex', petController.deletePhoto);

module.exports = router;

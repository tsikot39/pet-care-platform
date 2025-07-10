const express = require('express');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');
const { validate, schemas } = require('../utils/validation');

const router = express.Router();

// Public routes
router.post('/register', validate(schemas.register), authController.register);
router.post('/login', validate(schemas.login), authController.login);
router.post('/forgotPassword', authController.forgotPassword);

// Protected routes (require authentication)
router.use(protect); // All routes after this middleware are protected

router.get('/me', authController.getMe);
router.put('/me', validate(schemas.updateUser), authController.updateMe);
router.delete('/me', authController.deleteMe);
router.put('/updatePassword', authController.updatePassword);
router.post('/logout', authController.logout);

module.exports = router;

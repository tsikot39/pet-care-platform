const User = require('../models/User');
const jwt = require('jsonwebtoken');

// Helper function to create and send token
const createSendToken = (user, statusCode, res, message) => {
  const token = user.generateAuthToken();
  
  // Remove password from output
  user.password = undefined;
  
  res.status(statusCode).json({
    status: 'success',
    token,
    message,
    data: {
      user
    }
  });
};

// @desc    Register new user
// @route   POST /api/auth/register
// @access  Public
const register = async (req, res, next) => {
  try {
    const { name, email, password, role, phone, bio } = req.body;
    
    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'User with this email already exists'
      });
    }
    
    // Create new user
    const newUser = await User.create({
      name,
      email,
      password,
      role,
      phone,
      bio
    });
    
    createSendToken(newUser, 201, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    // Find user and check password
    const user = await User.findByCredentials(email, password);
    
    // Update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });
    
    createSendToken(user, 200, res);
  } catch (error) {
    return res.status(401).json({
      status: 'fail',
      message: 'Invalid email or password'
    });
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id)
      .populate('pets')
      .populate('services');
    
    res.status(200).json({
      status: 'success',
      data: {
        user
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update current user profile
// @route   PUT /api/auth/me
// @access  Private
const updateMe = async (req, res, next) => {
  try {
    // Don't allow password updates through this route
    if (req.body.password) {
      return res.status(400).json({
        status: 'fail',
        message: 'This route is not for password updates. Please use /updatePassword.'
      });
    }
    
    // Filter out unwanted fields
    const allowedFields = [
      'name', 'phone', 'bio', 'address', 'experience', 
      'certifications', 'hourlyRate', 'emergencyContact'
    ];
    
    const filteredBody = {};
    Object.keys(req.body).forEach(key => {
      if (allowedFields.includes(key)) {
        filteredBody[key] = req.body[key];
      }
    });
    
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      filteredBody,
      {
        new: true,
        runValidators: true
      }
    );
    
    res.status(200).json({
      status: 'success',
      data: {
        user: updatedUser
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatePassword
// @access  Private
const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide current password and new password'
      });
    }
    
    // Get user with password
    const user = await User.findById(req.user.id).select('+password');
    
    // Check if current password is correct
    if (!(await user.correctPassword(currentPassword, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Your current password is incorrect'
      });
    }
    
    // Update password
    user.password = newPassword;
    await user.save();
    
    createSendToken(user, 200, res);
  } catch (error) {
    next(error);
  }
};

// @desc    Deactivate user account
// @route   DELETE /api/auth/me
// @access  Private
const deleteMe = async (req, res, next) => {
  try {
    await User.findByIdAndUpdate(req.user.id, { isActive: false });
    
    res.status(200).json({
      status: 'success',
      message: 'Account deactivated successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Forgot password (placeholder)
// @route   POST /api/auth/forgotPassword
// @access  Public
const forgotPassword = async (req, res, next) => {
  try {
    // This is a placeholder for future implementation
    // In a real application, you would:
    // 1. Generate a random reset token
    // 2. Save it to the user document (with expiration)
    // 3. Send email with reset link
    
    res.status(200).json({
      status: 'success',
      message: 'Password reset functionality will be implemented soon. Please contact support for assistance.'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user
// @route   POST /api/auth/logout
// @access  Private
const logout = async (req, res, next) => {
  try {
    // Since we're using JWT, we can't really "logout" server-side
    // In a real application, you might:
    // 1. Blacklist the token
    // 2. Set a short expiration time
    // 3. Use refresh tokens
    
    res.status(200).json({
      status: 'success',
      message: 'Logged out successfully'
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Reactivate user account
// @route   PUT /api/auth/reactivate
// @access  Public (requires email and password)
/**
 * @swagger
 * /api/auth/reactivate:
 *   put:
 *     summary: Reactivate a deactivated user account
 *     tags: [Authentication]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *                 example: john@example.com
 *               password:
 *                 type: string
 *                 example: password123
 *     responses:
 *       200:
 *         description: Account reactivated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 message:
 *                   type: string
 *                   example: Account reactivated successfully! Welcome back.
 *                 token:
 *                   type: string
 *                   example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
 *                 data:
 *                   type: object
 *                   properties:
 *                     user:
 *                       $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing email or password
 *       401:
 *         description: Invalid password
 *       404:
 *         description: No deactivated account found with that email
 */
const reactivateAccount = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password'
      });
    }
    
    // Find the deactivated user
    const user = await User.findOne({ 
      email: email.toLowerCase(),
      isActive: false 
    }).select('+password');
    
    if (!user) {
      return res.status(404).json({
        status: 'fail',
        message: 'No deactivated account found with that email address'
      });
    }
    
    // Check password
    if (!(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid password'
      });
    }
    
    // Reactivate the account
    await User.findByIdAndUpdate(user._id, { 
      isActive: true,
      updatedAt: new Date()
    });
    
    // Generate new token for the reactivated user
    const reactivatedUser = await User.findById(user._id);
    createSendToken(reactivatedUser, 200, res, 'Account reactivated successfully! Welcome back.');
    
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  getMe,
  updateMe,
  updatePassword,
  deleteMe,
  forgotPassword,
  logout,
  reactivateAccount
};

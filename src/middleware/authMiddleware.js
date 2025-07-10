const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware to protect routes - verify JWT token
const protect = async (req, res, next) => {
  try {
    let token;

    // Check if token exists in Authorization header
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        status: 'fail',
        message: 'You are not logged in! Please log in to get access.'
      });
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: 'fail',
        message: 'The user belonging to this token no longer exists.'
      });
    }

    // Check if user is active
    if (!currentUser.isActive) {
      return res.status(401).json({
        status: 'fail',
        message: 'Your account has been deactivated. Please contact support.'
      });
    }

    // Grant access to protected route
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Invalid token. Please log in again!'
      });
    } else if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        status: 'fail',
        message: 'Your token has expired! Please log in again.'
      });
    }

    return res.status(500).json({
      status: 'error',
      message: 'Something went wrong during authentication'
    });
  }
};

// Middleware to restrict access based on user roles
const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      // Provide specific error messages based on context
      let message = 'You do not have permission to perform this action';
      
      if (roles.includes('sitter') && req.user.role === 'owner') {
        message = 'Only pet sitters can perform this action. Pet owners cannot create or manage services.';
      } else if (roles.includes('owner') && req.user.role === 'sitter') {
        message = 'Only pet owners can perform this action. Sitters cannot manage pets.';
      }
      
      return res.status(403).json({
        status: 'fail',
        message: message,
        userRole: req.user.role,
        requiredRoles: roles
      });
    }
    next();
  };
};

// Middleware to check if user owns the resource
const checkOwnership = (resourceField = 'owner') => {
  return (req, res, next) => {
    // This will be used in route handlers to verify ownership
    req.checkOwnership = resourceField;
    next();
  };
};

// Optional authentication - doesn't fail if no token
const optionalAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
      
      if (token) {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const currentUser = await User.findById(decoded.id);
        
        if (currentUser && currentUser.isActive) {
          req.user = currentUser;
        }
      }
    }
    
    next();
  } catch (error) {
    // Continue without authentication if token is invalid
    next();
  }
};

module.exports = {
  protect,
  restrictTo,
  checkOwnership,
  optionalAuth
};

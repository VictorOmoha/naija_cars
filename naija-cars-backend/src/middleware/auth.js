const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

/**
 * Middleware to verify JWT token and attach user to request
 */
const authenticate = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'No authentication token provided'
        }
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: {
        profile: true
      }
    });

    if (!user) {
      return res.status(401).json({
        success: false,
        error: {
          message: 'User not found'
        }
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'Account has been deactivated'
        }
      });
    }

    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      userType: user.userType,
      isVerified: user.isVerified,
      profile: user.profile
    };

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Invalid token'
        }
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        error: {
          message: 'Token expired'
        }
      });
    }

    return res.status(500).json({
      success: false,
      error: {
        message: 'Authentication failed'
      }
    });
  }
};

/**
 * Middleware to check if user is verified
 */
const requireVerified = (req, res, next) => {
  if (!req.user.isVerified) {
    return res.status(403).json({
      success: false,
      error: {
        message: 'Please verify your account to access this resource'
      }
    });
  }
  next();
};

/**
 * Middleware to check user type/role
 */
const requireUserType = (...allowedTypes) => {
  return (req, res, next) => {
    if (!allowedTypes.includes(req.user.userType)) {
      return res.status(403).json({
        success: false,
        error: {
          message: 'You do not have permission to access this resource'
        }
      });
    }
    next();
  };
};

/**
 * Optional authentication - attach user if token exists but don't require it
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return next(); // No token, continue without user
    }

    const token = authHeader.substring(7);
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      include: { profile: true }
    });

    if (user && user.isActive) {
      req.user = {
        id: user.id,
        email: user.email,
        userType: user.userType,
        isVerified: user.isVerified,
        profile: user.profile
      };
    }
  } catch (error) {
    // Ignore errors, just continue without user
  }

  next();
};

module.exports = {
  authenticate,
  requireVerified,
  requireUserType,
  optionalAuth
};

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const cookieParser = require('cookie-parser');
const prisma = require('./lib/prisma');

const app = express();

// Render terminates HTTPS and forwards requests through one trusted proxy.
// Trust that hop so req.ip and the authentication rate limiters identify the
// actual client instead of grouping every request under Render's proxy.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL,
  'https://www.naijacars.online',
  'https://naijacars.online'
].filter(Boolean);

const normalizeOrigin = (origin) => origin?.replace(/\/$/, '');
const normalizedAllowedOrigins = allowedOrigins.map(normalizeOrigin);
const isAllowedOrigin = (origin) => normalizedAllowedOrigins.includes(normalizeOrigin(origin));

// Set CORS headers before any middleware can short-circuit a request.
app.use((req, res, next) => {
  const origin = req.headers.origin;

  if (origin && isAllowedOrigin(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
    res.setHeader('Access-Control-Allow-Credentials', 'true');
    res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,PATCH,OPTIONS');
    res.setHeader(
      'Access-Control-Allow-Headers',
      req.headers['access-control-request-headers'] || 'Content-Type,Authorization'
    );
    res.setHeader('Access-Control-Max-Age', '86400');
    res.setHeader('Vary', 'Origin');
  }

  if (req.method === 'OPTIONS') {
    return res.sendStatus(204);
  }

  next();
});

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    const normalizedOrigin = normalizeOrigin(origin);

    if (normalizedAllowedOrigins.includes(normalizedOrigin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
};

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));

// Security middleware
app.use(helmet({
  // User-uploaded fallback media is served from the API domain and embedded
  // by the web app domain, so static images must be loadable cross-origin.
  crossOriginResourcePolicy: { policy: 'cross-origin' }
}));

// Rate limiting - general API limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 500,
  message: {
    success: false,
    error: {
      message: 'Too many requests from this IP, please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => req.path === '/api/health' || req.path === '/health',
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  }
});
app.use('/api/', limiter);

// Strict rate limiting for auth endpoints (brute force protection)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // 15 attempts per window
  message: {
    success: false,
    error: {
      message: 'Too many authentication attempts. Please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  }
});
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/register', authLimiter);

// Strict rate limiting for OTP endpoints (SMS bombing protection)
const otpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // 5 OTP requests per 15 minutes
  message: {
    success: false,
    error: {
      message: 'Too many OTP requests. Please try again later.'
    }
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res, next, options) => {
    res.status(options.statusCode).json(options.message);
  }
});
app.use('/api/auth/send-otp', otpLimiter);
app.use('/api/auth/verify-otp', otpLimiter);

// Static files — serves public/ for local avatar uploads (dev fallback)
const path = require('path');
app.use(express.static(path.join(__dirname, '../public')));

// Raw body for Paystack webhook signature verification (must come before express.json)
app.use('/api/subscriptions/webhook', express.raw({ type: 'application/json' }));

// Body parsing
app.use(express.json({ limit: '25mb' }));
app.use(express.urlencoded({ extended: true, limit: '25mb' }));
app.use(cookieParser());

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Compression
app.use(compression());

// Health check endpoints
const healthHandler = async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({
      status: 'ok',
      database: 'ok',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  } catch (error) {
    res.status(503).json({
      status: 'error',
      database: 'unavailable',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV
    });
  }
};

app.get('/health', healthHandler);
app.get('/api/health', healthHandler);

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/users', require('./routes/users'));
app.use('/api/listings', require('./routes/listings'));
app.use('/api/media', require('./routes/media'));
app.use('/api/messages', require('./routes/messages'));
app.use('/api/bookings', require('./routes/bookings'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/subscriptions', require('./routes/subscriptions'));
app.use('/api/contact', require('./routes/contact'));

// Social share / OG proxy — serves rich HTML to bots, redirects browsers to SPA
// No CORS or auth needed — these are public HTML pages for link previews
app.use('/share', require('./routes/share'));
// app.use('/api/search', require('./routes/search'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: {
      message: 'Route not found',
      path: req.originalUrl
    }
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);

  // Prisma errors
  if (err.code === 'P2002') {
    return res.status(400).json({
      success: false,
      error: {
        message: 'A record with this information already exists',
        field: err.meta?.target
      }
    });
  }

  if (err.code === 'P2025') {
    return res.status(404).json({
      success: false,
      error: {
        message: 'Record not found'
      }
    });
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Invalid token'
      }
    });
  }

  if (err.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      error: {
        message: 'Token expired'
      }
    });
  }

  // Validation errors
  if (err.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      error: {
        message: err.message,
        details: err.errors
      }
    });
  }

  const statusCode = err.status || 500;
  const isProductionServerError = process.env.NODE_ENV === 'production' && statusCode >= 500;

  // Default error
  res.status(statusCode).json({
    success: false,
    error: {
      message: isProductionServerError ? 'Internal Server Error' : (err.message || 'Internal Server Error'),
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
    }
  });
});

module.exports = app;

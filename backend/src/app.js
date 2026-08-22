const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const { port, frontendUrl, corsOrigins, rateLimitWindowMs, rateLimitMaxRequests, nodeEnv } = require('./config/env');
const authRoutes = require('./routes/auth.routes');
const contactRoutes = require('./routes/contact.routes');
const settingsRoutes = require('./routes/settings.routes');
const testimonialRoutes = require('./routes/testimonial.routes');
const productRoutes = require('./routes/product.routes');
const countryRoutes = require('./routes/country.routes');
const { errorHandler } = require('./middlewares/error.middleware');
const prisma = require('./config/db');

const app = express();
const allowedOrigins = [...new Set([...corsOrigins, frontendUrl])].filter(Boolean);

app.disable('x-powered-by');
app.use(helmet({
  crossOriginResourcePolicy: false,
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      imgSrc: ["'self'", 'data:', 'https:'],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", ...allowedOrigins],
      frameAncestors: ["'none'"],
    },
  },
}));
app.use(cors({
  origin(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(new Error('Origin not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use((req, res, next) => {
  const stateChangingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
  const requestOrigin = req.get('origin');

  if (stateChangingMethods.includes(req.method) && requestOrigin && !allowedOrigins.includes(requestOrigin)) {
    return res.status(403).json({ success: false, message: 'Origin not allowed' });
  }

  return next();
});
app.use(morgan(nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));

const limiter = rateLimit({
  windowMs: rateLimitWindowMs,
  max: rateLimitMaxRequests,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
  skip: (req) => req.method === 'GET' || (req.method === 'PUT' && req.originalUrl.startsWith('/api/settings')),
  handler: (req, res) => {
    return res.status(429).json({
      success: false,
      message: 'Too many requests. Please try again later.',
      retryAfter: req.rateLimit.resetTime,
    });
  },
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many login attempts. Please try again later.' },
});

const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 30,
  standardHeaders: true,
  legacyHeaders: false,
  message: { success: false, message: 'Too many contact submissions. Please try again later.' },
});

app.use(limiter);
app.use('/api/auth/login', authLimiter);
app.use('/api/auth/refresh', authLimiter);
app.use('/api/messages', contactLimiter);

app.get('/health', async (req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    return res.status(200).json({ success: true, status: 'ok' });
  } catch (error) {
    if (nodeEnv !== 'production') console.error('Health check failed:', error.message);
    return res.status(503).json({ success: false, status: 'unavailable' });
  }
});
app.use('/api/auth', authRoutes);
app.use('/api/messages', contactRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/testimonials', testimonialRoutes);
app.use('/api/products', productRoutes);
app.use('/api/countries', countryRoutes);

app.use((req, res) => {
  return res.status(404).json({ success: false, message: 'Route not found' });
});
app.use(errorHandler);

module.exports = { app, port };

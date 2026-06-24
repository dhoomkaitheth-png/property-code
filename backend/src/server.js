const express = require('express');
const cors = require('cors');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const { testConnection } = require('./config/database');
const { setupChatSocket } = require('./socket/chatSocket');

// Import routes
const locationRoutes = require('./routes/locationRoutes');
const propertyRoutes = require('./routes/propertyRoutes');
const adminRoutes = require('./routes/adminRoutes');
const userRoutes = require('./routes/userRoutes');
const favoriteRoutes = require('./routes/favoriteRoutes');
const leadRoutes = require('./routes/leadRoutes');
const chatRoutes = require('./routes/chatRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const blogRoutes = require('./routes/blogRoutes');
const otpRoutes = require('./routes/otpRoutes');
const passwordResetRoutes = require('./routes/passwordResetRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const contactEnquiryRoutes = require('./routes/contactEnquiryRoutes');
const scheduledVisitRoutes = require('./routes/scheduledVisitRoutes');
const propertyReportRoutes = require('./routes/propertyReportRoutes');
const webRoutes = require('./routes/webRoutes');

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// EJS template engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../templates'));

// EJS locals for formatting
app.locals.formatNumber = (num) => {
  if (!num && num !== 0) return '0';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
};

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: process.env.CORS_ORIGIN || '*',
    methods: ['GET', 'POST'],
    credentials: true
  },
  pingTimeout: 60000,
  pingInterval: 25000
});

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || '*',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Request logging middleware
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} - ${res.statusCode} (${duration}ms)`);
  });
  next();
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'Uttarakhand Real Estate API is running',
    version: '2.0.0',
    timestamp: new Date().toISOString(),
    state: 'Uttarakhand',
    features: {
      chat: true,
      favorites: true,
      leads: true,
      notifications: true,
      auth: true
    }
  });
});

// Serve static files (CSS, JS)
app.use(express.static(path.join(__dirname, '../public')));

// API Routes
app.use('/api/locations', locationRoutes);
app.use('/api/properties', propertyRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/auth', userRoutes);
app.use('/api/favorites', favoriteRoutes);
app.use('/api/leads', leadRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/notifications', notificationRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/blogs', blogRoutes);
app.use('/api/otp', otpRoutes);
app.use('/api/password-reset', passwordResetRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/contact-enquiries', contactEnquiryRoutes);
app.use('/api/visits', scheduledVisitRoutes);
app.use('/api/reports', propertyReportRoutes);

// Web Routes (HTML templates)
app.use('/', webRoutes);

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Route not found',
    message: `Cannot ${req.method} ${req.originalUrl}`
  });
});

// Global error handler
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  
  if (err.name === 'MulterError') {
    if (err.code === 'LIMIT_FILE_SIZE') {
      return res.status(400).json({ success: false, error: 'File too large' });
    }
    return res.status(400).json({ success: false, error: err.message });
  }

  res.status(err.status || 500).json({
    success: false,
    error: process.env.NODE_ENV === 'production' ? 'Internal server error' : err.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
});

// Setup Socket.IO chat
setupChatSocket(io);

// Start server
const startServer = async () => {
  const dbConnected = await testConnection();
  
  server.listen(PORT, () => {
    console.log(`
╔══════════════════════════════════════════════╗
║     Uttarakhand Real Estate API Server      ║
╠══════════════════════════════════════════════╣
║  Status: ${dbConnected ? '✅ Running' : '❌ DB Disconnected'}                    ║
║  Port:   ${PORT}                              ║
║  State:  Uttarakhand                         ║
║  Mode:   ${process.env.NODE_ENV || 'development'}                        ║
║  Socket: ✅ Real-time Chat                   ║
║  Version: 2.0.0                              ║
╚══════════════════════════════════════════════╝
    `);
  });
};

startServer();

module.exports = app;
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { initDb, isPostgres } = require('./config/db');

// Route handlers
const authRoutes = require('./routes/auth.routes');
const dashboardRoutes = require('./routes/dashboard.routes');
const collegeRoutes = require('./routes/college.routes');
const userRoutes = require('./routes/user.routes');
const courseRoutes = require('./routes/course.routes');
const announcementRoutes = require('./routes/announcement.routes');
const rvsRoutes = require('./routes/rvs.routes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middlewares
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173', 'http://localhost:3000'],
  credentials: true
}));
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/colleges', collegeRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/rvs', rvsRoutes);

// Direct Aliases
app.use('/api/students', (req, res, next) => { req.url = '/students' + req.url; rvsRoutes(req, res, next); });
app.use('/api/faculty', (req, res, next) => { req.url = '/faculty' + req.url; rvsRoutes(req, res, next); });
app.use('/api/departments', (req, res, next) => { req.url = '/departments' + req.url; rvsRoutes(req, res, next); });

// Root API Landing Page for Browser Visitors
app.get('/', (req, res) => {
  res.send(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>RVS Smart Campus Management System — API Service</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
          background: #0a192f;
          color: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          min-h: 100vh;
          margin: 0;
          padding: 24px;
        }
        .card {
          background: #0f2347;
          border: 1px solid #1e3a8a;
          border-radius: 20px;
          padding: 36px;
          max-width: 600px;
          width: 100%;
          box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
          text-align: center;
        }
        .badge {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(16, 185, 129, 0.15);
          color: #34d399;
          border: 1px solid rgba(52, 211, 153, 0.3);
          padding: 6px 14px;
          border-radius: 9999px;
          font-size: 12px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 20px;
        }
        .dot {
          width: 8px;
          height: 8px;
          background: #10b981;
          border-radius: 50%;
          box-shadow: 0 0 10px #10b981;
        }
        h1 {
          color: #ffffff;
          font-size: 22px;
          margin: 0 0 8px 0;
          font-weight: 800;
        }
        p {
          color: #94a3b8;
          font-size: 13px;
          margin: 0 0 24px 0;
          line-height: 1.6;
        }
        .btn {
          display: inline-block;
          background: #f59e0b;
          color: #0f172a;
          font-weight: 800;
          font-size: 14px;
          padding: 12px 28px;
          border-radius: 12px;
          text-decoration: none;
          transition: all 0.2s ease;
          box-shadow: 0 4px 14px rgba(245, 158, 11, 0.3);
        }
        .btn:hover {
          background: #fbbf24;
          transform: translateY(-1px);
        }
        .grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-top: 28px;
          text-align: left;
        }
        .stat-box {
          background: #071324;
          border: 1px solid #1e293b;
          padding: 12px 16px;
          border-radius: 12px;
        }
        .stat-box label {
          display: block;
          font-size: 10px;
          color: #64748b;
          font-weight: 700;
          text-transform: uppercase;
        }
        .stat-box span {
          font-size: 12px;
          color: #cbd5e1;
          font-weight: 600;
        }
      </style>
    </head>
    <body>
      <div class="card">
        <div class="badge">
          <span class="dot"></span>
          Backend API Service Online
        </div>
        <h1>RVS College of Engineering & Technology</h1>
        <p>Official Campus Operations & Smart ERP API Gateway. The web application frontend is running live on Port 5173.</p>
        <a href="http://localhost:5173" class="btn">Launch Frontend Application (Port 5173) &rarr;</a>

        <div class="grid">
          <div class="stat-box">
            <label>API Service</label>
            <span>HTTP 200 OK (Port 5000)</span>
          </div>
          <div class="stat-box">
            <label>Database Engine</label>
            <span>${isPostgres ? 'PostgreSQL Engine' : 'Embedded Relational Store'}</span>
          </div>
          <div class="stat-box">
            <label>Health Endpoint</label>
            <span><a href="/api/health" style="color: #60a5fa; text-decoration: none;">/api/health</a></span>
          </div>
          <div class="stat-box">
            <label>Public College Info</label>
            <span><a href="/api/rvs/public-info" style="color: #60a5fa; text-decoration: none;">/api/rvs/public-info</a></span>
          </div>
        </div>
      </div>
    </body>
    </html>
  `);
});

// Root /api Status
app.get('/api', (req, res) => {
  res.json({
    success: true,
    message: 'RVS Smart Campus Management System API Gateway',
    frontend_url: 'http://localhost:5173',
    health_url: 'http://localhost:5000/api/health',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    service: 'CampusIQ API',
    database: isPostgres ? 'PostgreSQL (Active)' : 'Embedded Relational Engine (Active)'
  });
});

// Centralized error handler
app.use((err, req, res, next) => {
  console.error('[Unhandled Exception]:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Internal server error occurred',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start Server
const startServer = async () => {
  try {
    await initDb();
    app.listen(PORT, () => {
      console.log(`🚀 [CampusIQ Backend] Running on http://localhost:${PORT}`);
      console.log(`🔐 [Security] JWT Authentication & Role-Based Access Control Enabled`);
      console.log(`📡 [Health] Status available at http://localhost:${PORT}/api/health`);
    });
  } catch (err) {
    console.error('❌ Failed to start server:', err);
    process.exit(1);
  }
};

startServer();

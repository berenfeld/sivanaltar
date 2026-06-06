const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const authRoutes = require('./routes/auth');
const entityRoutes = require('./routes/entities');
const uploadRoutes = require('./routes/upload');
const integrationRoutes = require('./routes/integrations');
const functionRoutes = require('./routes/functions');

const app = express();
const PORT = process.env.PORT || 3001;

// Allowed origins: the VM IP, the domain, and local dev
const allowedOrigins = [
  'http://51.102.220.193',
  'https://sivanaltar.com',
  'https://www.sivanaltar.com',
  'http://localhost:5173',
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error('Not allowed by CORS'));
  },
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());

// Serve uploaded files
const uploadsDir = process.env.UPLOADS_DIR || '/var/www/sivanaltar/uploads';
app.use('/uploads', express.static(uploadsDir));

// API routes
app.use('/api/auth', authRoutes);
app.use('/api/entities', entityRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/integrations', integrationRoutes);
app.use('/api/functions', functionRoutes);

// Health check
app.get('/api/health', (req, res) => res.json({ ok: true }));

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

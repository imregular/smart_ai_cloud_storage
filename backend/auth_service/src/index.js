const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const authRoutes = require('./routes/auth.routes');
const imageRoutes = require('./routes/image.routes');
const cors = require('cors');
const multer = require('multer');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/images', imageRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
    // Multer-specific errors
    return res.status(400).json({ error: err.message, type: 'MulterError' });
  } else if (err) {
    // Other errors
    console.error('Global error:', err);
    return res.status(500).json({ error: err.message || 'Internal Server Error' });
  }
  next();
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth_service' });
});

app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});

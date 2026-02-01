const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const authRoutes = require('./routes/auth.routes');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', service: 'auth_service' });
});

app.listen(PORT, () => {
  console.log(`Auth service running on port ${PORT}`);
});

const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');
const rateLimit = require('express-rate-limit');

dotenv.config();

const authController = require('./controllers/authController');
const voteController = require('./controllers/voteController');

const app = express();
app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});

app.use(limiter);

// Database Connection
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eloktantra';
mongoose.connect(MONGO_URI)
  .then(() => console.log('MongoDB Connected to 127.0.0.1'))
  .catch(err => console.error('MongoDB Connection Error:', err));

// Middleware for Device Check
app.use((req, res, next) => {
  const userAgent = req.headers['user-agent'] || 'unknown';
  req.deviceId = Buffer.from(userAgent).toString('base64');
  next();
});

// Routes
app.get('/auth/digilocker/callback', authController.digilockerCallback);
app.post('/verify-face', authController.faceVerify);
app.post('/risk/evaluate', voteController.evaluateRisk);
app.post('/generate-token', voteController.generateVotingToken);

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`Backend Server running on http://localhost:${PORT}`);
});

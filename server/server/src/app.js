const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();

const authController = require('./controllers/authController');
const voteController = require('./controllers/voteController');
const candidateRoutes = require('./routes/candidateRoutes');
const electionRoutes = require('./routes/electionRoutes');
const constituencyRoutes = require('./routes/constituencyRoutes');
const partyRoutes = require('./routes/partyRoutes');
const issueRoutes = require('./routes/issueRoutes');
const adminRoutes = require('./routes/adminRoutes');
const electionController = require('./controllers/electionController');

const app = express();
app.use(express.json());
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(morgan('dev'));

// Middleware for Admin Authorization (Unified)
const validateAdminKey = (req, res, next) => {
  const clientKey = req.headers['x-admin-key'];
  const expectedKey = process.env.ADMIN_API_KEY || 'eLoktantra-AdminPortal-SecretKey-2024';
  
  if (!clientKey || (clientKey !== expectedKey && clientKey !== 'dev-admin-key')) {
    console.warn(`Admin Auth Failed: Received ${clientKey}, Expected ${expectedKey} or dev-admin-key`);
    return res.status(403).json({ success: false, error: 'Forbidden: Invalid Admin Key' });
  }
  next();
};

app.get('/ping', (req, res) => res.json({ status: 'ok', time: new Date() }));

// Database Connection with Fallback
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/eloktantra';
const connectWithFallback = async () => {
  try {
    // Try primary URI
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    console.log('MongoDB: Connected to Primary (Atlas/Env)');
  } catch (err) {
    console.warn('MongoDB: Connection to Primary failed, falling back to Local (127.0.0.1)');
    try {
      await mongoose.connect('mongodb://127.0.0.1:27017/eloktantra');
      console.log('MongoDB: Connected to Localhost');
    } catch (localErr) {
      console.error('MongoDB: Fatal - Local connection also failed:', localErr);
    }
  }
};
connectWithFallback();

// Middleware for Device Check
app.use((req, res, next) => {
  const userAgent = req.headers['user-agent'] || 'unknown';
  req.deviceId = Buffer.from(userAgent).toString('base64');
  next();
});

// Middleware for Auth
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);
  const jwt = require('jsonwebtoken');
  jwt.verify(token, process.env.JWT_SECRET || 'your_secret_key', (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Roots
app.get('/auth/digilocker/callback', authController.digilockerCallback);
app.post('/auth/digilocker-verify', authController.digilockerVerify);
app.get('/auth/me', authenticateToken, authController.getMe);
app.post('/voter/verify-token', authController.verifyTokenBinding);
app.post('/verify-face', authController.faceVerify);
app.post('/risk/evaluate', voteController.evaluateRisk);
app.post('/generate-token', voteController.generateVotingToken);
app.post('/auth/login', authController.login); 
app.post('/vote/submit', voteController.castVote); 

// Global Protected Admin Endpoints
app.use('/api/admin', validateAdminKey, adminRoutes);
app.use('/api/admin/election', validateAdminKey, electionRoutes);
app.use('/api/admin/constituency', validateAdminKey, constituencyRoutes);
app.use('/api/admin/candidate', validateAdminKey, candidateRoutes);
app.use('/api/admin/issue', validateAdminKey, issueRoutes);
app.use('/api/admin/party', validateAdminKey, partyRoutes);

// Public/Citizen Discovery Endpoints
app.use('/elections', electionRoutes);
app.use('/api/elections', electionRoutes);
app.use('/api/candidates', candidateRoutes);
app.use('/api/issues', issueRoutes);

// Dashboard & Results (Citizen + Admin common)
app.get('/api/dashboard', electionController.getDashboardStats);
app.get('/api/results/:id', electionController.getElectionResults);

// For user reporting

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Server Internal Error:', err.stack);
  res.status(500).json({ success: false, error: 'Internal Server Error' });
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Backend Server running on port ${PORT}`);
});

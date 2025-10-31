/**
 * Routes
 * Defines all API routes and connects them to controllers
 */

const express = require('express');
const router = express.Router();

// Middleware
const upload = require('../middleware/uploadMiddleware');
const { validateOffer, validateFileUpload } = require('../middleware/validator');

// Controllers
const offerController = require('../controllers/offerController');
const leadsController = require('../controllers/leadsController');
const scoringController = require('../controllers/scoringController');

// Health check
router.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString()
  });
});

// Offer routes
router.post('/offer', validateOffer, offerController.createOffer);
router.get('/offer', offerController.getOffer);

// Leads routes
router.post('/leads/upload', upload.single('file'), validateFileUpload, leadsController.uploadLeads);
router.get('/leads', leadsController.getLeads);

// Scoring routes
router.post('/score', scoringController.scoreLeads);
router.get('/results', scoringController.getResults);
router.get('/results/export', scoringController.exportResults);

module.exports = router;
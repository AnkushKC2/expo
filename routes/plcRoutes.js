const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const { apiLimiter }         = require('../middleware/rateLimiter');
const plcCtrl                = require('../controllers/plcController');

/* All PLC routes require authentication */
router.use(protect);

/* Read – any authenticated role */
router.get('/read', apiLimiter, plcCtrl.readPLC);

/* Write – admin and operator only */
router.post('/write', apiLimiter, authorize('admin', 'operator'), plcCtrl.writePLC);

module.exports = router;

const express = require('express');
const router  = express.Router();
const { protect } = require('../middleware/auth');
const dashCtrl    = require('../controllers/dashboardController');

router.get('/', protect, dashCtrl.getDashboard);

module.exports = router;

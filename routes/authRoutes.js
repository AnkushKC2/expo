const express  = require('express');
const router   = express.Router();
const { body } = require('express-validator');
const auth     = require('../controllers/authController');
const { loginLimiter } = require('../middleware/rateLimiter');

router.get ('/login',    auth.getLogin);
router.post('/login',    loginLimiter,
  [
    body('email').isEmail().withMessage('Valid email required'),
    body('password').notEmpty().withMessage('Password required'),
  ],
  auth.postLogin
);

router.get('/logout', auth.logout);

module.exports = router;

const jwt      = require('jsonwebtoken');
const { validationResult } = require('express-validator');
const User     = require('../models/User');
const AuditLog = require('../models/AuditLog');


/* ── Helper: sign JWT and set httpOnly cookie ── */
const sendToken = (res, user) => {
  const token = jwt.sign(
    { id: user.id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '8h' }
  );
  res.cookie('token', token, {
    httpOnly: true,
    secure:   process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge:   8 * 60 * 60 * 1000,
  });
  return token;
};

/* ── GET /auth/login ── */
exports.getLogin = (req, res) => {
  if (req.cookies?.token) return res.redirect('/dashboard');
  res.render('auth/login', { title: 'Login – CloudSCADA', error: null, layout: 'layouts/auth' });
};

/* ── POST /auth/login ── */
exports.postLogin = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('auth/login', { title: 'Login – CloudSCADA', error: errors.array()[0].msg, layout: 'layouts/auth' });
  }

  const { email, password } = req.body;
  try {
    const ok = await User.matchPassword(email, password);
    if (!ok) {
      await AuditLog.create({ email, action: 'LOGIN_FAILED', ip: req.ip, success: false });
      return res.render('auth/login', { title: 'Login – CloudSCADA', error: 'Invalid email or password.', layout: 'layouts/auth' });
    }

    const user = await User.findByEmail(email);
    if (!user.isActive) {
      return res.render('auth/login', { title: 'Login – CloudSCADA', error: 'Your account has been deactivated. Contact your administrator.', layout: 'layouts/auth' });
    }

    await User.updateLastLogin(user.email);
    req.session.currentUser = user;
    sendToken(res, user);
    await AuditLog.create({ user: user.id, email, action: 'LOGIN', ip: req.ip, success: true });
    res.redirect('/dashboard');
  } catch (err) {
    console.error(err);
    res.render('auth/login', { title: 'Login – CloudSCADA', error: 'Server error – try again.', layout: 'layouts/auth' });
  }
};

/* ── GET /auth/logout ── */
exports.logout = async (req, res) => {
  if (req.user) {
    await AuditLog.create({ user: req.user.id, email: req.user.email, action: 'LOGOUT', ip: req.ip });
  }
  res.clearCookie('token');
  res.redirect('/auth/login');
};

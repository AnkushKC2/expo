const jwt  = require('jsonwebtoken');
const User = require('../models/User');

/* ── Protect: verify JWT from cookie or Authorization header ── */
exports.protect = async (req, res, next) => {
  let token = req.cookies?.token;
  if (!token && req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    if (req.path.startsWith('/api/')) return res.status(401).json({ success: false, message: 'Not authenticated' });
    return res.redirect('/auth/login');
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user    = await User.findById(decoded.id);
    if (!user || !user.isActive) throw new Error('User not found or inactive');
    req.user = user;
    next();
  } catch (err) {
    res.clearCookie('token');
    if (req.path.startsWith('/api/')) return res.status(401).json({ success: false, message: 'Invalid or expired token' });
    return res.redirect('/auth/login');
  }
};

/* ── Role guard ── */
exports.authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    if (req.path.startsWith('/api/')) return res.status(403).json({ success: false, message: 'Forbidden – insufficient role' });
    return res.status(403).render('errors/403', { title: 'Access Denied', user: req.user });
  }
  next();
};

/* ── Attach user to res.locals for EJS ── */
exports.setLocals = (req, res, next) => {
    res.locals.currentUser = req.session.currentUser || null;
    next();
};
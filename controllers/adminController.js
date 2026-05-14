const bcrypt   = require('bcryptjs');
const User     = require('../models/User');
const AuditLog = require('../models/AuditLog');

/* ── GET /admin ── */
exports.getAdmin = async (req, res) => {
  try {
    const [users, logs] = await Promise.all([
      User.findAll(),
      AuditLog.findRecent(100),
    ]);
    res.render('admin/index', {
      title: 'Admin Panel – CloudSCADA',
      users, logs,
      user: req.user,
      layout: 'layouts/main',
    });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
};

/* ── POST /admin/users ── create new user ── */
exports.createUser = async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, message: 'Name, email and password are required' });
  }
  if (!['admin', 'operator', 'viewer'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
  }
  try {
    const user = await User.create({ name, email, password, role });
    await AuditLog.create({ user: req.user.id, email: req.user.email, action: 'USER_CREATED', ip: req.ip, success: true, detail: email });
    res.json({ success: true, message: `User ${email} created`, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
};

/* ── PATCH /admin/users/:id/role ── */
exports.updateRole = async (req, res) => {
  const { role } = req.body;
  if (!['admin', 'operator', 'viewer'].includes(role)) {
    return res.status(400).json({ success: false, message: 'Invalid role' });
  }
  try {
    const updated = await User.updateRole(req.params.id, role);
    if (!updated) return res.status(404).json({ success: false, message: 'User not found' });
    await AuditLog.create({ user: req.user.id, email: req.user.email, action: 'ROLE_CHANGED', ip: req.ip, success: true, detail: `${updated.email} → ${role}` });
    res.json({ success: true, message: `Role updated to ${role}` });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── PATCH /admin/users/:id/toggle ── */
exports.toggleActive = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot deactivate your own account' });
    }
    const updated = await User.toggleActive(req.params.id);
    if (!updated) return res.status(404).json({ success: false, message: 'User not found' });
    await AuditLog.create({ user: req.user.id, email: req.user.email, action: updated.isActive ? 'USER_ACTIVATED' : 'USER_DEACTIVATED', ip: req.ip, success: true });
    res.json({ success: true, isActive: updated.isActive });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

/* ── DELETE /admin/users/:id ── */
exports.deleteUser = async (req, res) => {
  try {
    if (req.params.id === req.user.id) {
      return res.status(400).json({ success: false, message: 'Cannot delete your own account' });
    }
    const deleted = await User.deleteById(req.params.id);
    if (!deleted) return res.status(404).json({ success: false, message: 'User not found' });
    await AuditLog.create({ user: req.user.id, email: req.user.email, action: 'USER_DELETED', ip: req.ip, success: true, detail: deleted.email });
    res.json({ success: true, message: 'User deleted' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

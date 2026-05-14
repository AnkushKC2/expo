/* ── GET /dashboard ── */
exports.getDashboard = (req, res) => {
  res.render('dashboard/index', {
    title:   'Gate Control Dashboard – CloudSCADA',
    user:    req.user,
    layout:  'layouts/main',
  });
};

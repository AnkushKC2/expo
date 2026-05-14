const express = require('express');
const router  = express.Router();
const { protect, authorize } = require('../middleware/auth');
const adminCtrl              = require('../controllers/adminController');

router.use(protect, authorize('admin'));

router.get ('/',                    adminCtrl.getAdmin);
router.post('/users',               adminCtrl.createUser);
router.patch('/users/:id/role',     adminCtrl.updateRole);
router.patch('/users/:id/toggle',   adminCtrl.toggleActive);
router.delete('/users/:id',         adminCtrl.deleteUser);

module.exports = router;

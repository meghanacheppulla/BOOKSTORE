const express = require('express');
const { protect, authorize } = require('../middleware/auth');
const { getProfile, updateProfile, getAllUsers } = require('../controllers/userController');

const router = express.Router();

router.get('/profile', protect, getProfile);
router.put('/profile', protect, updateProfile);

router.get('/', protect, authorize('admin'), getAllUsers);

module.exports = router;

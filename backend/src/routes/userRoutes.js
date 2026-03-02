const express = require('express');
const { authUser, getUserProfile, registerUser } = require('../controllers/userController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/login', authUser);
router.route('/profile').get(protect, getUserProfile);
router.route('/').post(protect, authorize('admin'), registerUser);

module.exports = router;

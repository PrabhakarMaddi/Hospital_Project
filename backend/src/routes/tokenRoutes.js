const express = require('express');
const { generateToken, getQueue, updateTokenStatus, getQueueStats } = require('../controllers/tokenController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/stats', protect, getQueueStats);

router.route('/')
    .get(protect, getQueue)
    .post(protect, authorize('admin', 'receptionist'), generateToken);

router.patch('/:id/status', protect, authorize('admin', 'doctor'), updateTokenStatus);

module.exports = router;

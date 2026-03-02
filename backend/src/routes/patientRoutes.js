const express = require('express');
const { registerPatient, getPatients, getPatientById } = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/authMiddleware');

const router = express.Router();

router.route('/')
    .get(protect, getPatients)
    .post(protect, authorize('admin', 'receptionist'), registerPatient);

router.route('/:id')
    .get(protect, getPatientById);

module.exports = router;

const Patient = require('../models/Patient');

// @desc  Register a new patient
// @route POST /api/patients
// @access Private (Receptionist/Admin)
const registerPatient = async (req, res) => {
    try {
        const { name, age, gender, phone, address } = req.body;

        const patient = await Patient.create({ name, age, gender, phone, address });
        res.status(201).json(patient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get all patients
// @route GET /api/patients
// @access Private
const getPatients = async (req, res) => {
    try {
        const { search } = req.query;
        let query = {};
        if (search) {
            query = {
                $or: [
                    { name: { $regex: search, $options: 'i' } },
                    { phone: { $regex: search, $options: 'i' } },
                ],
            };
        }
        const patients = await Patient.find(query).sort({ createdAt: -1 }).limit(50);
        res.json(patients);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get single patient
// @route GET /api/patients/:id
// @access Private
const getPatientById = async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) return res.status(404).json({ message: 'Patient not found' });
        res.json(patient);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { registerPatient, getPatients, getPatientById };

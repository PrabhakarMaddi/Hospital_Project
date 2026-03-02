const Token = require('../models/Token');
const Patient = require('../models/Patient');

// Helper: get today's date range
const todayRange = () => {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);
    return { start, end };
};

// @desc  Generate OPD token for patient
// @route POST /api/tokens
// @access Private (Receptionist/Admin)
const generateToken = async (req, res) => {
    try {
        const { patientId, department, doctorId, priority } = req.body;

        const patient = await Patient.findById(patientId);
        if (!patient) return res.status(404).json({ message: 'Patient not found' });

        // Auto-increment token number per department per day
        const { start, end } = todayRange();
        const todayCount = await Token.countDocuments({
            department,
            createdAt: { $gte: start, $lte: end },
        });

        const token = await Token.create({
            patient: patientId,
            department,
            doctor: doctorId || undefined,
            tokenNumber: todayCount + 1,
            priority: priority || 'Normal',
            status: priority === 'Emergency' ? 'Emergency' : 'Waiting',
        });

        const populated = await token.populate('patient', 'name phone age gender');
        res.status(201).json(populated);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get queue (tokens) — optionally filter by department/status
// @route GET /api/tokens
// @access Private
const getQueue = async (req, res) => {
    try {
        const { department, status, date } = req.query;
        let query = {};

        // Default to today's tokens
        if (!date) {
            const { start, end } = todayRange();
            query.createdAt = { $gte: start, $lte: end };
        }
        if (department) query.department = department;
        if (status) query.status = status;

        const tokens = await Token.find(query)
            .populate('patient', 'name phone age gender')
            .populate('doctor', 'name')
            .sort({ priority: -1, tokenNumber: 1 }); // Emergency first, then by number

        res.json(tokens);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Update token status (Call / Skip / Complete)
// @route PATCH /api/tokens/:id/status
// @access Private (Doctor/Admin)
const updateTokenStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const validStatuses = ['Waiting', 'Calling', 'Completed', 'Skipped'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: 'Invalid status' });
        }

        const token = await Token.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        ).populate('patient', 'name phone age gender').populate('doctor', 'name');

        if (!token) return res.status(404).json({ message: 'Token not found' });

        // Emit Socket.IO event for real-time update
        const io = req.app.get('io');
        if (io) {
            io.emit('token:updated', token);
        }

        res.json(token);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// @desc  Get queue stats for dashboard
// @route GET /api/tokens/stats
// @access Private
const getQueueStats = async (req, res) => {
    try {
        const { start, end } = todayRange();
        const query = { createdAt: { $gte: start, $lte: end } };

        const [total, waiting, calling, completed, skipped] = await Promise.all([
            Token.countDocuments(query),
            Token.countDocuments({ ...query, status: 'Waiting' }),
            Token.countDocuments({ ...query, status: 'Calling' }),
            Token.countDocuments({ ...query, status: 'Completed' }),
            Token.countDocuments({ ...query, status: 'Skipped' }),
        ]);

        res.json({ total, waiting, calling, completed, skipped });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { generateToken, getQueue, updateTokenStatus, getQueueStats };

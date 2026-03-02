const mongoose = require('mongoose');

const admissionSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true,
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    ward: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ward',
        required: true,
    },
    bed: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bed',
        required: true,
    },
    admissionDate: {
        type: Date,
        default: Date.now,
    },
    dischargeDate: Date,
    reason: String,
    status: {
        type: String,
        enum: ['Admitted', 'Discharged', 'Transferred', 'Deceased'],
        default: 'Admitted',
    },
    billingStatus: {
        type: String,
        enum: ['Pending', 'Cleared'],
        default: 'Pending',
    }
}, {
    timestamps: true,
});

const Admission = mongoose.model('Admission', admissionSchema);
module.exports = Admission;

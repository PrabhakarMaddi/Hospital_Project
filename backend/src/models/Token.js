const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
    patient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
        required: true,
    },
    department: {
        type: String,
        required: true,
    },
    doctor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
    },
    tokenNumber: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['Waiting', 'Calling', 'Completed', 'Skipped', 'Emergency'],
        default: 'Waiting',
    },
    priority: {
        type: String,
        enum: ['Normal', 'Emergency'],
        default: 'Normal',
    },
    estimatedWaitTime: {
        type: Number, // In minutes
    }
}, {
    timestamps: true,
});

const Token = mongoose.model('Token', tokenSchema);
module.exports = Token;

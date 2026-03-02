const mongoose = require('mongoose');

const patientSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
    },
    age: {
        type: Number,
        required: true,
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'],
        required: true,
    },
    phone: {
        type: String,
        required: true,
    },
    address: String,
    history: [{
        type: String,
    }],
}, {
    timestamps: true,
});

const Patient = mongoose.model('Patient', patientSchema);
module.exports = Patient;

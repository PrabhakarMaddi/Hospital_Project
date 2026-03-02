const mongoose = require('mongoose');

const bedSchema = new mongoose.Schema({
    bedNumber: {
        type: String,
        required: true,
    },
    ward: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Ward',
        required: true,
    },
    category: {
        type: String,
        enum: ['General', 'ICU', 'NICU', 'Emergency', 'Private', 'Semi-private'],
        required: true,
    },
    status: {
        type: String,
        enum: ['Available', 'Occupied', 'Cleaning', 'Reserved', 'Maintenance'],
        default: 'Available',
    },
    currentPatient: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Patient',
    }
}, {
    timestamps: true,
});

const Ward = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true,
    },
    type: String,
    totalBeds: Number,
}, {
    timestamps: true,
});

const Bed = mongoose.model('Bed', bedSchema);
const WardModel = mongoose.model('Ward', Ward);

module.exports = { Bed, Ward: WardModel };

const mongoose = require('mongoose');

const LCLDetailsSchema = new mongoose.Schema({
    readyDate: {
        type: Date,
        required: true
    },

    originPort: {
        type: String,
        required: true
    },

    destinationPort: {
        type: String,
        required: true
    },
    
    cargoDescription: {
        type: String,
        required: true
    },

    packageType: {
        type: String,
        required: true
    },

    totalPackages: {
        type: Number,
        required: true
    },

    weight: {
        type: Number,
        required: true
    },

    length: {
        type: Number,
        required: true
    },

    width: {
        type: Number,
        required: true
    },

    height: {
        type: Number,
        required: true
    },

    incoterm: {
        type: String,
        enum: ['fob', 'fca', 'exwork'],
        required: true
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('lcl', LCLDetailsSchema);
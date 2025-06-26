const mongoose = require('mongoose');

const AIRDetailsSchema = new mongoose.Schema({
    readyDate: {
        type: Date,
        required: true
    },

    originAirport: {
        type: String,
        required: true
    },

    destinationAirport: {
        type: String,
        required: true
    },
    
    cargoDescription: {
        type: String,
        required: true
    },
    
    weight: {
        type: Number,
        required: true
    },

    volume: {
        type: Number,
        required: true
    },

    numberOfPieces: {
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

module.exports = mongoose.model('air', AIRDetailsSchema);
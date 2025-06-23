const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    origin: {
        type: String,
        required: true
    },
    destination: {
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
    dimensions: {
        height: { type: Number, required: true },
        width: { type: Number, required: true },
        length: { type: Number, required: true }
    },
    containerType : {
        type: String,
        enum: ['20ft','40ft', '40hc', 'reefer'], 
    },
    incoterm: {
        type: String,
        enum: ['fob', 'fca', 'exwork'],
        required: true
    },
    mode: {
        type: String,
        enum: ['fcl', 'lcl', 'air', 'road'],
        required: true
    },
    status: {
        type: String,
        enum: ['pending', 'under review', 'quoted', 'accepted', 'rejected'],
        default: 'pending'
    },
     serviceLevel : {
        type: String,
        enum: ['standard', 'express', 'premium'],
    },

     reqDelivery: {
        type: Date,

    },
    readyDate: {
        type: Date,

    },
    
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Quote', quoteSchema);

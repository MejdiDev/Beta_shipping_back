const mongoose = require('mongoose');

const locationUpdateSchema = new mongoose.Schema({
    location: { type: String, required: true },
    status: { 
        type: String, 
        enum: ['picked-up', 'in-transit', 'arrived-at-facility', 'out-for-delivery', 'delivered', 'delayed'],
        required: true 
    },
    timestamp: { type: Date, default: Date.now },
    notes: { type: String },
    updatedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    }
});

const shipmentSchema = new mongoose.Schema({
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
    container : {
        type: String,
        enum: ['20ft standard','40ft standard', '40ft high cube'],
        
    },
    incoterm: {
        type: String,
        enum: ['fob', 'fca', 'exwork', 'cif'],
        required: true
    },
    mode: {
        type: String,
        enum: ['fcl', 'lcl', 'air', 'road'],
        required: true
    },
        serviceLevel : {
        type: String,
        enum: ['standard', 'express', 'premium']
    },

        reqDelivery: {
        type: Date,

    },
    readyDate: {
        type: Date,

    },
    estimateddeparture: {
        type: Date,

    },
    estimateddeliverye: {
        type: Date,

    }
}, { timestamps: true });

// Generate tracking number before saving
shipmentSchema.pre('save', async function(next) {
    if (!this.trackingNumber) {
        // Generate a unique tracking number (e.g., SHP-YYYYMMDD-XXXX)
        const date = new Date().toISOString().slice(0,10).replace(/-/g,'');
        const random = Math.floor(1000 + Math.random() * 9000);
        this.trackingNumber = `SHP-${date}-${random}`;
    }
    next();
});

module.exports = mongoose.model('Shipment', shipmentSchema);
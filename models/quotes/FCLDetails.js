const mongoose = require('mongoose');

const FCLDetailsSchema = new mongoose.Schema({
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

    containerQuantity: {
        type: Number,
        required: true
    },
    
    goodsDescription: {
        type: String,
        required: true
    },

    dangerous : {
        type: Boolean,
        required: true
    },

    incoterm: {
        type: String,
        enum: ['fob', 'fca', 'exwork'],
        required: true
    },

    containerType : {
        type: String,
        enum: ['20ft','40ft', '40hc', 'reefer'], 
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('fcl', FCLDetailsSchema);

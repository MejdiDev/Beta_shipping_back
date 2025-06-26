const mongoose = require('mongoose');

const quoteSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },

    detailsId: {
        type: mongoose.Schema.Types.ObjectId,
        required: true,
        refPath: 'shipmentType',
    },

    createdAt: {
        type: Date,
        default: Date.now
    },
    
    // validUntil: {
    //     type: Date,
    //     default: Date.now
    // },

    shipmentType: {
        type: String,
        enum: ['fcl', 'lcl', 'air'],
        required: true
    },
    
    status: {
        type: String,
        enum: ['pending', 'under review', 'quoted', 'accepted', 'rejected'],
        default: 'pending'
    },
});

module.exports = mongoose.model('Quote', quoteSchema);

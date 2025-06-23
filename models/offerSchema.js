const mongoose = require('mongoose');

const offerSchema = new mongoose.Schema({
    quoteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quote',
        required: true
    },
    agentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    amount: {
        type: Number,
        required: true
    },
    result: {
        type: String,
        enum: ['pending', 'accepted', 'rejected'],
        default: 'pending'
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('offer', offerSchema);

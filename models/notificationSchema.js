const mongoose = require('mongoose');
const { Schema } = mongoose;

const notificationSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },

    contentId: {
        type: Schema.Types.ObjectId,
        required: true,
        refPath: 'referenceModel',  // This will refer based on 'referenceModel'
    },

    referenceModel: {
        type: String,
        required: true,
        enum: ['Quote', 'Shipment', 'offer'],  // Enum ensures that only 'User' or 'Product' can be used
    },

    content: {
        type: String,
        required: true
    },

    read: {
        type: Boolean,
        default: false,
        required: true
    },
    
    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Notification', notificationSchema);

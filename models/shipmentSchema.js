const mongoose = require('mongoose');

const shipmentSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },

    // Either the shipment is created by accepting an offer (All data is in the quoteRequest)
    quoteRequestId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Quote'
    },

    // Or it's created directly (We create a detail and mention the shipmentType)
    detailsId: {
        type: mongoose.Schema.Types.ObjectId,
        refPath: 'shipmentType'
    },

    shipmentType: {
        type: String,
        enum: ['fcl', 'lcl', 'air']
    },

    createdAt: {
        type: Date,
        default: Date.now
    },

    status: {
        type: String, 
        enum: ['created', 'in transit', 'delivered', 'delayed'],
        default: 'created' 
    },

    documents: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Document'
    }]
}, { timestamps: true });

// Generate tracking number before saving
// shipmentSchema.pre('save', async function(next) {
//     if (!this.trackingNumber) {
//         // Generate a unique tracking number (e.g., SHP-YYYYMMDD-XXXX)
//         const date = new Date().toISOString().slice(0,10).replace(/-/g,'');
//         const random = Math.floor(1000 + Math.random() * 9000);
//         this.trackingNumber = `SHP-${date}-${random}`;
//     }
//     next();
// });

module.exports = mongoose.model('Shipment', shipmentSchema);
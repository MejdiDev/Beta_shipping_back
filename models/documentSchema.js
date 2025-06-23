const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
    shipmentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Shipment',
    },
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
    clientId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
    },
    documentType: {
        type: String,
        enum: [
            'Master Air Waybill (MAWB)',
            'House Air Waybill (HAWB)',
            'Commercial Invoice',
            'Packing List',
            'Shipper\'s Letter of Instruction (SLI)',
            'Dangerous Goods Declaration (DGD) / Shipper\'s Declaration for Dangerous Goods',
            'Certificate of Origin (COO)',
            'Export/Import Licenses',
            'Security Declaration',
            'Customs Declaration (Export/Import)',
            'Proof of Delivery (POD)',
            'Master Bill of Lading (MBL)',
            'House Bill of Lading (HBL)',
            'Booking Confirmation',
            'Container Load Plan / Container Loading List',
            'Dangerous Goods Manifest',
            'Arrival Notice',
            'Delivery Order',
            'Bill of Lading (BOL) / Freight Bill / Waybill',
            'CMR (Convention on the Contract for the International Carriage of Goods by Road)',
            'Load Sheet / Manifest',
            'Border Crossing Documents',
            'Permits / Licenses',
            'Delivery Note'
        ],
        required: true
    },
    fileName: {
        type: String,
        required: true
    },
    filePath: {
        type: String,
        required: true
    },
    fileType: {
        type: String,
        required: true
    },
    fileSize: {
        type: Number,
        required: true
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    documentCategory: {
        type: String,
        enum: ['financial', 'operational'],
        default: 'operational',
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Document', documentSchema);

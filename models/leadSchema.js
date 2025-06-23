const mongoose = require('mongoose');
const { Schema } = mongoose;

const leadSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    phone: {
        type: String,
        required: true
    },
    status: {
        type: String,
        enum: ['new', 'contacted', 'qualified', 'lost'],
        default: 'new'
    },
    salesAgent: {
        type: Schema.Types.ObjectId,
        ref: 'SalesAgent',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Lead', leadSchema);

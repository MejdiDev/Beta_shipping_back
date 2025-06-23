const mongoose = require('mongoose');
const { Schema } = mongoose;

const taskSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    dueDate: {
        type: Date,
        required: true
    },

    status: {
        type: String,
        enum: ['pending', 'in progress', 'completed', 'overdue'],
        default: 'pending'
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    assignedTo: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    assignedBy: {
        type: Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },

    createdAt: {
        type: Date,
        default: Date.now
    }
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);

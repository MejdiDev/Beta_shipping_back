const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
    clientId: {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Client",
        required: true,
    },
    shipmentId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: "Shipment",
        required: true,
    }, 
    invoiceNumber: {
        type: String,
        required: true,
        unique: true,
    },
    amount: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["Pending", "Paid", "Cancelled","overdue"],
        default: "unpaid",

    },
    dueDate :{
        type:Date,
        required: true ,
    },
    issueDate: {
        type: Date,
        default: Date.now,

    },
    paymentMethod: {
        type:String, enum : ['credit card','bank transfer', 'cheque ','other']
    },
    invoiceFile: {
        type: String,
        required: false, // Making it optional for now
    },
},
{timestamps: true}
);
module.exports = mongoose.model("Invoice", invoiceSchema);

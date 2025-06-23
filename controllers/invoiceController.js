const Invoice = require('../models/invoiceSchema');
const Shipment = require('../models/shipmentSchema');
const User = require('../models/usersSchema');

// Create invoice (Financial Officer)
exports.createInvoice = async (req, res) => {
    try {
        const { shipmentId, amount, dueDate } = req.body;

        // Verify shipment exists
        const shipment = await Shipment.findById(shipmentId);
        if (!shipment) {
            return res.status(404).json({ message: "Shipment not found" });
        }

        const invoice = new Invoice({
            shipmentId,
            clientId: shipment.clientId, // Reference to the client
            amount,
            dueDate,
            status: 'pending',
            createdBy: req.user._id, // Reference to Financial Officer
            invoiceDate: new Date()
        });

        await invoice.save();
        res.status(201).json({
            message: "Invoice created successfully",
            invoice
        });
    } catch (error) {
        res.status(500).json({ message: "Error creating invoice", error: error.message });
    }
};

// Get all invoices (Financial Officer)
exports.getAllInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find()
            .populate('clientId', 'name email')
            .populate('shipmentId')
            .populate('createdBy', 'name')
            .sort({ invoiceDate: -1 });

        res.status(200).json(invoices);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving invoices", error: error.message });
    }
};

// Get client's invoices (Client)
exports.getClientInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find({ 
            clientId: req.user._id 
        })
        .populate('shipmentId')
        .populate('createdBy', 'name')
        .sort({ invoiceDate: -1 });

        res.status(200).json(invoices);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving client invoices", error: error.message });
    }
};

// Get invoice by ID (Client & Financial Officer)
exports.getInvoiceById = async (req, res) => {
    try {
        let invoice;
        if (req.user.role === 'client') {
            // Clients can only view their own invoices
            invoice = await Invoice.findOne({
                _id: req.params.id,
                clientId: req.user._id
            })
            .populate('shipmentId')
            .populate('createdBy', 'name');
        } else {
            // Financial Officers can view all invoices
            invoice = await Invoice.findById(req.params.id)
                .populate('clientId', 'name email')
                .populate('shipmentId')
                .populate('createdBy', 'name');
        }

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        res.status(200).json(invoice);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving invoice", error: error.message });
    }
};

// Update invoice status (Financial Officer)
exports.updateInvoiceStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        // Validate status
        const validStatuses = ['pending', 'paid', 'overdue', 'cancelled'];
        if (!validStatuses.includes(status)) {
            return res.status(400).json({ message: "Invalid status" });
        }

        invoice.status = status;
        invoice.lastUpdatedBy = req.user._id; // Reference to Financial Officer
        invoice.lastUpdateDate = new Date();

        await invoice.save();
        res.status(200).json({
            message: "Invoice status updated successfully",
            invoice
        });
    } catch (error) {
        res.status(500).json({ message: "Error updating invoice status", error: error.message });
    }
};

// Get pending invoices (Financial Officer)
exports.getPendingInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find({ status: 'pending' })
            .populate('clientId', 'name email')
            .populate('shipmentId')
            .populate('createdBy', 'name')
            .sort({ dueDate: 1 });

        res.status(200).json(invoices);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving pending invoices", error: error.message });
    }
};

// Get overdue invoices (Financial Officer)
exports.getOverdueInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find({
            status: 'pending',
            dueDate: { $lt: new Date() }
        })
        .populate('clientId', 'name email')
        .populate('shipmentId')
        .populate('createdBy', 'name')
        .sort({ dueDate: 1 });

        res.status(200).json(invoices);
    } catch (error) {
        res.status(500).json({ message: "Error retrieving overdue invoices", error: error.message });
    }
};

// Upload invoice (Financial Officer)
exports.uploadInvoice = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        const invoiceId = req.body.invoiceId; // Assuming invoiceId is passed in the request body
        const invoice = await Invoice.findById(invoiceId);

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        invoice.invoiceFile = req.file.path; // Save the file path to the invoice record
        await invoice.save();

        res.status(200).json({ message: 'Invoice uploaded successfully', invoice });
    } catch (error) {
        res.status(500).json({ message: 'Error uploading invoice', error: error.message });
    }
};

// Download invoice (Financial Officer)
exports.downloadInvoice = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        if (!invoice.invoiceFile) {
            return res.status(404).json({ message: 'Invoice file not found' });
        }

        // Send the file as a response
        res.sendFile(invoice.invoiceFile);
    } catch (error) {
        res.status(500).json({ message: 'Error downloading invoice', error: error.message });
    }
};

// Update invoice (Financial Officer)
exports.updateInvoice = async (req, res) => {
    try {
        const { amount, dueDate, paymentMethod } = req.body;
        const invoice = await Invoice.findById(req.params.id);

        if (!invoice) {
            return res.status(404).json({ message: 'Invoice not found' });
        }

        if (amount) invoice.amount = amount;
        if (dueDate) invoice.dueDate = dueDate;
        if (paymentMethod) invoice.paymentMethod = paymentMethod;

        await invoice.save();
        res.status(200).json({ message: 'Invoice updated successfully', invoice });
    } catch (error) {
        res.status(500).json({ message: 'Error updating invoice', error: error.message });
    }
};

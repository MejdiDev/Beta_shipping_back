const Invoice = require('../models/invoiceSchema');
const Shipment = require('../models/shipmentSchema');
const User = require('../models/usersSchema');
const Quote = require('../models/quoteSchema');
const bcrypt = require('bcrypt');
const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

module.exports.getProfile = async (req, res) => {
    try {
        const userProfile = await User.findById(req.user._id).select("-password");
        res.status(200).json(userProfile);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports.updateProfile = async (req, res) => {
    try {
        const { name, last, email, phone } = req.body;
        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        if (name) user.name = name;
        if (last) user.last = last;
        if (email) user.email = email;
        if (phone) user.phone = phone;
        await user.save();
        res.status(200).json({ message: "Profile updated successfully", user });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res.status(400).json({ message: "Current and new password are required" });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: "Current password is incorrect" });
        }

        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: "Password updated successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports.deleteAccount = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json({ message: "Account deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports.generateInvoice = async (req, res) => {
    try {
        const { shipmentId } = req.body;
        if (!shipmentId) {
            return res.status(400).json({ message: "Shipment ID is required" });
        }

        const shipment = await Shipment.findById(shipmentId);
        if (!shipment) {
            return res.status(404).json({ message: "Shipment not found" });
        }

        // Check if invoice already exists for this shipment
        const existingInvoice = await Invoice.findOne({ shipmentId });
        if (existingInvoice) {
            return res.status(400).json({ message: "Invoice already exists for this shipment" });
        }

        const invoice = new Invoice({
            shipmentId,
            clientId: shipment.userId,
            amount: shipment.amount,
            status: "pending",
            origin: shipment.origin,
            destination: shipment.destination,
            weight: shipment.weight,
            dimensions: shipment.dimensions,
            description: shipment.description
        });

        await invoice.save();
        res.status(201).json({ message: "Invoice generated successfully", invoice });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports.getAllInvoices = async (req, res) => {
    try {
        const invoices = await Invoice.find().populate('clientId', 'name last email');
        res.status(200).json(invoices);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports.getInvoiceById = async (req, res) => {
    try {
        const invoice = await Invoice.findById(req.params.id).populate('clientId', 'name last email');
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }
        res.status(200).json(invoice);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports.updateInvoice = async (req, res) => {
    try {
        const { status } = req.body;
        if (!status) {
            return res.status(400).json({ message: "Status is required" });
        }

        const invoice = await Invoice.findById(req.params.id);
        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        invoice.status = status;
        await invoice.save();
        res.status(200).json({ message: "Invoice updated successfully", invoice });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};



const upload = require('../middlewares/uploadFile'); // Assuming you have multer setup

module.exports.sendInvoice = async (req, res) => {
    try {
        const { invoiceId } = req.params;
        const invoice = await Invoice.findById(invoiceId).populate('clientId', 'email');

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        upload.single('invoice')(req, res, async (err) => {
            if (err) {
                return res.status(400).json({ message: "File upload error", error: err.message });
            }

            if (!req.file) {
                return res.status(400).json({ message: "No invoice file uploaded" });
            }

            const invoicePath = req.file.path;

            // TODO: Implement email sending logic here, attaching the invoice file
            // For now, just return success with the file path
            res.status(200).json({ message: "Invoice sent successfully", invoice, invoicePath });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports.getAllClients = async (req, res) => {
    try {
        const clients = await User.find({ role: 'client' }).select('-password');
        res.status(200).json(clients);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports.getQuoteById = async (req, res) => {
    try {
        const quote = await Quote.findById(req.params.id).populate('userId', 'name last email');
        if (!quote) {
            return res.status(404).json({ message: "Quote not found" });
        }
        res.status(200).json(quote);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports.getUserById = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).select('-password');
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports.downloadInvoice = async (req, res) => {
    try {
        const { invoiceId } = req.params;
        const invoice = await Invoice.findById(invoiceId).populate('clientId', 'name email');

        if (!invoice) {
            return res.status(404).json({ message: "Invoice not found" });
        }

        // Create a PDF document
        const doc = new PDFDocument();
        const filePath = `./invoices/invoice_${invoiceId}.pdf`;
        const writeStream = fs.createWriteStream(filePath);
        doc.pipe(writeStream);

        // Add content to the PDF
        doc.fontSize(20).text('Invoice', { align: 'center' });
        doc.moveDown();
        doc.fontSize(12).text(`Invoice ID: ${invoice._id}`);
        doc.text(`Client Name: ${invoice.clientId.name}`);
        doc.text(`Client Email: ${invoice.clientId.email}`);
        doc.text(`Amount: ${invoice.amount}`);
        doc.text(`Status: ${invoice.status}`);
        doc.text(`Origin: ${invoice.origin}`);
        doc.text(`Destination: ${invoice.destination}`);
        doc.text(`Weight: ${invoice.weight}`);
        doc.text(`Dimensions: ${invoice.dimensions}`);
        doc.text(`Description: ${invoice.description}`);
        doc.end();

        writeStream.on('finish', () => {
            res.download(filePath, `invoice_${invoiceId}.pdf`, (err) => {
                if (err) {
                    return res.status(500).json({ message: "Error downloading invoice", error: err.message });
                }

                // Optionally delete the file after download
                fs.unlinkSync(filePath);
            });
        });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports.uploadFinancialDocument = async (req, res) => {
  upload.single('financialDocument')(req, res, (err) => {
    try {
      if (err) {
        return res.status(400).json({ message: "File upload error", error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const filePath = req.file.path;

      res.status(200).json({
        message: "File uploaded successfully",
        filePath
      });
    } catch (error) {
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
};

module.exports.getAllShipments = async (req, res) => {
    try {
        const shipments = await Shipment.find().populate('userId', 'name last email');
        res.status(200).json(shipments);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

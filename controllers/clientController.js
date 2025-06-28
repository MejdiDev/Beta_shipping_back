const User = require("../models/usersSchema");
const Invoice = require("../models/invoiceSchema");
const Quote = require("../models/quoteSchema");
const Document = require("../models/documentSchema");
const bcrypt = require("bcrypt");
const Shipment = require("../models/shipmentSchema");

// Get user profile
module.exports.getProfile = async (req, res) => {
  try {
    const userProfile = await User.findById(req.user._id).select("-password");
    res.status(200).json(userProfile);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Update user profile
module.exports.updateProfile = async (req, res) => {
  try {
    const { name, last, email, phone } = req.body;
    const user = await User.findById(req.userId);
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

// Update user password
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

// Delete user account
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

// Request a quote
module.exports.requestQuote = async (req, res) => {
  try {
    const { origin, destination, weight, dimensions, description } = req.body;
    const quote = new Quote({
      userId: req.user._id,
      origin,
      destination,
      weight,
      dimensions,
      description,
      status: "requested"
    });
    await quote.save();
    res.status(200).json({ message: "Quote requested successfully", quote });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

const quoteController = require('./quoteController');

// Get all quotes for a user
module.exports.getClientQuotes = async (req, res) => {
    try {
        quoteController.getClientQuotes(req, res);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports.getClientQuoteById = async (req, res) => {
    try {
        quoteController.getQuoteById(req, res);
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get shipments for a user with status and history
module.exports.getShipments = async (req, res) => {
    try {
      const resHaveQuote = await Shipment.find({ quoteRequestId: { $exists: true } }).populate({
          path: 'quoteRequestId',
          populate: {
              path: 'detailsId'
          },
      })

      const resHaveDetails = await Shipment.find({ detailsId: { $exists: true } }).populate('detailsId')

      res.status(200).json({
          message: 'Client shipments retrieved successfully',
          shipments: resHaveQuote.concat(resHaveDetails)
      });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

module.exports.getShipmentById = async (req, res) => {
  try {
    const shipment = await Shipment.findOne({ _id: req.params.id });
    let resShip;

    if (!shipment) {
        return res.status(404).json({ message: 'Shipment not found' });
    }

    if(shipment.quoteRequestId) {
        resShip = await Shipment.findOne({ _id: req.params.id, quoteRequestId: { $exists: true } }).populate({
            path: 'quoteRequestId',
            populate: {
                path: 'detailsId'
            },
        })
    }

    else if(shipment.detailsId) {
      resShip = await Shipment.findOne({ _id: req.params.id, detailsId: { $exists: true } }).populate('detailsId')
    }

    res.status(200).json({
        message: 'Client shipment retrieved successfully',
        shipment: resShip
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// Get invoices for a user
module.exports.getInvoices = async (req, res) => {
  try {
    const invoices = await Invoice.find({ userId: req.user._id });
    res.status(200).json(invoices);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};


// Get documents for a shipment
module.exports.getDocuments = async (req, res) => {
  try {
    const shipmentDetails = await Shipment.findOne({
      _id: req.params.id,
      userId: req.user._id
    }).populate("documents");
    
    if (!shipmentDetails) {
      return res.status(404).json({ message: "Shipment not found" });
    }
    
    res.status(200).json(shipmentDetails);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Download document
module.exports.downloadDocument = async (req, res) => {
    try {
        const documentId = req.params.id;
        const document = await Document.findById(documentId);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Check if the document is related to the client's shipment
        const shipment = await Shipment.findOne({ _id: document.shipmentId, userId: req.user._id });
        if (!shipment) {
            return res.status(403).json({ message: 'Unauthorized access to document' });
        }

        // Send the file as a response
        res.sendFile(document.filePath);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

exports.getFinancialDocuments = async (req, res) => {
    try {
        const documents = await Document.find({ documentCategory: 'financial' })
            .populate('shipmentId')
            .populate('userId', 'name email');

        res.status(200).json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving financial documents', error: error.message });
    }
};

// Get operational documents (Operational Officer)
exports.getOperationalDocuments = async (req, res) => {
    try {
        const documents = await Document.find({ documentCategory: 'operational' })
            .populate('shipmentId')
            .populate('userId', 'name email');

        res.status(200).json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving operational documents', error: error.message });
    }
};

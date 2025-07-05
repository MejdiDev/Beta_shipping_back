var router = require('express').Router();
var express = require('express');
const User = require('../models/usersSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { isAdmin } = require('../middlewares/auth');

const Shipment = require('../models/shipmentSchema');
const Quote = require('../models/quoteSchema');
const Offer = require('../models/offerSchema');

const document = require  ('../models/documentSchema');
const { notifyUser } = require('./notificationController');
const { default: mongoose } = require('mongoose');
// Get admin profile
module.exports.getProfile = async (req, res) => {
    try {
        const admin = await User.findById(req.user._id).select('-password');
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        res.status(200).json(admin);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update admin profile
module.exports.updateProfile = async (req, res) => {
    try {
        const admin = await User.findByIdAndUpdate(req.body._id, req.body);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }
        
        await admin.save();
        res.status(200).json({ message: 'Profile updated successfully', admin });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports.updateUserProfile = async (req, res) => {
    try {
        const { name, last, email, phone } = req.body;

        const user = await User.findById(req.userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Update fields
        if (name) user.name = name;
        if (last) user.last = last;
        if (email) user.email = email;
        if (phone) user.phone = phone;

        await user.save();
        res.status(200).json({ message: 'Profile updated successfully', user });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

module.exports.deleteUserProfile = async (req, res) => {
    try {
        const user = await User.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting task', error: error.message });
    }
};

module.exports.updatePassword = async (req, res) => {
    try {
        const { currentPassword, newPassword } = req.body;
        if (!currentPassword || !newPassword) {
            return res
                .status(400)
                .json({ message: "Current and new password are required." });
        }

        const user = await User.findById(req.user._id);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        // Check if current password is correct
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res
                .status(400)
                .json({ message: "Current password is incorrect." });
        }

        // Hash and set new password
        user.password = await bcrypt.hash(newPassword, 10);
        await user.save();

        res.status(200).json({ message: "Password updated successfully." });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// delete account
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

// Get all users
exports.getAllUsers = async (req, res) => {
    try {
        let users;
        if (req.user.role === 'admin') {
            users = await User.find().select('-password');
        } else if (req.user.role === 'manager') {
            users = await User.find({ role: { $in: ['client', 'salesAgent', 'manager'] } }).select('-password');
        } else {
            return res.status(403).json({ message: 'Unauthorized' });
        }
        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};


// Delete user
exports.deleteUser = async (req, res) => {
    try {
        const clientId = req.params.id;

        const user = await User.findById(clientId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent deleting the last admin
        if (user.role === 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({ message: 'Cannot delete the last admin' });
            }
        }

        await user.deleteOne();
        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get user by ID
exports.getUserById = async (req, res) => {
    try {
        const userId = req.params.id;

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Reset user password
exports.resetUserPassword = async (req, res) => {
    try {
        const userId = req.params.id;
        const { newPassword } = req.body;

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);
        user.password = hashedPassword;

        await user.save();
        res.status(200).json({ message: 'Password reset successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all shipments
module.exports.getAllShipments = async (req, res) => {
    try {
        const resHaveQuote = await Shipment.find({ quoteRequestId: { $exists: true } }).populate({
            path: 'quoteRequestId',
            populate: {
                path: 'detailsId'
            },
        })

        const resHaveDetails = await Shipment.find({ detailsId: { $exists: true } }).populate('detailsId')

        res.status(200).json({
            message: 'Shipments retrieved successfully',
            shipments: resHaveQuote.concat(resHaveDetails)
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

// Get shipment by ID
module.exports.getShipmentById = async (req, res) => {
    try {
        const shipment = await Shipment.findOne({ _id: req.params.id })
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
            }).populate('documents')
        }

        else if(shipment.detailsId) {
            resShip = await Shipment.findOne({ _id: req.params.id, detailsId: { $exists: true } }).populate('detailsId').populate('documents')
        }

        res.status(200).json({
            message: 'Shipment retrieved successfully',
            shipment: resShip
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create a new shipment
module.exports.createShipment = async (req, res) => {
    try {
        const { shipDetails, shipmentType } = req.body;
            
        const shipmentModel = mongoose.model( shipmentType.toLowerCase() );
        const shipmentDetailsInstance = new shipmentModel( shipDetails );
        
        const resShipmentDetails = await shipmentDetailsInstance.save();
        
        // Create the quote and store just the shipmentMode and the detailsId
        const shipment = new Shipment({
            clientId: shipDetails.clientId,
            shipmentType: shipmentType.toLowerCase(),
            detailsId: resShipmentDetails._id,
        });
    
        // Save the quote document
        const resShip = await shipment.save();

        notifyUser({
            userId: shipDetails.clientId,
            contentId: resShip._id,
            referenceModel: "Shipment",
            content: "You have a new shipment !"
        });

        res.status(201).json({ message: 'Shipment created successfully', shipment: resShip });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update shipment
module.exports.updateShipment = async (req, res) => {
    try {
        const shipDetails = req.body;
        
        const shipment = await Shipment.findById(req.params.id);
        if (!shipment) {
            return res.status(404).json({ message: 'Shipment not found' });
        }

        const shipmentModel = mongoose.model( shipDetails.shipmentType.toLowerCase() );
        const detailsRec = await shipmentModel.findByIdAndUpdate(
            shipDetails.detailsId,
            req.body,
            { new: true }
        );

        await Shipment.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );

        notifyUser({
            userId: req.body.clientId,
            contentId: req.params.id,
            referenceModel: "Shipment",
            content: "Your shipment was edited !"
        });

        res.status(200).json({ message: 'Shipment updated successfully', details: detailsRec });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete shipment
module.exports.deleteShipment = async (req, res) => {
    try {
        const shipmentId = req.params.id;

        const shipment = await Shipment.findById(shipmentId);
        if (!shipment) {
            return res.status(404).json({ message: 'Shipment not found' });
        }

        await shipment.deleteOne();

        notifyUser({
            userId: shipment.clientId,
            contentId: shipment._id,
            referenceModel: "Shipment",
            content: "Your shipment was deleted !"
        });

        res.status(200).json({ message: 'Shipment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all quotes
module.exports.getAllQuotes = async (req, res) => {
    try {
        const quotes = await Quote
        .find()
        .populate('detailsId');

        res.status(200).json(quotes);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get quote by ID
module.exports.getQuoteById = async (req, res) => {
    try {
        let quote;
        let offer = await Offer.findOne({ quoteId: req.params.id })
            
        if(offer) {
            quote = await Offer.findOne({ quoteId: req.params.id })
                .populate({
                    path: 'quoteId',
                    populate: {
                        path: 'detailsId'
                    },
                });
        }

        else {
            quote = await Quote.findById(req.params.id).populate('detailsId')
        }

        if (!quote) {
            return res.status(404).json({ message: "Quote not found" });
        }

        res.status(200).json(quote);
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving quote",
      error: error.message,
    });
  }
};

module.exports.updateQuote = async (req, res) => {
    try {
        const quoteDetails = req.body;
        
        const quote = await Quote.findById(req.params.id);
        if (!quote) {
            return res.status(404).json({ message: 'Quote not found' });
        }

        const ShipmentModel = mongoose.model( quoteDetails.shipmentType.toLowerCase() );
        const detailsRec = await ShipmentModel.findByIdAndUpdate(
            quoteDetails._id,
            req.body,
            { new: true }
        );

        await Quote.findByIdAndUpdate(
            req.params.id,
            { status: req.body.status },
            { new: true }
        );

        notifyUser({
            userId: req.body.clientId,
            contentId: req.params.id,
            referenceModel: "Quote",
            content: "Your quote was edited !"
        });

        res.status(200).json({ message: 'Quote updated successfully', details: detailsRec });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Delete Quote
module.exports.deleteQuote = async (req, res) => {
    try {
        const quoteId = req.params.id;

        const quote = await Quote.findById(quoteId);
        if (!quote) {
            return res.status(404).json({ message: 'Quote not found' });
        }

        await quote.deleteOne();
        res.status(200).json({ message: 'Quote deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// View sales reports
module.exports.viewSalesReports = async (req, res) => {
    try {
        // Logic to fetch and display sales reports
        res.status(200).json({ message: 'Sales reports' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Assign role to user
exports.assignRole = async (req, res) => {
    try {
        const userId = req.params.id;
        const { role } = req.body;

        // Validate role
        const validRoles = ['admin', 'manager', 'client', 'salesAgent', 'financialOfficer', 'operatingOfficer'];
        if (!validRoles.includes(role)) {
            return res.status(400).json({ message: 'Invalid role specified' });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Prevent changing the last admin's role
        if (user.role === 'admin' && role !== 'admin') {
            const adminCount = await User.countDocuments({ role: 'admin' });
            if (adminCount <= 1) {
                return res.status(400).json({ message: 'Cannot change the last admin\'s role' });
            }
        }

        // Update user's role
        user.role = role;
        await user.save();

        res.status(200).json({ 
            message: 'Role updated successfully',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

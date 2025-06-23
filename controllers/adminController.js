var router = require('express').Router();
var express = require('express');
const User = require('../models/usersSchema');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { isAdmin } = require('../middlewares/auth');
const Shipment = require('../models/shipmentSchema');
const Quote = require('../models/quoteSchema');
const document = require  ('../models/documentSchema')
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
        const { name, last, email, phone } = req.body;

        const admin = await User.findById(req.user._id);
        if (!admin) {
            return res.status(404).json({ message: 'Admin not found' });
        }

        // Update fields
        if (name) admin.name = name;
        if (last) admin.last = last;
        if (email) admin.email = email;
        if (phone) admin.phone = phone;

        await admin.save();
        res.status(200).json({ message: 'Profile updated successfully', admin });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
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

// update password


// View all shipments
module.exports.getAllShipments = async (req, res) => {
    try {
        const shipments = await Shipment.find();
        res.status(200).json(shipments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// View shipment by ID
module.exports.getShipmentById = async (req, res) => {
    try {
        const shipment = await Shipment.findById(req.params.id);
        if (!shipment) {
            return res.status(404).json({ message: 'Shipment not found' });
        }
        res.status(200).json(shipment);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// View pending shipments
module.exports.getPendingShipments = async (req, res) => {
    try {
        const pendingShipments = await Shipment.find({ status: 'pending' });
        res.status(200).json(pendingShipments);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// View all quotes
module.exports.getAllQuotes = async (req, res) => {
    try {
        const quotes = await Quote.find();
        res.status(200).json(quotes);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};
//get quote by id 

module.exports.getQuoteById = async (req, res) => {
    try {
        const quote = await Quote.findById(req.params.id);
        if (!quote) {
            return res.status(404).json({ message: 'Quote not found' });
        }
        res.status(200).json(quote);
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

const User = require('../models/usersSchema');
const Users = require('../models/usersSchema'); // Assuming users are also stored in the usersSchema
const Lead = require('../models/leadSchema.js'); // Corrected from usersSchema to leadSchema
const Quote = require('../models/quoteSchema');
const Shipment = require('../models/shipmentSchema');
const users = require('../models/usersSchema');

exports.createLead = async (req, res) => {
    try {
        const lead = new Lead(req.body);
        await lead.save();

        // Add the lead to the sales agent's leads array
        const salesAgent = await User.findById(req.body.salesAgent);

        if (salesAgent) {
            salesAgent.leads.push(lead._id);
            await salesAgent.save();
        }

        res.status(201).json({ message: 'Lead created successfully', lead });
    } catch (error) {
        res.status(500).json({ message: 'Error creating lead', error: error.message });
    }
};

module.exports.getAllLeads = async (req, res) => {
    try {
        const leads = await Lead.find(); // Removed incorrect role filter
        res.status(200).json(leads);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get lead by ID
module.exports.getLeadById = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id).select('-password');
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }
        res.status(200).json(lead);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Update a lead by ID
exports.updateLead = async (req, res) => {
    try {
        const lead = await Lead.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }
        res.status(200).json({ message: 'Lead updated successfully', lead });
    } catch (error) {
        res.status(500).json({ message: 'Error updating lead', error: error.message });
    }
};

// Delete a lead by ID
exports.deleteLead = async (req, res) => {
    try {
        const lead = await Lead.findByIdAndDelete(req.params.id);
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }
        res.status(200).json({ message: 'Lead deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting lead', error: error.message });
    }
};

// Get all clients
module.exports.getAllClients = async (req, res) => {
    try {
        const clients = await users.find({ role: 'client' }).select('-password');
        res.status(200).json(clients); // Corrected from users to clients
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get all quotes
module.exports.getAllQuotes = async (req, res) => {
    try {
        const quotes = await Quote.find();
        res.status(200).json(quotes);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get quote by ID
exports.getClientQuotes = async (req, res) => {
  try {
    const { id } = req.params;
    const quote = await Quote.findById(id);

    res.status(200).json(quote);
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving quote",
      error: error.message,
    });
  }
};

// Approve quote
module.exports.approveQuote = async (req, res) => {
    try {
        const { id } = req.params;
        const quote = await Quote.findById(id);
        if (!quote) {
            return res.status(404).json({ message: 'Quote not found' });
        }

        quote.status = 'approved';
        await quote.save();
        res.status(200).json({ message: 'Quote approved successfully', quote });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Reject quote
module.exports.rejectQuote = async (req, res) => {
    try {
        const { id } = req.params;
        const quote = await Quote.findById(id);
        if (!quote) {
            return res.status(404).json({ message: 'Quote not found' });
        }

        quote.status = 'rejected';
        await quote.save();
        res.status(200).json({ message: 'Quote rejected successfully', quote });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Search client by ID
module.exports.searchClientById = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id) {
            return res.status(400).json({ message: 'ID parameter is required' });
        }

        const client = await users.findOne({ role: 'client', _id: id }).select('-password');
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        res.status(200).json(client);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};



const authorizeSalesAgent = (req, res, next) => {
    if (req.user.role !== 'salesAgent') {
        return res.status(403).json({ message: 'Access denied' });
    }
    next();
};
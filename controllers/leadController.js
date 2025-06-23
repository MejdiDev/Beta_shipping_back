const Lead = require('../models/leadSchema');

// Create a new lead
const User = require('../models/usersSchema');

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

// Get all leads
exports.getAllLeads = async (req, res) => {
    try {
        const leads = await Lead.find().populate('salesAgent', 'name email');
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving leads', error: error.message });
    }
};

// Get a specific lead by ID
exports.getLeadById = async (req, res) => {
    try {
        const lead = await Lead.findById(req.params.id).populate('salesAgent', 'name email');
        if (!lead) {
            return res.status(404).json({ message: 'Lead not found' });
        }
        res.status(200).json(lead);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving lead', error: error.message });
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

const Shipment = require('../models/shipmentSchema');
const User = require('../models/usersSchema');
const { notifyUser } = require('./notificationController');({});

// Get all shipments (Admin, Financial Officer, Operational Officer)
exports.getAllShipments = async (req, res) => {
    try {
        const shipments = await Shipment.find()
            .populate('clientId', 'name email phone')
            .sort({ createdAt: -1 });
        res.status(200).json(shipments);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving shipments', error: error.message });
    }
};

// Get client's shipments (Client)
exports.getClientShipments = async (req, res) => {
    try {
        const shipments = await Shipment.find({ clientId: req.query.userId })
            .select('origin destination status currentLocation estimatedDeliveryDate')
            .sort({ createdAt: -1 });

        res.status(200).json({
            message: 'Client shipments retrieved successfully',
            shipments
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving shipments', error: error.message });
    }
};

// Get shipment by ID (All roles)
exports.getShipmentById = async (req, res) => {
    try {
        const shipment = await Shipment.findById(req.params.id)
            .populate('clientId', 'name email phone');

        if (!shipment) {
            return res.status(404).json({ message: 'Shipment not found' });
        }

        // Check if client is trying to access their own shipment
        if (req.user.role === 'client' && shipment.clientId._id.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to view this shipment' });
        }

        res.status(200).json(shipment);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving shipment', error: error.message });
    }
};

// Create shipment (Operational Officer)
exports.createShipment = async (req, res) => {
    try {
        // Verify client exists
        const client = await User.findOne({ _id: req.body.clientId, role: 'client' });
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const shipment = new Shipment({
            clientId: req.body.clientId,
            quoteRequestId: req.body._id
        });

        const resShip = await shipment.save();

        notifyUser({
            userId: req.body.clientId,
            contentId: resShip._id,
            referenceModel: "Shipment",
            content: "Your shipment was added !"
        });

        res.status(201).json({
            message: 'Shipment created successfully',
            shipment
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating shipment', error: error.message });
    }
};

// Update shipment status (Operational Officer)
exports.updateShipmentStatus = async (req, res) => {
    try {
        const { status } = req.body;
        const shipment = await Shipment.findById(req.params.id);

        if (!shipment) {
            return res.status(404).json({ message: 'Shipment not found' });
        }

        shipment.status = status;
        await shipment.save();

        res.status(200).json({
            message: 'Shipment status updated successfully',
            shipment
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating shipment', error: error.message });
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
        res.status(200).json({ message: 'Shipment deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Get pending shipments (Operational Officer)
exports.getPendingShipments = async (req, res) => {
    try {
        const shipments = await Shipment.find({ status: 'pending' })
            .populate('clientId', 'name email phone')
            .sort({ createdAt: -1 });
        res.status(200).json(shipments);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving pending shipments', error: error.message });
    }
};

// Get in-transit shipments (Operational Officer)
exports.getInTransitShipments = async (req, res) => {
    try {
        const shipments = await Shipment.find({ status: 'in-transit' })
            .populate('clientId', 'name email phone')
            .sort({ createdAt: -1 });
        res.status(200).json(shipments);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving in-transit shipments', error: error.message });
    }
};

// Get delivered shipments (All roles)
exports.getDeliveredShipments = async (req, res) => {
    try {
        const query = req.user.role === 'client' 
            ? { clientId: req.user._id, status: 'delivered' }
            : { status: 'delivered' };

        const shipments = await Shipment.find(query)
            .populate('clientId', 'name email phone')
            .sort({ createdAt: -1 });
        res.status(200).json(shipments);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving delivered shipments', error: error.message });
    }
};

// Track shipment status (Client)
exports.trackShipment = async (req, res) => {
    try {
        const shipment = await Shipment.findOne({
            _id: req.params.id,
            clientId: req.user._id
        })
        .select('trackingNumber status origin destination currentLocation estimatedDeliveryDate trackingHistory');

        if (!shipment) {
            return res.status(404).json({ message: 'Shipment not found' });
        }

        res.status(200).json({
            trackingNumber: shipment.trackingNumber,
            status: shipment.status,
            origin: shipment.origin,
            destination: shipment.destination,
            currentLocation: shipment.currentLocation,
            estimatedDeliveryDate: shipment.estimatedDeliveryDate,
            trackingHistory: shipment.trackingHistory
        });
    } catch (error) {
        res.status(500).json({ message: 'Error tracking shipment', error: error.message });
    }
};

// Update tracking status (Operational Officer)
exports.updateTrackingStatus = async (req, res) => {
    try {
        const { trackingNumber } = req.params;
        const { location, status, notes } = req.body;

        const shipment = await Shipment.findOne({ trackingNumber });
        
        if (!shipment) {
            return res.status(404).json({ message: 'Shipment not found' });
        }

        // Add new tracking update
        shipment.trackingHistory.push({
            location,
            status,
            notes,
            updatedBy: req.user._id
        });

        // Update current location and status
        shipment.currentLocation = location;
        shipment.status = status === 'delivered' ? 'delivered' : 'in-transit';

        await shipment.save();

        res.status(200).json({
            message: 'Tracking status updated successfully',
            shipment
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating tracking status', error: error.message });
    }
};

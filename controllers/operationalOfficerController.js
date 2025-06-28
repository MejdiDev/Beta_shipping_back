const Shipment = require('../models/shipmentSchema');
const Quote = require('../models/quoteSchema');

const Document = require('../models/documentSchema');
const UploadFile = require('../middlewares/uploadFile'); // Corrected import
const User = require('../models/usersSchema'); // Added missing User model import

const mongoose = require("mongoose");
const { notifyUser } = require('./notificationController');

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
            message: 'Client shipments retrieved successfully',
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
            })
        }

        else if(shipment.detailsId) {
            resShip = await Shipment.findOne({ _id: req.params.id, detailsId: { $exists: true } }).populate('detailsId')
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



// Upload document
module.exports.uploadDocument = async (req, res) => {
    try {
        UploadFile.single('operationalDocument')(req, res, async (err) => { // Corrected usage
            if (err) {
                return res.status(500).json({ message: 'File upload error', error: err.message });
            }

            const { shipmentId, clientId, description } = req.body;

            if (!req.file) {
                return res.status(400).json({ message: 'No file uploaded' });
            }

            const document = new Document({
                shipmentId,
                filename: req.file.filename,
                path: req.file.path,
                description
            });

            await document.save();

            notifyUser({
                userId: clientId,
                contentId: shipmentId,
                referenceModel: "Document",
                content: "A document was added to your shipment !"
            });

            res.status(201).json({ message: 'Document uploaded successfully', document });
        });
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
        const quote = await Quote.findById(req.params.id);
        if (!quote) {
            return res.status(404).json({ message: 'Quote not found' });
        }
        res.status(200).json(quote);
    } catch (error) {
        res.status(500).json({ message: 'Server error', error: error.message });
    }
};

// Create client repository
module.exports.createClientRepository = async (req, res) => {
    try {
        const clientId = req.params.clientId;

        // Check if the client exists
        const client = await User.findById(clientId);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        // Create a new repository for the client
        const repository = {
            clientId: clientId,
            documents: []
        };

        // Save the repository to the database
        client.repository = repository;
        await client.save();

        res.status(201).json({ message: 'Client repository created successfully', repositoryId: client.repository._id });
    } catch (error) {
        res.status(500).json({ message: 'Error creating client repository', error: error.message });
    }
};

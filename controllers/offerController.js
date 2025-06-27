const Offer = require('../models/offerSchema');
const Quote = require('../models/quoteSchema');
const { notifyUser, notifyAllWithRole } = require('./notificationController');
const { createShipment } = require('./shipmentController');

// Create a new offer
exports.createOffer = async (req, res) => {
    try {
        const offer = new Offer(req.body);
        const resOffer = await offer.save();
        
        const { quoteId } = req.body
        const { clientId } = await Quote.findById(quoteId).select('clientId');

        notifyUser({
            userId: clientId,
            contentId: resOffer._id,
            referenceModel: "offer",
            content: "You have an offer for your Quote !"
        });

        await Quote.findByIdAndUpdate(
            quoteId,
            { status: 'quoted' },
            { new: true }
        );

        res.status(201).json({ message: 'Offer created successfully', offer });
    } catch (error) {
        res.status(500).json({ message: 'Error creating offer', error: error.message });
    }
};

// Accept existing offer (Make new shipment)
exports.acceptOffer = async (req, res) => {
    await Offer.findByIdAndUpdate(
        req.body.offerId,
        { result: 'accepted' },
        { new: true }
    );

    notifyUser({
        userId: req.body.clientId,
        contentId: req.body.offerId,
        referenceModel: "offer",
        content: "You accepted our offer !"
    });

    createShipment(req, res)
}

// Check if there was an offer added for this quote
exports.checkOfferExists = async (req, res) => {
    try {
        const resOffers = await Offer.find({ quoteId: req.query.quoteId })

        res.status(201).json({
            OfferExists: resOffers.length > 0,
            amount: ( resOffers.length > 0 ) ? resOffers[0].amount : 0
        });
    } catch (error) {
        res.status(500).json({ message: 'Error creating offer', error: error.message });
    }
}

// Get all offers
exports.getAllOffers = async (req, res) => {
    try {
        const offers = await Offer.find().populate('assignedTo', 'name last');
        res.status(200).json(offers);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving offers', error: error.message });
    }
};

// Get a specific offer by ID
exports.getOfferById = async (req, res) => {
    try {
        const offer = await Offer.findById(req.params.id)
            .populate({
                path: 'quoteId',
                populate: {
                    path: 'detailsId'
                },
            });

        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }
        res.status(200).json(offer);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving offer', error: error.message });
    }
};

// Update a offer by ID
exports.updateOffer = async (req, res) => {
    try {
        const offer = await Offer.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }
        res.status(200).json({ message: 'Offer updated successfully', offer });
    } catch (error) {
        res.status(500).json({ message: 'Error updating offer', error: error.message });
    }
};

// Delete a offer by ID
exports.deleteOffer = async (req, res) => {
    try {
        const offer = await Offer.findByIdAndDelete(req.params.id);
        if (!offer) {
            return res.status(404).json({ message: 'Offer not found' });
        }
        res.status(200).json({ message: 'Offer deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting offer', error: error.message });
    }
};

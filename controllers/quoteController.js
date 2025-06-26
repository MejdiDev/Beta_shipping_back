const Quote = require("../models/quoteSchema");
const User = require("../models/usersSchema");

const mongoose = require("mongoose");
const { notifyAllWithRole } = require("./notificationController");

const FCL = require("../models/quotes/FCLDetails");
const LCL = require("../models/quotes/LCLDetails");
const AIR = require("../models/quotes/AIRDetails");

// Request a quote (Client)
exports.requestQuote = async (req, res) => {
  try {
    const { shipDetails, shipmentMode } = req.body;
    
    const shipmentModel = mongoose.model( shipmentMode.toLowerCase() );
    const shipmentDetailsInstance = new shipmentModel( shipDetails );
    
    const resShipmentDetails = await shipmentDetailsInstance.save();

    // Create the quote and store just the shipmentMode and the detailsId
    const quote = new Quote({
      clientId: shipDetails.clientId,
      shipmentType: shipmentMode.toLowerCase(),
      detailsId: resShipmentDetails._id,
    });

    // Save the quote document
    const resQuote = await quote.save();

    // Notify all sales agents of the new quote request
    notifyAllWithRole({
      notifData: {
        contentId: resQuote._id,
        referenceModel: "Quote",
        content: "A new Quote Request has been added !",
      },
      role: "salesAgent",
    });

    // Send success response
    res.status(201).json({
      message: "Quote requested successfully",
      quote: resQuote,
    });
  } catch (error) {
    console.error("Error in requesting quote:", error); // Log the error for better debugging

    // Return error response with the specific message
    res.status(500).json({
      message: "Error requesting quote",
      error: error.message || "An unexpected error occurred",
    });
  }
};

// Get client's quotes (Client)
exports.getClientQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find({
      clientId: req.query.userId,
    })
    .populate('detailsId')
    .sort({ createdAt: 1 });

    res.status(200).json(quotes);
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving quotes",
      error: error.message,
    });
  }
};

// Get quote by ID (Client)
exports.getQuoteById = async (req, res) => {
  try {
    const quote = await Quote.findOne({
      _id: req.params.id,
      clientId: req.user._id,
    });

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

// Get all quotes (Sales Agent)
exports.getAllQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find()
      .populate("clientId", "name email phone")
      .sort({ requestDate: -1 });

    res.status(200).json(quotes);
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving quotes",
      error: error.message,
    });
  }
};

// Get pending quotes (Sales Agent)
exports.getPendingQuotes = async (req, res) => {
  try {
    const quotes = await Quote.find({ status: "pending" })
      .populate("clientId", "name email phone")
      .sort({ requestDate: -1 });

    res.status(200).json(quotes);
  } catch (error) {
    res.status(500).json({
      message: "Error retrieving pending quotes",
      error: error.message,
    });
  }
};

// Accept quote (Sales Agent)
exports.acceptQuote = async (req, res) => {
  // Send notification
  console.log("Notification: Quote accepted");
  try {
    const { estimatedCost, estimatedTime } = req.body;
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({ message: "Quote not found" });
    }

    if (quote.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Quote has already been processed" });
    }

    quote.status = "accepted";
    quote.estimatedCost = estimatedCost;
    quote.estimatedTime = estimatedTime;
    quote.salesAgentId = req.user._id;
    quote.processedDate = new Date();

    await quote.save();
    res.status(200).json({
      message: "Quote accepted successfully",
      quote,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error accepting quote",
      error: error.message,
    });
  }
};

// Reject quote (Sales Agent)
exports.rejectQuote = async (req, res) => {
  // Send notification
  console.log("Notification: Quote rejected");
  
  try {
    const { reason } = req.body;
    const quote = await Quote.findById(req.params.id);

    if (!quote) {
      return res.status(404).json({ message: "Quote not found" });
    }

    if (quote.status !== "pending") {
      return res
        .status(400)
        .json({ message: "Quote has already been processed" });
    }

    quote.status = "rejected";
    quote.rejectionReason = reason;
    quote.salesAgentId = req.user._id;
    quote.processedDate = new Date();

    await quote.save();
    res.status(200).json({
      message: "Quote rejected successfully",
      quote,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error rejecting quote",
      error: error.message,
    });
  }
};

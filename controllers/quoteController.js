const Quote = require("../models/quoteSchema");
const User = require("../models/usersSchema");

const mongoose = require("mongoose");
const { notifyAllWithRole } = require("./notificationController");

// Request a quote (Client)
exports.requestQuote = async (req, res) => {
  try {
    const {
      userId,
      origin,
      destination,
      weight,
      volume,
      height,
      width,
      length,
      mode,
      containerType,
      incoterm,
      serviceLevel,
      reqDelivery,
      readyDate,
    } = req.body;

    const quote = new Quote({
      userId,
      origin,
      destination,
      weight,
      volume,
      dimensions: { height, width, length },
      containerType: containerType.toLowerCase(),

      mode: mode.toLowerCase(),
      incoterm: incoterm.toLowerCase(),
      serviceLevel: serviceLevel.toLowerCase(),
      reqDelivery,
      readyDate,
    });

    const resQuote = await quote.save();

    notifyAllWithRole({
      notifData: {
        contentId: resQuote._id,
        referenceModel: "Quote",
        content: "A new Quote Request has been added !"
      },

      role: "salesAgent"
    })

    res.status(201).json({
      message: "Quote requested successfully",
      quote,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error requesting quote",
      error: error.message,
    });
  }
};

// Get client's quotes (Client)
exports.getClientQuotes = async (req, res) => {
  try {
    console.log("Client ID:", req.userId);
    const quotes = await Quote.find({
      clientId: req.userId,
    }).sort({ createdAt: 1 });

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

const express = require("express");
const router = express.Router();
const shipmentController = require("../controllers/shipmentController");
const operationalOfficerController = require("../controllers/operationalOfficerController");  
const uploadFile = require("../middlewares/uploadFile");
const shipmentModel = require("../models/shipmentSchema");
const { requireAuthUser, hasRole } = require("../middlewares/auth");

// Client Routes
router.get("/my-shipments", requireAuthUser, hasRole('client'), shipmentController.getClientShipments);
router.get("/:id", requireAuthUser, hasRole('client'), shipmentController.getShipmentById);
router.get("/:id/track", requireAuthUser, hasRole('client'), shipmentController.trackShipment);

// Operational Officer Routes
router.post("/create", requireAuthUser, hasRole('operationalOfficer'), shipmentController.createShipment);

router.put(
  "/:id/status",
  requireAuthUser, hasRole('operationalOfficer'),
  shipmentController.updateShipmentStatus
);

router.get(
  "/pending",
  requireAuthUser, hasRole('operationalOfficer'),
  shipmentController.getPendingShipments
);

router.get(
  "/in-transit",
  requireAuthUser, hasRole('operationalOfficer'),
  shipmentController.getInTransitShipments
);

// Shared Routes (All authenticated users)
router.get(
  "/delivered",
  requireAuthUser, hasRole('client', 'financialOfficer', 'operationalOfficer', 'admin'),
  shipmentController.getDeliveredShipments
);

// Admin and Financial Officer Routes
router.get(
  "/",
  requireAuthUser, hasRole('admin', 'financialOfficer', 'operationalOfficer'),
  shipmentController.getAllShipments
);

// Tracking routes for clients
router.get(
  "/track/:trackingNumber",
  requireAuthUser, hasRole('client', 'operationalOfficer', 'admin'),
  shipmentController.trackShipment
);

// Tracking update route for operational officers
router.post(
  "/track/:trackingNumber/update",
  requireAuthUser, hasRole('operationalOfficer'),
  shipmentController.updateTrackingStatus
);

// Delete shipment (Operational Officer)
router.delete("/:id", requireAuthUser, hasRole('operationalOfficer'), shipmentController.deleteShipment);

module.exports = router;

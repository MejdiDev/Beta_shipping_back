const express = require('express');
const router = express.Router();
const operationalOfficerController = require('../controllers/operationalOfficerController');
const { requireAuthUser, hasRole } = require('../middlewares/auth');
const uploadFile = require('../middlewares/uploadFile');

var taskRouter = require("../routes/taskRouter");

// Get all shipments
router.get('/shipments', requireAuthUser, hasRole('operationalOfficer'), operationalOfficerController.getAllShipments);

// Get shipment by ID
router.get('/shipments/:id', requireAuthUser, hasRole('operationalOfficer'), operationalOfficerController.getShipmentById);

// Create a new shipment
router.post('/shipments', requireAuthUser, hasRole('operationalOfficer'), operationalOfficerController.createShipment);

// Update shipment
router.put('/shipments/:id', requireAuthUser, hasRole('operationalOfficer'), operationalOfficerController.updateShipment);

// Delete shipment
router.delete('/shipments/:id', requireAuthUser, hasRole('operationalOfficer'), operationalOfficerController.deleteShipment);

// Get all quotes
router.get('/quotes', requireAuthUser, hasRole('operationalOfficer'), operationalOfficerController.getAllQuotes);

router.get('/clients', requireAuthUser, hasRole('operationalOfficer'), operationalOfficerController.getAllClients);

router.use('/task', taskRouter);

// Upload document
router.post('/documents', requireAuthUser, hasRole('operationalOfficer'), uploadFile.single('document'), operationalOfficerController.uploadDocument);

router.get('/quotes/:id', requireAuthUser, hasRole('operationalOfficer'), operationalOfficerController.getQuoteById);

// Create client repository
router.post('/clients/:clientId/repository', requireAuthUser, hasRole('operationalOfficer'), operationalOfficerController.createClientRepository);

module.exports = router;

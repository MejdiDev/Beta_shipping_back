const express = require('express');
const router = express.Router();
const financialOfficerController = require('../controllers/financialOfficerController');
const { requireAuthUser, hasRole } = require('../middlewares/auth');

// Generate invoice
router.post('/invoices', requireAuthUser, hasRole('financialOfficer'), financialOfficerController.generateInvoice);

// Get all invoices
router.get('/invoices', requireAuthUser, hasRole('financialOfficer'), financialOfficerController.getAllInvoices);

// Get invoice by ID
router.get('/invoices/:id', requireAuthUser, hasRole('financialOfficer'), financialOfficerController.getInvoiceById);

// Update invoice
router.put('/invoices/:id', requireAuthUser, hasRole('financialOfficer'), financialOfficerController.updateInvoice);

// Send invoice
router.post('/invoices/:id/send', requireAuthUser, hasRole('financialOfficer'), financialOfficerController.sendInvoice);

// Get all clients
router.get('/clients', requireAuthUser, hasRole('financialOfficer'), financialOfficerController.getAllClients);

// Get quote by ID
router.get('/quotes/:id', requireAuthUser, hasRole('financialOfficer'), financialOfficerController.getQuoteById);

// Get user by ID
router.get('/users/:id', requireAuthUser, hasRole('financialOfficer'), financialOfficerController.getUserById);

// Get all shipments
router.get('/shipments', requireAuthUser, hasRole('financialOfficer'), financialOfficerController.getAllShipments);

module.exports = router;

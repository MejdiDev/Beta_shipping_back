const express = require('express');
const router = express.Router();

const clientController = require('../controllers/clientController');
const notifController = require('../controllers/notificationController');
const offerController = require('../controllers/offerController');

const { requireAuthUser, hasRole } = require('../middlewares/auth');

// Profile
router.get('/getProfile', requireAuthUser, hasRole('client'), clientController.getProfile);
router.put('/updateProfile', requireAuthUser, hasRole('client'), clientController.updateProfile);

// Password
router.put('/updatePassword', requireAuthUser, hasRole('client'), clientController.updatePassword);

// Quotes
router.post('/requestQuote', requireAuthUser, hasRole('client'), clientController.requestQuote);
router.get('/getClientQuotes', requireAuthUser, hasRole('client'), clientController.getClientQuotes);

// Offer
router.post('/offer/accept', requireAuthUser, hasRole('client'), offerController.acceptOffer);
router.get('/offer/:id', requireAuthUser, hasRole('client'), offerController.getOfferById);

// Shipments
router.get('/getShipments', requireAuthUser, hasRole('client'), clientController.getShipments);
router.get('/shipments/:id/details', requireAuthUser, hasRole('client'), clientController.getDocuments);

// Notification routes
router.get('/notif', requireAuthUser, hasRole('client'), notifController.getAllNotifs);

// Invoices & Payments
router.get('/getInvoices', requireAuthUser, hasRole('client'), clientController.getInvoices);

// Account Management
router.delete('/deleteAccount', requireAuthUser, hasRole('client'), clientController.deleteAccount);

// Download document
router.get('/documents/:id/download', requireAuthUser, hasRole('client'), clientController.downloadDocument);

module.exports = router;
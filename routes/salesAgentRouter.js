const express = require('express');
const salesAgentController = require('../controllers/salesAgentController');
const { requireAuthUser, hasRole } = require('../middlewares/auth');

const router = express.Router();
var taskRouter = require("../routes/taskRouter");

const notifController = require('../controllers/notificationController');
const offerController = require('../controllers/offerController');
const usersController = require('../controllers/usersController');

// Lead routes
router.get('/leads', requireAuthUser, hasRole('salesAgent'), salesAgentController.getAllLeads);
router.get('/leads/:id', requireAuthUser, hasRole('salesAgent'), salesAgentController.getLeadById);
router.post('/leads', requireAuthUser, hasRole('salesAgent'), salesAgentController.createLead);
router.put('/leads/:id', requireAuthUser, hasRole('salesAgent'), salesAgentController.updateLead);
router.delete('/leads/:id', requireAuthUser, hasRole('salesAgent'), salesAgentController.deleteLead);

// Task routes
router.use('/task', taskRouter);
router.get('/getAllWithRole', requireAuthUser, hasRole('salesAgent'), usersController.getAllActors);


// Notification routes
router.get('/notif', requireAuthUser, hasRole('salesAgent'), notifController.getAllNotifs);

router.post('/notif', requireAuthUser, hasRole('salesAgent'), notifController.createNotif);
router.get('/notif/:id', requireAuthUser, hasRole('salesAgent'), notifController.getNotifById);

// Client routes
router.get('/clients', requireAuthUser, hasRole('salesAgent'), salesAgentController.getAllClients);
router.get('/clients/:id', requireAuthUser, hasRole('salesAgent'), salesAgentController.searchClientById);

// Quote routes
router.get('/quotes', requireAuthUser, hasRole('salesAgent'), salesAgentController.getAllQuotes);
router.get('/quotes/:id', requireAuthUser, hasRole('salesAgent'), salesAgentController.getClientQuotes);
router.put('/quotes/:id/approve', requireAuthUser, hasRole('salesAgent'), salesAgentController.approveQuote);
router.put('/quotes/:id/reject', requireAuthUser, hasRole('salesAgent'), salesAgentController.rejectQuote);

//Offer Routes
router.post('/offer', requireAuthUser, hasRole('salesAgent'), offerController.createOffer);
router.get('/offer/:id', requireAuthUser, hasRole('salesAgent'), offerController.getOfferById);
router.get('/offer/check/exists', requireAuthUser, hasRole('salesAgent'), offerController.checkOfferExists);

module.exports = router;
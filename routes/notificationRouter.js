const express = require('express');
const router = express.Router();
const notifController = require('../controllers/notificationController');
const { requireAuthUser, hasRole } = require('../middlewares/auth');

// Client Routes
router.post('/', requireAuthUser, hasRole('client'), notifController.createNotif);
router.get('/', requireAuthUser, hasRole('client'), notifController.getAllNotifs);
router.get('/:id', requireAuthUser, hasRole('client'), notifController.getNotifById);

router.put('/', requireAuthUser, hasRole('client', 'salesAgent', 'operationalOfficer'), notifController.markNotifAsRead);
router.get('/check/new', requireAuthUser, hasRole('client', 'salesAgent', 'operationalOfficer', 'admin'), notifController.getNewNotifs);

module.exports = router;
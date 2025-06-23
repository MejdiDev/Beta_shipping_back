const express = require('express');
const router = express.Router();
const quoteController = require('../controllers/quoteController');
const { requireAuthUser, hasRole } = require('../middlewares/auth');

// Client Routes
router.post('/request', requireAuthUser, hasRole('client'), quoteController.requestQuote);
router.get('/my-quotes', requireAuthUser, hasRole('client'), quoteController.getClientQuotes);
router.get('/:id', requireAuthUser, hasRole('client'), quoteController.getQuoteById);

// Sales Agent Routes
router.get('/all', requireAuthUser, hasRole('salesAgent'), quoteController.getAllQuotes);
router.get('/pending', requireAuthUser, hasRole('salesAgent'), quoteController.getPendingQuotes);
router.put('/:id/accept', requireAuthUser, hasRole('salesAgent'), quoteController.acceptQuote);
router.put('/:id/reject', requireAuthUser, hasRole('salesAgent'), quoteController.rejectQuote);

module.exports = router;

const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const { requireAuthUser, hasRole } = require('../middlewares/auth');

// Create a new lead (Sales Agent)
router.post('/', requireAuthUser, hasRole('salesAgent'), leadController.createLead);

// Get all leads (Sales Agent)
router.get('/', requireAuthUser, hasRole('salesAgent'), leadController.getAllLeads);

// Get a specific lead by ID (Sales Agent)
router.get('/:id', requireAuthUser, hasRole('salesAgent'), leadController.getLeadById);

// Update a lead by ID (Sales Agent)
router.put('/:id', requireAuthUser, hasRole('salesAgent'), leadController.updateLead);

// Delete a lead by ID (Sales Agent)
router.delete('/:id', requireAuthUser, hasRole('salesAgent'), leadController.deleteLead);

module.exports = router;
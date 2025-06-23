const express = require('express');
const router = express.Router();
const invoiceController = require('../controllers/invoiceController');
const { requireAuthUser, hasRole } = require('../middlewares/auth');
const uploadFile = require('../middlewares/uploadFile');

// Client Routes
router.get('/my-invoices', 
    requireAuthUser, hasRole('client'),
    invoiceController.getClientInvoices
);

// Financial Officer Routes
router.post('/create', 
    requireAuthUser, hasRole('financialOfficer'),
    invoiceController.createInvoice
);

router.get('/all', 
    requireAuthUser, hasRole('financialOfficer'),
    invoiceController.getAllInvoices
);

router.get('/pending', 
    requireAuthUser, hasRole('financialOfficer'),
    invoiceController.getPendingInvoices
);

router.get('/overdue', 
    requireAuthUser, hasRole('financialOfficer'),
    invoiceController.getOverdueInvoices
);

router.put('/:id/status', 
    requireAuthUser, hasRole('financialOfficer'),
    invoiceController.updateInvoiceStatus
);

// Shared Routes (with role-based access)
router.get('/:id', 
    requireAuthUser, hasRole('client', 'financialOfficer'),
    invoiceController.getInvoiceById
);

router.post(
    '/upload',
    requireAuthUser, hasRole('financialOfficer'),
    uploadFile.single('invoice'),
    invoiceController.uploadInvoice
);

router.get('/download/:id',
    requireAuthUser, hasRole('financialOfficer'),
    invoiceController.downloadInvoice
);

router.put('/:id',
    requireAuthUser, hasRole('financialOfficer'),
    invoiceController.updateInvoice
);

module.exports = router;

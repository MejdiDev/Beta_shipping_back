const express = require("express");
const router = express.Router();
const documentController = require("../controllers/documentController");
const { requireAuthUser, hasRole } = require("../middlewares/auth");
const upload = require("../middlewares/uploadFile");

// CLIENT ROUTES
// Get all documents for logged-in client (renamed from /document to make more semantic sense)
router.get("/client/all", requireAuthUser, hasRole('client'), documentController.getAllDocuments);

// Get financial documents for logged-in client
router.get(
  "/client/financial",
  requireAuthUser, hasRole('client'),
  documentController.getClientFinancialDocuments
);

// Get operational documents for logged-in client
router.get(
  "/client/operational/:id",
  requireAuthUser, hasRole('client'),
  documentController.getClientOperationalDocuments
);

// Delete document (client can delete their own documents)
router.delete("/:documentId", requireAuthUser, hasRole('client'), documentController.deleteDocument);

// FINANCIAL OFFICER ROUTES
// Get all financial documents
router.get(
  "/financial/all",
  requireAuthUser, hasRole('financialOfficer'),
  documentController.getFinancialDocuments
);

// OPERATIONAL OFFICER ROUTES
// Get all operational documents
router.get(
  "/operational/all",
  requireAuthUser, hasRole('operationalOfficer'),
  documentController.getOperationalDocuments
);

// ADMIN ROUTES
// Get all documents (for admin)
router.get("/all", requireAuthUser, hasRole('admin'), documentController.getAllDocuments);

// Get document by ID
router.get("/:id", requireAuthUser, hasRole('admin'), documentController.getDocumentById);

// Update document
router.put("/:id", requireAuthUser, hasRole('admin'), documentController.updateDocument);

// SHARED ROUTES (accessible by multiple roles)
// Get documents by client ID
router.get(
  "/client/:clientId",
  requireAuthUser, hasRole('admin', 'financialOfficer', 'operationalOfficer'),
  documentController.getDocuments
);

// Download document (accessible by all authenticated users)
router.get(
  "/download/:documentId",
  requireAuthUser, hasRole('client', 'operationalOfficer', 'admin'),
  documentController.downloadDocument
);

// Upload document route (financial and operational officers only)
router.post(
  "/upload",
  requireAuthUser, hasRole('financialOfficer', 'operationalOfficer', 'admin'),
  upload.single("document"),
  documentController.uploadDocument
);

router.put(
  "/operational/:documentId/verify",
  requireAuthUser, hasRole('operationalOfficer'),
  documentController.verifyDocument
);

module.exports = router;

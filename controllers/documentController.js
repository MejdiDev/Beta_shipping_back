const Document = require('../models/documentSchema');
const Shipment = require('../models/shipmentSchema');
const User = require('../models/usersSchema');
const fs = require('fs').promises;
const path = require('path');
const { isAdmin, isFinancialOfficer, isOperationalOfficer,isClient } = require('../middlewares/auth');
const { notifyUser } = require('./notificationController');

// Upload document (Client, Financial Officer, Operational Officer)
module.exports.uploadDocument = async (req, res) => {
    console.log("----------------------------------")
    
    try {
        const { shipmentId, clientId, documentType, documentCategory } = req.body;
        const file = req.file;
 
        if (!file) {
            return res.status(400).json({ message: 'No file uploaded' });
        }

        let userId;

        if (clientId) {
            // Verify client exists
            const client = await User.findById(clientId);
            if (!client) {
                return res.status(404).json({ message: 'Client not found' });
            }
            userId = clientId;
        } else {
            return res.status(400).json({ message: 'clientId must be provided' });
        }

        const document = new Document({
            shipmentId: shipmentId || null,
            clientId: clientId || null,
            userId: userId,
            documentType,
            documentCategory,
            fileName: file.originalname,
            filePath: file.path,
            fileType: file.mimetype,
            fileSize: file.size,
            uploadedBy: req.user._id
        });

        await document.save();

        notifyUser({
            userId: clientId,
            contentId: shipmentId,
            referenceModel: "Document",
            content: "A document was added to your shipment !"
        });

        res.status(201).json({
            message: 'Document uploaded successfully',
            document: {
                id: document._id,
                documentType: document.documentType,
                documentCategory: document.documentCategory,
                fileName: document.fileName,
                documentCategory: document.documentCategory
            }
        });

    } catch (error) {
        res.status(500).json({ message: 'Error uploading document', error: error.message });
    }
};

// Get documents for a shipment (Client, Financial Officer, Operational Officer, Admin)
exports.getDocuments = async (req, res) => {
    try {
        const { shipmentId } = req.params;

        // Verify shipment exists
        const shipment = await Shipment.findById(shipmentId);
        if (!shipment) {
            return res.status(404).json({ message: 'Shipment not found' });
        }

        // Check permissions based on role
        if (req.user.role === 'client' && shipment.clientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to view these documents' });
        }

        const documents = await Document.find({ shipmentId })
            .populate('uploadedBy', 'name email')
            .populate('verifiedBy', 'name email');

        res.status(200).json({
            message: 'Documents retrieved successfully',
            documents
        });
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving documents', error: error.message });
    }
};

// Get financial documents (Financial Officer)
exports.getFinancialDocuments = async (req, res) => {
    try {
        const documents = await Document.find({ documentCategory: 'financial' })
            .populate('shipmentId')
            .populate('userId', 'name email');

        res.status(200).json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving financial documents', error: error.message });
    }
};

// Get operational documents (Operational Officer)
exports.getOperationalDocuments = async (req, res) => {
    try {
        const documents = await Document.find({ documentCategory: 'operational' })
            .populate('shipmentId')
            .populate('userId', 'name email');

        res.status(200).json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Error retrieving operational documents', error: error.message });
    }
};


// Download document (Client, Financial Officer, Operational Officer, Admin)
exports.downloadDocument = async (req, res) => {
    try {
        const { documentId } = req.params;

        const document = await Document.findById(documentId)
            .populate('shipmentId');

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Check permissions
        if (req.user.role === 'client' && 
            document.shipmentId.clientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to download this document' });
        }

        // Check if file exists
        try {
            await fs.access(document.filePath);
        } catch (error) {
            return res.status(404).json({ message: 'File not found' });
        }

        res.download(document.filePath, document.fileName);
    } catch (error) {
        res.status(500).json({ message: 'Error downloading document', error: error.message });
    }
};

// Delete document
exports.deleteDocument = async (req, res) => {
    try {
        const { documentId } = req.params;

        let document;
        if (['financialOfficer', 'admin', 'salesAgent', 'operationalOfficer'].includes(req.user.role)) {
            document = await Document.findById(documentId);
        } else {
            document = await Document.findOne({
                _id: documentId,
                userId: req.user._id
            });
        }

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Delete file from storage
        try {
            await fs.unlink(document.filePath);
        } catch (error) {
            console.error('Error deleting file:', error);
        }

        await document.deleteOne();

        res.status(200).json({ message: 'Document deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting document', error: error.message });
    }
};

// Helper function to get required documents based on shipment type
function getRequiredDocuments(shipmentType) {
    const baseDocuments = ['commercial_invoice', 'packing_list'];
    
    const typeSpecificDocuments = {
        international: ['certificate_of_origin', 'export_declaration', 'import_permit'],
        hazardous: ['safety_data_sheet', 'hazardous_materials_declaration'],
        temperature_controlled: ['temperature_log', 'storage_instructions']
    };

    return [...baseDocuments, ...(typeSpecificDocuments[shipmentType] || [])];
}

// Helper function to notify user about document verification
async function notifyUserAboutDocumentVerification(document) {
    const user = await User.findById(document.userId);
    // Implement notification logic (email, push notification, etc.)
}

// Get all documents (with role-based filtering)
exports.getClientFinancialDocuments = async (req, res) => {
    try {
        const documents = await Document.find({
            clientId: req.user._id,
            documentCategory: 'financial'
        })
            .populate('uploadedBy', 'name email')
            .populate('clientId', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching financial documents', error: error.message });
    }
};

exports.getClientOperationalDocuments = async (req, res) => {
    try {
        const documents = await Document.find({
            clientId: req.user._id,
            documentCategory: 'operational'
        })
            .populate('uploadedBy', 'name email')
            .populate('clientId', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching operational documents', error: error.message });
    }
};

exports.getAllDocuments = async (req, res) => {
    try {
        let query = {};

        // Role-based document access
        switch (req.user.role) {
            case 'admin':
                // Admin can see all documents
                break;
            case 'financialOfficer':
            case 'operationalOfficer':
                // Can see all documents
                break;
            case 'client':
                // Clients can only see their own documents
                query = { clientId: req.user._id };
                break;
            default:
                return res.status(403).json({ message: 'Unauthorized to view documents' });
        }

        const documents = await Document.find(query)
            .populate('uploadedBy', 'name email')
            .populate('clientId', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json(documents);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching documents', error: error.message });
    }
};

// Get document by ID
exports.getDocumentById = async (req, res) => {
    try {
        const document = await Document.findById(req.params.id)
            .populate('uploadedBy', 'name email')
            .populate('clientId', 'name email');

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Check if user has permission to view this document
        if (req.user.role === 'client' && document.clientId.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Unauthorized to view this document' });
        }

        res.status(200).json(document);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching document', error: error.message });
    }
};

// Update document
exports.updateDocument = async (req, res) => {
    try {
        const { description, documentType, status } = req.body;
        const document = await Document.findById(req.params.id);

        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }

        // Check if user has permission to update
        if (!['admin', 'financialOfficer', 'operationalOfficer'].includes(req.user.role)) {
            return res.status(403).json({ message: 'Unauthorized to update documents' });
        }

        // Update fields
        if (description) document.description = description;
        if (documentType) document.documentType = documentType;
        if (status) document.status = status;

        await document.save();

        res.status(200).json({
            message: 'Document updated successfully',
            document
        });
    } catch (error) {
        res.status(500).json({ message: 'Error updating document', error: error.message });
    }
};
// verifyDocument implementation to add to your documentController.js

// Verify document (for both financial and operational documents)
exports.verifyDocument = async (req, res) => {
    try {
        const { documentId } = req.params;
        const document = await Document.findById(documentId);
        
        if (!document) {
            return res.status(404).json({ message: 'Document not found' });
        }
        
        // Check if user is allowed to verify this type of document
        if (req.user.role === 'financialOfficer' && document.documentCategory !== 'financial') {
            return res.status(403).json({ message: 'Financial officers can only verify financial documents' });
        }
        
        if (req.user.role === 'operationalOfficer' && document.documentCategory !== 'operational') {
            return res.status(403).json({ message: 'Operational officers can only verify operational documents' });
        }
        
        // Update document verification status
        document.verifiedBy = req.user._id;  
        document.verifiedAt = new Date();
        
        await document.save();
        
        // Notify the client about document verification if needed
        // await notifyUserAboutDocumentVerification(document);
        
        res.status(200).json({
            message: 'Document verified successfully',
            document: {
                id: document._id,
                documentType: document.documentType,
                documentCategory: document.documentCategory,
                fileName: document.fileName,
                verifiedAt: document.verifiedAt
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Error verifying document', error: error.message });
    }
};

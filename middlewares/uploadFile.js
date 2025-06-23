const multer = require('multer');
const path = require('path');

// Configure storage for Multer
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'uploads/'); // Folder where the uploaded files are saved
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname)); // Use a timestamp for the filename to avoid overwriting
    }
});

// Define multer upload middleware for a single file with field name 'document'
const upload = multer({ storage: storage });

module.exports = upload;
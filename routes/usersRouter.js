const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { requireAuthUser } = require('../middlewares/auth');
const upload = require('../middlewares/uploadFile'); // Assuming you have a file upload middleware

/* GET users listing. */

//router.get('/getAllUsers',usersController.getAllUsers ); //get all

// Public routes
router.post("/addUser", usersController.addUser);
router.post("/login", usersController.login);

// Protected routes (require authentication)

router.post("/logout", requireAuthUser, usersController.logout);
router.get("/:id", requireAuthUser, usersController.getUserById);
router.post("/forgotPassword", usersController.forgotPassword);
router.post("/resetPassword/:token", usersController.resetPassword);

module.exports = router;

const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const { requireAuthUser, hasRole } = require("../middlewares/auth.js");


router.get("/getMyProfile", requireAuthUser, hasRole('admin'), adminController.getProfile); // get profile
router.put("/updateMyProfile", requireAuthUser, hasRole('admin'), adminController.updateProfile); // update profile
router.delete("/deleteUser/:id", requireAuthUser, hasRole('admin'), adminController.deleteUser); // delete user

router.get("/getAllUsers", requireAuthUser, hasRole('admin'), adminController.getAllUsers); // get all users
router.get("/user/:id", requireAuthUser, hasRole('admin'), adminController.getUserById); // get user by ID
router.put("/user/:id/reset-password", requireAuthUser, hasRole('admin'), adminController.resetUserPassword); // reset user password

router.put("/updatePassword", requireAuthUser, hasRole('admin'), adminController.updatePassword); // update password
router.delete("/deleteAccount", requireAuthUser, hasRole('admin'), adminController.deleteAccount); // delete account
router.get("/getAllShipments", requireAuthUser, hasRole('admin'), adminController.getAllShipments); // get all shipments
router.get("/getShipmentById/:id", requireAuthUser, hasRole('admin'), adminController.getShipmentById); // get shipment by ID
router.get("/getPendingShipments", requireAuthUser, hasRole('admin'), adminController.getPendingShipments); // get pending shipments
router.get("/getAllQuotes", requireAuthUser, hasRole('admin'), adminController.getAllQuotes); // get all quotes
router.get("/getQuoteById/:id", requireAuthUser, hasRole('admin'), adminController.getQuoteById); // get quote by id


router.put("/user/:id/assign-role", requireAuthUser, hasRole('admin'), adminController.assignRole); // assign updaterole to user
module.exports = router;

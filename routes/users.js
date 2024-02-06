const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

// Create a user
router.post("/", userController.create_user);

// Update a user
// Delete a user
// Log in to user account
// Log out of user account

module.exports = router;

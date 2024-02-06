const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");

// Create a user
router.post("/", userController.create_user);

// Update a user
router.put("/:id", userController.update_user);

// Delete a user
router.delete("/:id", userController.delete_user);

// Log in to user account
router.post("/login", userController.login);

// Log out of user account
router.post("/logout", userController.logout);

module.exports = router;

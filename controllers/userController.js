const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const { decode } = require("html-entities");

const User = require("../models/user");

// Create a user
exports.create_user = (req, res) => {
  res.send("Create a user NYI");
};

// Update a user
exports.update_user = (req, res) => {
  res.send("Update a user NYI");
};

// Delete a user
exports.delete_user = (req, res) => {
  res.send("Delete a user NYI");
};

// Log in to user account
exports.login = (req, res) => {
  res.send("Login NYI");
};

// Log out of user account
exports.logout = (req, res) => {
  res.send("Logout NYI");
};

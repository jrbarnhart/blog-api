const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const User = require("../models/user");

// Create a user
exports.create_user = asyncHandler(async (req, res, next) => {
  [
    body("username")
      .isString()
      .withMessage("Username must be a string")
      .trim()
      .escape()
      .exists({ values: "falsy" })
      .withMessage("Username requrired")
      .isLength({ min: 3, max: 200 })
      .withMessage("Username must be between 3-200 characters")
      .isEmail()
      .withMessage("Username must be an email")
      .normalizeEmail()
      .custom(async (value, { req }) => {
        const existingUser = await User.findOne({ username: value });
        if (existingUser) throw new Error("Username/email already in use");
      })
      .withMessage("Username/email already in use"),
    body("display_name")
      .isString()
      .withMessage("Display name must be a string")
      .trim()
      .escape()
      .exists({ values: "falsy" })
      .withMessage("Display name required")
      .isLength({ min: 1, max: 25 })
      .withMessage("Display name must be between 1-25 characters"),
    body("password"),
    body("confirm_password"),
    body("is_admin"),
    body("admin_password"),
  ];
});

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

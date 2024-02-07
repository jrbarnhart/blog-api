const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("../models/user");

// Create a user
exports.create_user = [
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
    .escape()
    .exists({ values: "falsy" })
    .withMessage("Display name required")
    .isLength({ min: 1, max: 25 })
    .withMessage("Display name must be between 1-25 characters"),
  body("password")
    .isString()
    .withMessage("Password name must be a string")
    .exists({ values: "falsy" })
    .withMessage("Password required")
    .isLength({ min: 8, max: 200 })
    .withMessage("Password must be between 8-200 characters"),
  body("confirm_password")
    .isString()
    .withMessage("Password confirmation must be a string")
    .custom((value, { req }) => {
      return value === req.body.password;
    })
    .withMessage("Passwords do not match"),
  body("is_admin")
    .isBoolean()
    .withMessage("Incorrect admin status format")
    .exists()
    .withMessage("Admin status required"),
  body("admin_password")
    .isString()
    .withMessage("Admin password must be a string"),

  asyncHandler(async (req, res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      res.status(401).send({
        username: req.body.username,
        display_name: req.body.display_name,
        errors: validationErrors.array(),
      });
    } else {
      res.send({ status: "success!" });
      // Check admin pass if needed
      // If good then create the user
      // Encrypt password of user with bcrypt
      // Save the user record
    }
  }),
];
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

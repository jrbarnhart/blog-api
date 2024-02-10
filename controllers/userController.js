const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("../models/user");
const {
  checkTokenRequired,
  validateToken,
  isAdminToken,
} = require("../scripts/checkToken");
const handleValidationErrors = require("../scripts/handleValidationErrors");

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
    .custom(async (value) => {
      const existingUser = await User.findOne({ username: value }).exec();
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
    //Validate as string if body.is_admin is true
    .custom((value, { req }) => {
      if (req.body.is_admin === true) {
        return typeof value === "string";
      }
      return true;
    })
    .withMessage("Admin pass must be a string"),

  handleValidationErrors(["username", "display_name"]),

  asyncHandler(async (req, res, next) => {
    // If admin is requested but admin pass is incorrect add error
    if (
      req.body.is_admin &&
      req.body.admin_password !== process.env.ADMIN_PASSWORD
    ) {
      res.status(403).json({
        success: false,
        status: 403,
        message: "Access Forbidden",
      });
    }

    // Input is valid so create a user with hashed password
    bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
      if (err) {
        return next(err);
      }
      const newUser = new User({
        username: req.body.username,
        display_name: req.body.display_name,
        password: hashedPassword,
        access: "basic",
      });

      // Confirm user as admin. Password checked in validation above
      if (req.body.is_admin === true) {
        newUser.access = "admin";
      }

      // Save and return new user
      await newUser.save();
      res.json({
        success: true,
        _id: newUser.id,
        username: newUser.username,
        display_name: newUser.display_name,
        access: newUser.access,
      });
    });
  }),
];
// Update a user's display name
exports.update_user = [
  checkTokenRequired,
  validateToken,

  body("display_name_update")
    .isString()
    .withMessage("Display name must be a string")
    .trim()
    .escape()
    .exists({ values: "falsy" })
    .withMessage("Display name required")
    .isLength({ min: 1, max: 25 })
    .withMessage("Display name must be between 1-25 characters"),

  handleValidationErrors(["display_name_update"]),

  asyncHandler(async (req, res, next) => {
    if (
      req.params.id !== res.authData.user._id &&
      res.authData.user.access !== "admin"
    ) {
      // Can only update user's account unless admin
      res.status(403).json({
        success: false,
        status: 403,
        message: "Access Forbidden",
      });
    } else {
      const updatedUser = await User.findByIdAndUpdate(
        req.params.id,
        {
          display_name: req.body.display_name_update,
        },
        { new: true }
      );

      // Issue new token with new user info
      jwt.sign(
        { user: updatedUser },
        process.env.LOGIN_TOKEN_SECRET,
        { expiresIn: "3 days" },
        (err, token) => {
          if (err) {
            next(err);
          }
          res.json({
            success: true,
            updatedUser,
            token,
          });
        }
      );
    }
  }),
];

// Delete a user
exports.delete_user = [
  checkTokenRequired,
  validateToken,
  isAdminToken,

  asyncHandler(async (req, res, next) => {
    if (req.params.id === res.authData.user._id) {
      // Cannot delete currently logged into account
      res.status(403).json({
        success: false,
        status: 403,
        message: "Cannot delete account you are using",
      });
    } else {
      const deletedUser = await User.findByIdAndDelete(req.params.id);
      if (deletedUser) {
        res.json({
          success: true,
          deletedUser,
        });
      } else {
        res.status(404).json({
          success: false,
          status: 404,
          message: "Resource not founc",
        });
      }
    }
  }),
];

// Log in to user account - Logout is client side + JWT expiration
exports.login = [
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
    .normalizeEmail(),

  asyncHandler(async (req, res, next) => {
    // Authenticate user and password
    const user = await User.findOne({ username: req.body.username }).exec();
    const match = user
      ? await bcrypt.compare(req.body.password, user.password)
      : undefined;
    if (!user || !match) {
      res.status(401).json({
        success: false,
        status: 401,
        message: "Incorrect login information",
      });
    } else {
      jwt.sign(
        { user },
        process.env.LOGIN_TOKEN_SECRET,
        { expiresIn: "3 days" },
        (err, token) => {
          if (err) {
            next(err);
          }
          res.json({
            success: true,
            token,
          });
        }
      );
    }
  }),
];

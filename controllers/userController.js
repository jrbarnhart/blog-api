const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const User = require("../models/user");
const { verifyToken, validateToken } = require("../scripts/checkToken");

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

  asyncHandler(async (req, res, next) => {
    // Check for validation errors
    const validationErrors = validationResult(req);
    const errors = validationErrors.array();
    // If admin is requested but admin pass is incorrect add error
    if (
      req.body.is_admin &&
      req.body.admin_password !== process.env.ADMIN_PASSWORD
    ) {
      const adminPassError = {
        type: "field",
        value: req.body.admin_password,
        msg: "Incorrect admin password",
        path: "admin_password",
        location: "body",
      };
      errors.push(adminPassError);
    }
    if (Array.isArray(errors) && errors.length > 0) {
      // If validation errors then send error response json
      res.status(403).json({
        username: req.body.username,
        display_name: req.body.display_name,
        errors,
      });
    } else {
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
          _id: newUser.id,
          username: newUser.username,
          display_name: newUser.display_name,
          access: newUser.access,
        });
      });
    }
  }),
];
// Update a user's display name
exports.update_user = [
  verifyToken,
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

  asyncHandler(async (req, res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      res.status(403).json({
        display_name_update: req.body.display_name_update,
        errors: validationErrors.array(),
      });
    } else {
      const updatedUser = await User.findByIdAndUpdate(
        res.authData.user._id,
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
  verifyToken,
  validateToken,

  asyncHandler(async (req, res, next) => {
    if (res.authData.user.access !== "admin") {
      res.status(403).json({
        success: false,
        status: 403,
        message: "Forbidden",
      });
    } else {
      if (req.params.id === res.authData.user._id) {
        // Cannot delete currently logged into account
        res.status(403).json({
          success: false,
          status: 403,
          message: "Cannot delete account you are using",
        });
      } else {
        const deletedUser = await User.findByIdAndDelete(req.params.id);
        res.json({
          success: true,
          deletedUser,
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
    const user = await User.findOne({ username: req.body.username });
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
            token,
          });
        }
      );
    }
  }),
];

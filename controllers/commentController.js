const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const { decode } = require("html-entities");

const Comment = require("../models/comment");
const { verifyToken, validateToken } = require("../scripts/checkToken");

// Create a comment
exports.create_comment = [
  verifyToken,
  validateToken,
  (req, res) => {
    res.json({
      message: "Post created NYI",
      authData: res.authData,
    });
  },
];

// Get comments in a post
exports.get_comments = (req, res) => {
  res.send("Get comments NYI");
};

// Update a comment
exports.update_comment = (req, res) => {
  res.send("Update comment NYI");
};

// Delete a comment
exports.delete_comment = (req, res) => {
  res.send("Delete comment NYI");
};

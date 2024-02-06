const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const { decode } = require("html-entities");

const Comment = require("../models/comment");

// Create a comment
exports.create_comment = (req, res) => {
  res.send("Create comment NYI");
};

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

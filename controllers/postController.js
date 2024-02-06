const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const { decode } = require("html-entities");

const Post = require("../models/post");

// Create a post
exports.create_post = (req, res) => {
  res.send("Post create NYI");
};

// Get all posts
exports.get_posts = (req, res) => {
  res.send("Get all posts NYI");
};

// Get a post
exports.get_post = (req, res) => {
  res.send("Post lookup NYI");
};

// Update a post
exports.update_post = (req, res) => {
  res.send("Post update NYI");
};

// Delete a post
exports.delete_post = (req, res) => {
  res.send("Post delete NYI");
};

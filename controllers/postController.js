const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const { decode } = require("html-entities");

const Post = require("../models/post");
const { verifyToken, validateToken } = require("../scripts/checkToken");

// Create a post
exports.create_post = [
  verifyToken,
  validateToken,

  body("title")
    .isString()
    .withMessage("Title must be a string")
    .trim()
    .escape()
    .exists({ values: "falsy" })
    .withMessage("Title requrired")
    .isLength({ min: 1, max: 200 })
    .withMessage("Title must be between 3-200 characters"),
  body("text")
    .isString()
    .withMessage("Post text must be a string")
    .trim()
    .escape()
    .exists({ values: "falsy" })
    .withMessage("Post text required"),
  body("published")
    .isBoolean()
    .exists()
    .withMessage("Published true/false required"),

  asyncHandler(async (req, res, next) => {
    if (res.authData.user.access !== "admin") {
      res.status(403).json({
        success: false,
        status: 403,
        message: "Forbidden",
      });
    } else {
      const validationErrors = validationResult(req);

      if (!validationErrors.isEmpty()) {
        res.status(403).json({
          title: req.body.title,
          text: req.body.text,
          published: req.body.published,
          errors: validationErrors.array(),
        });
      } else {
        const newPost = new Post({
          title: req.body.title,
          text: req.body.text,
          author: res.authData.user._id,
          date: new Date(),
          published: req.body.published,
          comments: [],
        });

        await newPost.save();
        res.json({
          success: true,
          newPost,
        });
      }
    }
  }),
];

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

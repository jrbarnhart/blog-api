const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const { decode } = require("html-entities");

const Comment = require("../models/comment");
const Post = require("../models/post");
const { checkTokenRequired, validateToken } = require("../scripts/checkToken");

// Create a comment
exports.create_comment = [
  checkTokenRequired,
  validateToken,

  body("text")
    .isString()
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("Text required"),

  asyncHandler(async (req, res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      res.status(403).json({
        success: false,
        status: 403,
        text: req.body.text,
        errors: validationErrors.array(),
      });
    } else {
      const newComment = new Comment({
        text: req.body.text,
        author: res.authData.user._id,
        date: new Date(),
        post: req.params.postId,
      });

      await newComment.save();
      res.json({
        success: true,
        newComment,
      });
    }
  }),
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

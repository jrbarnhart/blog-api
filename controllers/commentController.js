const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const { decode } = require("html-entities");

const Comment = require("../models/comment");
const Post = require("../models/post");
const { checkTokenRequired, validateToken } = require("../scripts/checkToken");
const handleValidationErrors = require("../scripts/handleValidationErrors");

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

  handleValidationErrors(["text"]),

  asyncHandler(async (req, res, next) => {
    const postToCommentOn = await Post.findById(req.params.postId).exec();
    if (!postToCommentOn) {
      res.status(404).json({
        success: false,
        status: 404,
        message: "Resource not found",
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
exports.get_comments = asyncHandler(async (req, res, next) => {
  const comments = await Comment.find({ post: req.params.postId });
  if (comments && Object.keys(comments).length >= 0) {
    res.json({
      success: true,
      comments,
    });
  } else {
    res.status(404).json({
      success: false,
      status: 404,
      message: "Resource not found",
    });
  }
});

// Update a comment
exports.update_comment = [
  checkTokenRequired,
  validateToken,

  body("text")
    .isString()
    .trim()
    .escape()
    .isLength({ min: 1 })
    .withMessage("Text required"),

  handleValidationErrors(["text"]),

  asyncHandler(async (req, res, next) => {
    // Check that comment exists
    const updatedComment = await Comment.findById(req.params.commentId).exec();
    if (!updatedComment) {
      res.status(404).json({
        success: false,
        status: 404,
        message: "Resource not found",
      });
      // Check if author or admin
    } else if (
      !(
        res.authData.user._id === updatedComment.author.toString() ||
        res.authData.user.access === "admin"
      )
    ) {
      res.status(403).json({
        success: false,
        status: 403,
        message: "Access forbidden",
      });
    } else {
      updatedComment.text = req.body.text;
      await updatedComment.save();
      res.json({
        success: true,
        updatedComment,
      });
    }
  }),
];

// Delete a comment
exports.delete_comment = [
  checkTokenRequired,
  validateToken,

  asyncHandler(async (req, res, next) => {
    // Check that comment exists
    const deletedComment = await Comment.findById(req.params.commentId).exec();
    if (!deletedComment) {
      res.status(404).json({
        success: false,
        status: 404,
        message: "Resource not found",
      });
      // Check if author or admin
    } else if (
      !(
        res.authData.user._id === deletedComment.author.toString() ||
        res.authData.user.access === "admin"
      )
    ) {
      res.status(403).json({
        success: false,
        status: 403,
        message: "Access forbidden",
      });
    } else {
      await Comment.findByIdAndDelete(deletedComment.id);
      res.json({
        success: true,
        deletedComment,
      });
    }
  }),
];

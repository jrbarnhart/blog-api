const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const { decode } = require("html-entities");

const Post = require("../models/post");
const {
  checkTokenRequired,
  checkTokenPermissive,
  validateToken,
  isAdminToken,
} = require("../scripts/checkToken");
const handleValidationErrors = require("../scripts/handleValidationErrors");

// Create a post
exports.create_post = [
  checkTokenRequired,
  validateToken,
  isAdminToken,

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

  handleValidationErrors(["title", "text", "published"]),

  asyncHandler(async (req, res, next) => {
    console.log("Posting new post");
    const newPost = new Post({
      title: req.body.title,
      text: req.body.text,
      author: res.authData.user._id,
      date: new Date(),
      published: req.body.published,
    });

    await newPost.save();
    res.json({
      success: true,
      newPost,
    });
  }),
];

// Get all posts
exports.get_posts = [
  checkTokenPermissive,

  (req, res, next) => {
    if (req.token) {
      validateToken(req, res, next);
    } else {
      next();
    }
  },

  asyncHandler(async (req, res, next) => {
    // Return unpublished posts only for admins
    let allPosts;
    if (res.authData && res.authData.user.access === "admin") {
      allPosts = await Post.find({}).exec();
    } else {
      allPosts = await Post.find({ published: true }).exec();
    }
    if (Array.isArray(allPosts)) {
      allPosts.forEach((post) => {
        const decodedTitle = decode(post.title);
        const decodedText = decode(post.text);
        post.title = decodedTitle;
        post.text = decodedText;
      });
    }
    res.json({ success: true, allPosts });
  }),
];

// Get a post
exports.get_post = [
  // Check for token but don't require it
  checkTokenPermissive,
  // If token exists, validate it
  (req, res, next) => {
    if (req.token) {
      validateToken(req, res, next);
    } else {
      next();
    }
  },

  asyncHandler(async (req, res, next) => {
    const post = await Post.findById(req.params.postId).exec();

    // Only show unpublished posts to admins
    if (
      post &&
      post.published === false &&
      (!res.authData || res.authData.user.access !== "admin")
    ) {
      res.status(403).json({
        success: false,
        status: 403,
        message: "Access forbidden unpublished",
      });
    } else if (!post) {
      res.status(400).json({
        success: false,
        status: 400,
        message: "Not found",
      });
    } else {
      res.json({
        success: true,
        post,
      });
    }
  }),
];

// Update a post
exports.update_post = [
  checkTokenRequired,
  validateToken,
  isAdminToken,

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

  handleValidationErrors(["title", "text", "published"]),

  asyncHandler(async (req, res, next) => {
    const updatedPost = await Post.findByIdAndUpdate(
      req.params.postId,
      {
        title: req.body.title,
        text: req.body.text,
        published: req.body.published,
      },
      { new: true }
    );
    res.json({
      success: true,
      updatedPost,
    });
  }),
];

// Delete a post
exports.delete_post = [
  checkTokenRequired,
  validateToken,
  isAdminToken,

  asyncHandler(async (req, res, next) => {
    const deletedPost = await Post.findByIdAndDelete(req.params.postId);
    if (deletedPost) {
      res.json({
        success: true,
        deletedPost,
      });
    } else {
      res.status(404).json({
        success: false,
        status: 404,
        message: "Resource not found",
      });
    }
  }),
];

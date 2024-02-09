const asyncHandler = require("express-async-handler");
const { body, validationResult } = require("express-validator");
const { decode } = require("html-entities");

const Post = require("../models/post");
const {
  checkTokenRequired,
  validateToken,
  isAdminToken,
} = require("../scripts/checkToken");

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

  asyncHandler(async (req, res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      res.status(403).json({
        success: false,
        status: 403,
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
  }),
];

// Get all posts
exports.get_posts = [
  body("get_unpublished")
    .custom((value) => {
      if (typeof value !== "undefined") {
        return value === true || value === false;
      } else {
        return true;
      }
    })
    .withMessage("Get unpublished must be boolean value"),

  // Check for unpublished request and then token if needed
  (req, res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      res.status(403).json({
        success: false,
        status: 403,
        title: req.body.title,
        text: req.body.text,
        published: req.body.published,
        errors: validationErrors.array(),
      });
    } else if (req.body.get_unpublished === true) {
      checkTokenRequired(req, res, next);
    }
  },

  (req, res, next) => {
    if (req.token) {
      validateToken(req, res, next);
    }
  },

  asyncHandler(async (req, res, next) => {
    // Return unpublished posts only for admins
    let allPosts;
    if (
      res.authData &&
      res.authData.user.access === "admin" &&
      req.body.get_unpublished === true
    ) {
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
    res.json(allPosts);
  }),
];

// Get a post
exports.get_post = [
  (req, res, next) => {
    // If token then check if admin
  },

  asyncHandler(async (req, res, next) => {
    const post = await Post.findById(req.params.postId).exec();

    // Only show unpublished posts to admins
    if (res.authData.user.access !== "admin") {
      if (post.published === false) {
        post = undefined;
      }
    }
    if (!post) {
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

  asyncHandler(async (req, res, next) => {
    const validationErrors = validationResult(req);

    if (!validationErrors.isEmpty()) {
      res.status(403).json({
        success: false,
        status: 403,
        title: req.body.title,
        text: req.body.text,
        published: req.body.published,
        errors: validationErrors.array(),
      });
    } else {
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
    }
  }),
];

// Delete a post
exports.delete_post = (req, res) => {
  res.send("Post delete NYI");
};

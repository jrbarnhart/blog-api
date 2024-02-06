const express = require("express");
const router = express.Router();

const postController = require("../controllers/postController");
const commentController = require("../controllers/commentController");

// Create a post
router.post("/", postController.create_post);

// Get all posts
router.get("/", postController.get_posts);

// Get a post
router.get("/:postId", postController.get_post);

// Update a post
router.put("/:postId", postController.update_post);

// Delete a post
router.delete("/:postId", postController.delete_post);

// Add comment to post
router.post("/:postId/comments", commentController.create_comment);

// Get comments on post
router.get("/:postId/comments", commentController.get_comments);

// Update comment on post
router.put("/:postId/comments/:commentId", commentController.update_comment);

// Delete comment on post
router.delete("/:postId/comments/:commentId", commentController.delete_comment);

module.exports = router;

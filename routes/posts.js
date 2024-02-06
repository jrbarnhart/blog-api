const express = require("express");
const router = express.Router();

const postController = require("../controllers/postController");
const commentController = require("../controllers/commentController");

// Create a post
router.post("/", postController.create_post);

// Get all posts
router.get("/", postController.get_posts);

// Get a post
router.get("/:id", postController.get_post);

// Update a post
router.put("/:id", postController.update_post);

// Delete a post
router.delete("/:id", postController.delete_post);

// Add comment to post
router.post("/:id/comments", commentController.create_comment);

// Get comments on post
router.get("/:id/comments", commentController.get_comments);

// Update comment on post
router.put("/:id/comments/:id", commentController.update_comment);

// Delete comment on post
router.delete("/:id/comments/:id", commentController.delete_comment);

module.exports = router;

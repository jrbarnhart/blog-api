const express = require("express");
const router = express.Router();

const postController = require("../controllers/postController");

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

module.exports = router;

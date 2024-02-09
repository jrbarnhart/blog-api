const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = new Schema({
  title: {
    type: String,
    minLength: 1,
    maxLength: 200,
    required: true,
  },
  text: {
    type: String,
    minLength: 1,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  date: {
    type: Date,
    required: true,
  },
  published: {
    type: Boolean,
    required: true,
  },
});

module.exports = mongoose.model("Post", PostSchema);

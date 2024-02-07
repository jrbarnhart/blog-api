const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const UserSchema = new Schema({
  username: {
    type: String,
    minLength: 3,
    maxLength: 200,
    required: true,
    validate: {
      validator: function (value) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
      },
      message: "Invalid email address format",
    },
  },
  display_name: {
    type: String,
    minLength: 1,
    maxLength: 200,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  access: {
    type: String,
    enum: {
      values: ["basic", "admin"],
      message: "enum validator failed for path `{PATH}` with value `{VALUE}`",
    },
    required: true,
  },
});

module.exports = mongoose.model("User", UserSchema);

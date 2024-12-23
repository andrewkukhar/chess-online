// models/User.js
const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
  },
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true,
  },
  password: {
    type: String,
    required: true,
  },
  firstname: {
    type: String,
    trim: true,
  },
  lastname: {
    type: String,
    trim: true,
  },
  role: {
    type: String,
    enum: ["player", "watcher", "ak-admin", "admin"],
    default: "player",
    required: true,
  },
});

module.exports = mongoose.model("User", UserSchema);

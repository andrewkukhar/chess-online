// models/Game.js
const mongoose = require("mongoose");

const GameSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  players: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  ],
  moves: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Move",
    },
  ],
  status: {
    type: String,
    enum: ["waiting", "ongoing", "finished"],
    default: "waiting",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Game", GameSchema);

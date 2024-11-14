// models/Game.js
const mongoose = require("mongoose");

const PlayerSchema = new mongoose.Schema({
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  isAI: {
    type: Boolean,
    default: false,
  },
  isOnlineInGameRoom: {
    type: Boolean,
    default: false,
  },
  difficultyLevel: {
    type: String,
    enum: ["easy", "medium", "hard"],
    required: function () {
      return this.isAI;
    },
  },
});

const GameSchema = new mongoose.Schema({
  name: {
    type: String,
  },
  players: [PlayerSchema],
  moves: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Move",
    },
  ],
  lastMove: {
    from: { type: Number, default: null },
    to: { type: Number, default: null },
  },
  status: {
    type: String,
    enum: ["waiting", "ongoing", "finished", "checkmate", "check"],
    default: "waiting",
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    default: null,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Game", GameSchema);

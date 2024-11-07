// models/Move.js
const mongoose = require("mongoose");

const CapturedPieceSchema = new mongoose.Schema(
  {
    player: {
      type: Number,
      required: true,
    },
    style: {
      type: Object,
      required: true,
    },
    initialPositions: {
      type: Object,
      required: false,
    },
    type: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const MoveSchema = new mongoose.Schema({
  game: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Game",
    required: true,
  },
  player: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  from: {
    type: Number,
    required: true,
  },
  to: {
    type: Number,
    required: true,
  },
  piece: {
    type: String,
    required: true,
  },
  captured: {
    type: CapturedPieceSchema,
    default: null,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

MoveSchema.index({ game: 1, player: 1 });

module.exports = mongoose.model("Move", MoveSchema);

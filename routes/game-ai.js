// routes/game-ai.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const permission = require("../middleware/permission");
const {
  createGameAgainstAI,
} = require("../controllers/games/createGameAgainstAIController");
const { makeAIMove } = require("../controllers/ai/move/makeAIMoveController");

// @route   POST /api/games-ai/create-game-against-ai
// @desc    Create a new game against AI
// @access  Private
router.post(
  "/create-game-against-ai",
  auth,
  permission(["admin", "ak-admin", "player", "watcher"]),
  createGameAgainstAI
);

// @route   POST /api/move/make-move
// @desc    Make a move in a game
// @access  Private
router.post(
  "/make-ai-move",
  auth,
  permission(["admin", "ak-admin", "player", "watcher"]),
  makeAIMove
);

module.exports = router;

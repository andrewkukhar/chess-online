// routes/move.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const permission = require("../middleware/permission");
const {
  getMove,
  getAllMoves,
  undoMove,
} = require("../controllers/moves/moveController");
const { makeMove } = require("../controllers/moves/makeMoveController");

// @route   POST /api/move/make-move
// @desc    Make a move in a game
// @access  Private
router.post(
  "/make-move",
  auth,
  permission(["admin", "ak-admin", "player", "watcher"]),
  makeMove
);

// @route   GET /api/move/:moveId
// @desc    Get a specific move by ID
// @access  Private
router.get(
  "/get-move/:moveId",
  auth,
  permission(["admin", "ak-admin", "player", "watcher"]),
  getMove
);

// @route   GET /api/move/game/:gameId
// @desc    Get all moves for a specific game
// @access  Private
router.get(
  "/get-game-moves/:gameId",
  auth,
  permission(["admin", "ak-admin", "player", "watcher"]),
  getAllMoves
);

// @route   POST /api/move/undo-move
// @desc    Undo the last move made by the user
// @access  Private
router.post(
  "/undo-move",
  auth,
  permission(["admin", "ak-admin", "player", "watcher"]),
  undoMove
);

module.exports = router;

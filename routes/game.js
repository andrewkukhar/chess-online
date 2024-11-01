// routes/game.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  removeGame,
  getGame,
  getAllGames,
} = require("../controllers/games/gameController");
const {
  switchPlayerRoles,
} = require("../controllers/games/switchGameRolesController");
const {
  resetGame,
} = require("../controllers/games/resetCreateNewGameController");
const {
  joinGame,
  leaveGame,
} = require("../controllers/games/joinLeaveGamesController");
const {
  createGame,
  updateGame,
} = require("../controllers/games/createUpdateGamesController");

// @route   POST /api/game/create
// @desc    Create a new game
// @access  Private
router.post("/create-game", auth, createGame);

// @route   PUT /api/game/:gameId
// @desc    Update game details
// @access  Private
router.put("/update-game/:gameId", auth, updateGame);

// @route   POST /api/game/join
// @desc    Join an existing game
// @access  Private
router.post("/join-game", auth, joinGame);

// @route   POST /api/game/leave
// @desc    Leave a game
// @access  Private
router.post("/leave-game", auth, leaveGame);

// @route   DELETE /api/game/:gameId
// @desc    Remove a game
// @access  Private
router.delete("/delete-game/:gameId", auth, removeGame);

// @route   GET /api/games/:gameId
// @desc    Get a game
// @access  Private
router.get("/get-game/:gameId", auth, getGame);

// @route   GET /api/games/get-all-games
// @desc    Get all games
// @access  Private
router.get("/get-all-games", auth, getAllGames);

// @route   POST /api/game/reset-game
// @desc    Reset a game
// @access  Private
router.post("/reset-game", auth, resetGame);

// @route   POST /api/games/switch-players-roles
// @desc    Reset a game
// @access  Private
router.post("/switch-players-roles/:gameId", auth, switchPlayerRoles);

module.exports = router;

// routes/game.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const permission = require("../middleware/permission");
const {
  removeGame,
  removeAllGames,
} = require("../controllers/games/gameController");
const {
  getAllGamesByUser,
  getAllGames,
  getGame,
} = require("../controllers/games/getAllGamesController");
const {
  switchPlayerRoles,
} = require("../controllers/games/switchGameRolesController");
const {
  resetGame,
} = require("../controllers/games/resetCreateNewGameController");
const {
  joinGameRoom,
  updatePlayerGameRoomStatus,
} = require("../controllers/games/gameRoomController");
const {
  joinGame,
  leaveGame,
} = require("../controllers/games/joinLeaveGamesController");
const {
  createGame,
  updateGame,
} = require("../controllers/games/createUpdateGamesController");

// @route   POST /api/games/create
// @desc    Create a new game
// @access  Private
router.post(
  "/create-game",
  auth,
  permission(["admin", "ak-admin", "player", "watcher"]),
  createGame
);

// @route   PUT /api/games/update-game/:gameId
// @desc    Update game details
// @access  Private
router.put(
  "/update-game/:gameId",
  auth,
  permission(["admin", "ak-admin", "player", "watcher"]),
  updateGame
);

// @route   POST /api/games/join-game
// @desc    Join an existing game
// @access  Private
router.post(
  "/join-game",
  auth,
  permission(["admin", "ak-admin", "player", "watcher"]),
  joinGame
);

// @route   POST /api/games/leave-game
// @desc    Leave a game
// @access  Private
router.post(
  "/leave-game",
  auth,
  permission(["admin", "ak-admin", "player", "watcher"]),
  leaveGame
);

// @route   DELETE /api/games/:gameId
// @desc    Remove a game
// @access  Private
router.delete(
  "/delete-game/:gameId",
  auth,
  permission(["admin", "ak-admin", "player", "watcher"]),
  removeGame
);

// @route   DELETE /api/games/delete-all
// @desc    Remove a game
// @access  Private
router.delete(
  "/delete-all",
  auth,
  permission(["admin", "ak-admin"]),
  removeAllGames
);

// @route   GET /api/games/:gameId
// @desc    Get a game
// @access  Private
router.get(
  "/get-game/:gameId",
  auth,
  permission(["admin", "ak-admin", "player", "watcher"]),
  getGame
);

// @route   GET /api/games/get-all-user-games
// @desc    Get all games by user
// @access  Private
router.get(
  "/get-all-user-games",
  auth,
  permission(["admin", "ak-admin", "player", "watcher"]),
  getAllGamesByUser
);

// @route   GET /api/games/get-all-games
// @desc    Get all games by admin
// @access  Private
router.get(
  "/get-all-games",
  auth,
  permission(["admin", "ak-admin"]),
  getAllGames
);

// @route   POST /api/games/reset-game
// @desc    Reset a game
// @access  Private
router.post(
  "/reset-game",
  auth,
  permission(["admin", "ak-admin", "player", "watcher"]),
  resetGame
);

// @route   POST /api/games/switch-players-roles
// @desc    Reset a game
// @access  Private
router.post(
  "/switch-players-roles/:gameId",
  auth,
  permission(["admin", "ak-admin", "player", "watcher"]),
  switchPlayerRoles
);

// @route   POST /api/games/update-player-game-room-status/:gameId
// @desc    Update update Player status in the game room
// @access  Private
router.post(
  "/update-player-game-room-status/:gameId",
  auth,
  permission(["admin", "ak-admin", "player", "watcher"]),
  updatePlayerGameRoomStatus
);

// @route   POST /api/games/join-game-room/:gameId
// @desc    Update player status to join game room
// @access  Private
router.post(
  "/join-game-room/:gameId",
  auth,
  permission(["admin", "ak-admin", "player", "watcher"]),
  joinGameRoom
);

module.exports = router;

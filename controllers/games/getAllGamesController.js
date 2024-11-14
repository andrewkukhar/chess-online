// controllers/games/getAllGamesController.js
const mongoose = require("mongoose");
const Game = require("../../models/Game");
const socket = require("../../socket");
const io = socket.getIO();

/**
 * Get all games that belong to the authenticated user.
 * @route GET /api/games/get-all-user-games
 * @access Private
 */
exports.getAllGamesByUser = async (req, res) => {
  const userId = req.user.userId;
  const { status } = req.query;
  // console.log("userId", userId);

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID." });
  }
  try {
    const query = { "players.player": userId };
    if (status && status !== "all") {
      query.status = status.toLowerCase();
    }

    const games = await Game.find(query)
      .populate("players.player")
      .populate("winner")
      .populate({
        path: "moves",
        populate: { path: "player" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(games);
  } catch (err) {
    console.error("Error in getAllGamesByUser:", err.message);
    res.status(500).json({ message: "Server error while retrieving move." });
  }
};

/**
 * Get all games by admin.
 * @route GET /api/games/get-all-games
 * @access Private
 */
exports.getAllGames = async (req, res) => {
  const userId = req.user.userId;
  const { status } = req.query;
  // console.log("userId", userId);

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID." });
  }
  try {
    const query = {};
    if (status && status !== "all") {
      query.status = status.toLowerCase();
    }

    const games = await Game.find(query)
      .populate("players.player")
      .populate("winner")
      .populate({
        path: "moves",
        populate: { path: "player" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(games);
  } catch (err) {
    console.error("Error in getAllGames:", err.message);
    res.status(500).json({ message: "Server error while retrieving move." });
  }
};

/**
 * Get a specific get by ID.
 * @route GET /api/games/:gameId
 * @access Private
 */
exports.getGame = async (req, res) => {
  const { gameId } = req.params;
  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(gameId)) {
    return res.status(400).json({ message: "Invalid Game ID." });
  }

  try {
    const game = await Game.findById(gameId)
      .populate("players.player")
      .populate("winner")
      .populate({
        path: "moves",
        populate: { path: "player" },
      });

    if (!game) {
      return res.status(404).json({ message: "Game not found." });
    }

    const player = game.players.find((p) => p.player._id.toString() === userId);
    if (!player) {
      return res
        .status(403)
        .json({ message: "Unauthorized to view this game." });
    }

    player.isOnlineInGameRoom = true;
    await game.save();

    res.status(200).json(game);
  } catch (err) {
    console.error("Error in getGame:", err.message);
    res.status(500).json({ message: "Server error while retrieving move." });
  }
};

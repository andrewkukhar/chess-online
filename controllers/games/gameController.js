// controllers/gameController.js
const mongoose = require("mongoose");
const Game = require("../../models/Game");
const socket = require("../../socket");
const io = socket.getIO();

/**
 * Remove a game.
 * @route DELETE /api/game/:gameId
 * @access Private
 */
exports.removeGame = async (req, res) => {
  const { gameId } = req.params;
  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(gameId)) {
    return res.status(400).json({ message: "Invalid Game ID." });
  }

  try {
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: "Game not found." });
    }

    // Check if the requester is the host (first player)
    if (game.players[0].toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to remove this game." });
    }

    await Game.deleteOne({ _id: game._id });

    const playerSockets = game.players
      .map((player) => socket.getUserSocketId(player.toString()))
      .filter((socketId) => socketId);

    playerSockets.forEach((socketId) => {
      io.to(socketId).emit("gameRemoved", {
        gameId,
      });
    });

    res.status(200).json({ message: "Game removed successfully." });
  } catch (err) {
    console.error("Error in removeGame:", err.message);
    res.status(500).json({ message: "Server error while removing game." });
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
      .populate("players")
      .populate({
        path: "moves",
        populate: { path: "player" },
      });

    if (!game) {
      return res.status(404).json({ message: "Game not found." });
    }

    if (!game.players.some((player) => player._id.toString() === userId)) {
      return res
        .status(403)
        .json({ message: "Unauthorized to view this game." });
    }

    res.status(200).json(game);
  } catch (err) {
    console.error("Error in getGame:", err.message);
    res.status(500).json({ message: "Server error while retrieving move." });
  }
};

/**
 * Get all games that belong to the authenticated user.
 * @route GET /api/games/get-all-games
 * @access Private
 */
exports.getAllGames = async (req, res) => {
  const userId = req.user.userId;
  // console.log("userId", userId);

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID." });
  }
  try {
    const games = await Game.find({ players: userId })
      .populate("players")
      .populate({
        path: "moves",
        populate: { path: "player" },
      })
      .sort({ createdAt: -1 });

    if (!games || games.length === 0) {
      return res.status(200).json({
        message: "No games found for the authenticated user.",
        games: [],
      });
    }

    res.status(200).json(games);
  } catch (err) {
    console.error("Error in getAllGames:", err.message);
    res.status(500).json({ message: "Server error while retrieving move." });
  }
};

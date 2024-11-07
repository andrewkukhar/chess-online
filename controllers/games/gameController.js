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
  const userrole = req.user.role;

  if (!mongoose.Types.ObjectId.isValid(gameId)) {
    return res.status(400).json({ message: "Invalid Game ID." });
  }

  try {
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: "Game not found." });
    }

    // Check if the requester is the host (first player)
    if (
      userrole !== "ak-admin" &&
      game.players[0].player.toString() !== userId
    ) {
      return res
        .status(403)
        .json({ message: "Unauthorized to remove this game." });
    }

    await Game.deleteOne({ _id: game._id });

    const playerSockets = game.players
      .map((player) => socket.getUserSocketId(player.player.toString()))
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
 * Remove all games.
 * @route DELETE /api/games/delete-all
 * @access Private
 */
exports.removeAllGames = async (req, res) => {
  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID." });
  }

  try {
    const games = await Game.find({ "players.player": userId });
    if (!games.length) {
      return res.status(404).json({ message: "No games found." });
    }

    await Game.deleteMany({ "players.player": userId });

    res.status(200).json({ message: "All games deleted successfully." });
  } catch (err) {
    console.error("Error in removeAllGames:", err.message);
    res.status(500).json({ message: "Server error while removing all games." });
  }
};

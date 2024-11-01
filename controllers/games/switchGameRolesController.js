// controllers/gameController.js
const mongoose = require("mongoose");
const Game = require("../../models/Game");
const socket = require("../../socket");
const io = socket.getIO();

/**
 * switchPlayerRoles.
 * @route POST /api/game/switch-players-roles
 * @access Private
 */
exports.switchPlayerRoles = async (req, res) => {
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

    if (!game.players.some((player) => player.toString() === userId)) {
      return res.status(403).json({ message: "Unauthorized to switch roles." });
    }

    if (game.players.length !== 2) {
      return res
        .status(400)
        .json({ message: "Game must have two players to switch roles." });
    }

    [game.players[0], game.players[1]] = [game.players[1], game.players[0]];

    await game.save();

    game.players.forEach((player) => {
      const socketId = socket.getUserSocketId(player.toString());
      if (socketId) {
        io.to(socketId).emit("playerRolesSwitched", {
          gameId: game._id,
          game,
        });
      }
    });

    res.status(200).json({
      message: "Player roles switched successfully.",
      game,
    });
  } catch (err) {
    console.error("Error in switchPlayerRoles:", err.message);
    res
      .status(500)
      .json({ message: "Server error while switching player roles." });
  }
};

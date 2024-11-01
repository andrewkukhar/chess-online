// controllers/gameController.js
const mongoose = require("mongoose");
const Move = require("../../models/Move");
const Game = require("../../models/Game");
const socket = require("../../socket");
const io = socket.getIO();

/**
 * Reset an ongoing game.
 * @route POST /api/game/reset
 * @access Private
 */
exports.resetGame = async (req, res) => {
  const { gameId } = req.body;
  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(gameId)) {
    return res.status(400).json({ message: "Invalid Game ID." });
  }

  try {
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: "Game not found." });
    }

    if (!game.players.includes(userId)) {
      return res
        .status(403)
        .json({ message: "Unauthorized to reset this game." });
    }

    game.status = "finished";
    await game.save();

    const newGame = new Game({
      name: `${game.name} (Rematch)`,
      players: game.players,
      status: "ongoing",
    });

    await newGame.save();

    game.players.forEach((player) => {
      const socketId = socket.getUserSocketId(player.toString());
      if (socketId) {
        io.to(socketId).emit("gameReset", {
          oldGameId: game._id,
          newGameId: newGame._id,
          newGame,
          message: "Ongoing Game has been finished. A new game has begun.",
          userId,
        });
      }
    });

    res.status(200).json({
      message: "Game finished. A new game has begun.",
      newGame,
    });
  } catch (err) {
    console.error("Error in resetGame:", err.message);
    res.status(500).json({ message: "Server error while resetting game." });
  }
};

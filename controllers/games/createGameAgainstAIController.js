// controllers/games/createGameAgainstAIController.js
const mongoose = require("mongoose");
const Move = require("../../models/Move");
const Game = require("../../models/Game");
const socket = require("../../socket");
const io = socket.getIO();

const createAIPlayer = (difficultyLevel) => {
  return {
    player: null, // Placeholder, AI player does not have a user ID.
    isAI: true,
    difficultyLevel,
  };
};

/**
 * Create a new game against AI.
 * @route POST /api/games-ai/create-game-against-ai
 * @access Private
 */
exports.createGameAgainstAI = async (req, res) => {
  const { name, difficultyLevel } = req.body;
  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID." });
  }

  try {
    const newGame = new Game({
      name,
      players: [{ player: userId }, createAIPlayer(difficultyLevel)],
      status: "ongoing",
    });

    await newGame.save();
    const socketId = socket.getUserSocketId(userId.toString());
    if (socketId) {
      io.to(socketId).emit("newAIGame", { gameId: newGame._id, game: newGame });
      io.to(socketId).emit("gameAICreated", {
        gameId: newGame._id,
        game: newGame,
      });
    }

    res.status(201).json({
      message: "Game Against AI created successfully.",
      game: newGame,
    });
  } catch (err) {
    console.error("Error in createGameAgainstAI:", err.message);
    res
      .status(500)
      .json({ message: "Server error while creating game against AI." });
  }
};

// controllers/gameController.js
const mongoose = require("mongoose");
const Move = require("../../models/Move");
const Game = require("../../models/Game");
const socket = require("../../socket");
const io = socket.getIO();

/**
 * Create a new game.
 * @route POST /api/game/create
 * @access Private
 */
exports.createGame = async (req, res) => {
  const { name } = req.body;
  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID." });
  }
  // console.log("name", name);
  try {
    const newGame = new Game({
      name: name,
      players: [{ player: userId, isOnlineInGameRoom: false }],
      status: "waiting",
    });

    await newGame.save();

    const socketId = socket.getUserSocketId(userId.toString());
    if (socketId) {
      io.to(socketId).emit("newGame", { gameId: newGame._id, game: newGame });
      io.to(socketId).emit("gameCreated", {
        gameId: newGame._id,
        game: newGame,
      });
    }

    res.status(201).json({
      message: "Game created successfully.",
      game: newGame,
    });
  } catch (err) {
    console.error("Error in createGame:", err.message);
    res.status(500).json({ message: "Server error while creating game." });
  }
};

/**
 * Update game details.
 * @route PUT /api/game/:gameId
 * @access Private
 */
exports.updateGame = async (req, res) => {
  const { gameId } = req.params;
  const { status } = req.body;
  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(gameId)) {
    return res.status(400).json({ message: "Invalid Game ID." });
  }

  const validStatuses = ["waiting", "ongoing", "finished"];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status value." });
  }

  try {
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: "Game not found." });
    }

    // Check if the requester is a player in the game
    if (!game.players.some((p) => p.player.toString() === userId)) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this game." });
    }

    game.status = status;
    await game.save();

    const socketId = socket.getUserSocketId(userId.toString());
    if (socketId) {
      io.to(socketId).emit("gameStatusUpdated", {
        gameId: game._id,
        game,
      });
    }

    res.status(200).json({
      message: "Game updated successfully.",
      game,
    });
  } catch (err) {
    console.error("Error in updateGame:", err.message);
    res.status(500).json({ message: "Server error while updating game." });
  }
};

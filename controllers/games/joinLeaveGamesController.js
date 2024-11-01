// controllers/gameController.js
const mongoose = require("mongoose");
const Move = require("../../models/Move");
const Game = require("../../models/Game");
const socket = require("../../socket");
const io = socket.getIO();

/**
 * Join an existing game.
 * @route POST /api/game/join
 * @access Private
 */
exports.joinGame = async (req, res) => {
  const { gameId, playerId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(gameId)) {
    return res.status(400).json({ message: "Invalid Game ID." });
  }
  if (!mongoose.Types.ObjectId.isValid(playerId)) {
    return res.status(400).json({ message: "Invalid player ID." });
  }

  try {
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: "Game ID does not exist." });
    }

    // Check if user is already a player in the game
    if (game.players.includes(playerId)) {
      return res.status(400).json({ message: "You are already in this game." });
    }

    // Check if game is full
    if (game.players.length >= 2) {
      return res.status(400).json({ message: "Game is already full." });
    }

    // Add user to the game
    game.players.push(playerId);

    // Update game status if two players are present
    if (game.players.length === 2) {
      game.status = "ongoing";
    }

    await game.save();

    game.players.forEach((player) => {
      const socketId = socket.getUserSocketId(player.toString());
      if (socketId) {
        io.to(socketId).emit("playerJoinedGame", {
          gameId: game._id,
          playerId,
          message: "New player joined game.",
          game,
        });
      }
    });

    res.status(200).json({
      message: "Joined game successfully.",
      game,
    });
  } catch (err) {
    console.error("Error in joinGame:", err.message);
    res.status(500).json({ message: "Server error while joining game." });
  }
};

/**
 * Leave a game.
 * @route POST /api/game/leave
 * @access Private
 */
exports.leaveGame = async (req, res) => {
  const { gameId, playerId } = req.body;

  if (!mongoose.Types.ObjectId.isValid(gameId)) {
    return res.status(400).json({ message: "Invalid Game ID." });
  }
  if (!mongoose.Types.ObjectId.isValid(playerId)) {
    return res.status(400).json({ message: "Invalid player ID." });
  }
  try {
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: "Game not found." });
    }

    if (!game.players.includes(playerId)) {
      return res
        .status(400)
        .json({ message: "You are not part of this game." });
    }

    game.players = game.players.filter(
      (player) => player.toString() !== playerId
    );

    if (game.players.length < 2) {
      game.status = "waiting";
    }

    await game.save();

    game.players.forEach((player) => {
      const socketId = socket.getUserSocketId(player.toString());
      if (socketId) {
        io.to(socketId).emit("playerLeftGame", {
          gameId: game._id,
          playerId,
          game,
        });
      }
    });

    res.status(200).json({ message: "Left game successfully.", game });
  } catch (err) {
    console.error("Error in leaveGame:", err.message);
    res.status(500).json({ message: "Server error while leaving game." });
  }
};

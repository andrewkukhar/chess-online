// controllers/gameRoomController.js
const mongoose = require("mongoose");
const Game = require("../../models/Game");
const socket = require("../../socket");
const io = socket.getIO();

/**
 * Update player status to join game room.
 * @route POST /api/games/join-game-room/:gameId
 * @access Private
 */
exports.joinGameRoom = async (req, res) => {
  const { gameId } = req.params;
  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(gameId)) {
    return res.status(400).json({ message: "Invalid Game ID." });
  }

  try {
    const game = await Game.findById(gameId).populate("players.player");
    if (!game) {
      return res.status(404).json({ message: "Game not found." });
    }
    const player = game.players.find((p) => p.player._id.toString() === userId);
    if (!player) {
      return res
        .status(403)
        .json({ message: "Unauthorized to join this game." });
    }

    const playerUsername = player.player.username;
    if (!player.isOnlineInGameRoom) {
      player.isOnlineInGameRoom = true;
      await game.save();

      const otherPlayers = game.players.filter(
        (p) => p.player._id.toString() !== userId
      );

      otherPlayers.forEach((otherPlayer) => {
        const socketId = socket.getUserSocketId(
          otherPlayer.player._id.toString()
        );
        if (socketId) {
          io.to(socketId).emit("playerGameRoomStatusUpdated", {
            gameId,
            playerId: userId,
            username: playerUsername,
            isOnlineInGameRoom: true,
          });
        }
      });
    }

    res.status(200).json({ message: "Player joined game room successfully." });
  } catch (err) {
    console.error("Error in joinGameRoom:", err.message);
    res.status(500).json({ message: "Server error while joining game room." });
  }
};

/**
 * Update update Player status in the game room .
 * @route POST /api/games/update-player-game-room-status/:gameId
 * @access Private
 */
exports.updatePlayerGameRoomStatus = async (req, res) => {
  const { gameId } = req.params;
  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(gameId)) {
    return res.status(400).json({ message: "Invalid Game ID." });
  }

  try {
    const game = await Game.findById(gameId).populate("players.player");
    if (!game) {
      return res.status(404).json({ message: "Game not found." });
    }

    const player = game.players.find((p) => p.player._id.toString() === userId);
    if (!player) {
      return res
        .status(403)
        .json({ message: "Unauthorized to update this game." });
    }

    player.isOnlineInGameRoom = false;
    await game.save();

    const playerUsername = player.player.username;

    game.players.forEach((p) => {
      const socketId = socket.getUserSocketId(p.player._id.toString());
      if (socketId) {
        io.to(socketId).emit("playerGameRoomStatusUpdated", {
          gameId: game._id,
          playerId: userId,
          username: playerUsername,
          isOnlineInGameRoom: false,
        });
      }
    });

    res.status(200).json({ message: "Player status updated successfully." });
  } catch (err) {
    console.error("Error in updatePlayerGameRoomStatus:", err.message);
    res.status(500).json({ message: "Server error while updating game." });
  }
};

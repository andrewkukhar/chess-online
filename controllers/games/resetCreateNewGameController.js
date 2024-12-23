// controllers/games/resetCreateNewGameController.js
const mongoose = require("mongoose");
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

    if (!game.players.some((p) => p.player.toString() === userId)) {
      return res
        .status(403)
        .json({ message: "Unauthorized to reset this game." });
    }

    game.status = "finished";
    await game.save();

    let newGameName;
    const rematchRegex = /(Rematch\s(\d+(\.\d+)?))$/;
    const match = game.name.match(rematchRegex);

    if (match) {
      const currentVersion = parseFloat(match[2]);
      const newVersion = (currentVersion + 1).toFixed(1);
      newGameName = game.name.replace(rematchRegex, `Rematch ${newVersion}`);
    } else {
      newGameName = `${game.name} Rematch 1.0`;
    }

    const newPlayers = game.players.map((player) => ({
      player: player.player,
      isAI: player.isAI,
      isOnlineInGameRoom: false,
      difficultyLevel: player.isAI ? player.difficultyLevel : undefined,
    }));

    const newGame = new Game({
      name: newGameName,
      players: newPlayers,
      status: "ongoing",
    });

    await newGame.save();
    // console.log("newGame.players", newGame.players);
    // console.log("game.players", game.players);
    const playerSockets = game.players
      .filter((p) => p.player)
      .map((p) => socket.getUserSocketId(p.player.toString()))
      .filter((socketId) => socketId);
    // console.log("playerSockets", playerSockets);

    playerSockets.forEach((socketId) => {
      // console.log("before gameReset socketId", socketId);

      io.to(socketId).emit("gameReset", {
        oldGameId: game._id,
        newGameId: newGame._id,
        newGame,
        message: "Ongoing Game has been finished. A new game has begun.",
        userId,
      });
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

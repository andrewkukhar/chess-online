// controllers/moveController.js
const mongoose = require("mongoose");
const Move = require("../../models/Move");
const Game = require("../../models/Game");
const socket = require("../../socket");
const io = socket.getIO();

/**
 * Get a specific move by ID.
 * @route GET /api/move/:moveId
 * @access Private
 */
exports.getMove = async (req, res) => {
  const { moveId } = req.params;
  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(moveId)) {
    return res.status(400).json({ message: "Invalid Move ID." });
  }

  try {
    const move = await Move.findById(moveId)
      .populate("player")
      .populate({
        path: "game",
        populate: { path: "players.player" },
      });

    if (!move) {
      return res.status(404).json({ message: "Move not found." });
    }

    if (!move.game.players.some((p) => p.player._id.toString() === userId)) {
      return res
        .status(403)
        .json({ message: "Unauthorized to view this move." });
    }

    res.status(200).json(move);
  } catch (err) {
    console.error("Error in getMove:", err.message);
    res.status(500).json({ message: "Server error while retrieving move." });
  }
};

/**
 * Get all moves for a specific game.
 * @route GET /api/move/game/:gameId
 * @access Private
 */
exports.getAllMoves = async (req, res) => {
  const { gameId } = req.params;
  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(gameId)) {
    return res.status(400).json({ message: "Invalid Game ID." });
  }

  try {
    const game = await Game.findById(gameId)
      .populate({
        path: "moves",
        populate: { path: "player" },
      })
      .populate("players.player");

    if (!game) {
      return res.status(404).json({ message: "Game not found." });
    }

    if (!game.players.some((p) => p.player._id.toString() === userId)) {
      return res
        .status(403)
        .json({ message: "Unauthorized to view moves of this game." });
    }

    res.status(200).json({
      moves: game.moves,
    });
  } catch (err) {
    console.error("Error in getAllMoves:", err.message);
    res.status(500).json({ message: "Server error while retrieving moves." });
  }
};

/**
 * Undo the last move made by the user.
 * @route POST /api/move/undo-move
 * @access Private
 */
exports.undoMove = async (req, res) => {
  const { gameId } = req.body;
  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(gameId)) {
    return res.status(400).json({ message: "Invalid Game ID." });
  }

  try {
    const game = await Game.findById(gameId)
      .populate("moves")
      .populate("players.player");
    if (!game) {
      return res.status(404).json({ message: "Game not found." });
    }

    if (game.status !== "ongoing") {
      return res
        .status(400)
        .json({ message: "Cannot undo move in this game state." });
    }

    if (game.moves.length === 0) {
      return res.status(400).json({ message: "No moves to undo." });
    }

    const lastMoveId = game.moves[game.moves.length - 1];
    const lastMove = await Move.findById(lastMoveId);
    if (!lastMove) {
      return res.status(404).json({ message: "Last move not found." });
    }

    if (lastMove.player.toString() !== userId) {
      return res
        .status(403)
        .json({ message: "You can only undo your own last move." });
    }

    game.moves.pop();
    await game.save();

    if (game && game.players && game.players > 0)
      game.players.forEach((player) => {
        const socketId = socket.getUserSocketId(player._id.toString());
        if (socketId) {
          io.to(socketId).emit("moveUndone", {
            gameId: newGame._id,
            moveId: lastMoveId,
            game: newGame,
          });
        }
      });

    await Move.findByIdAndDelete(lastMoveId);

    res.status(200).json({
      message: "Move undone successfully.",
      move: lastMove,
    });
  } catch (err) {
    console.error("Error in undoMove:", err.message);
    res.status(500).json({ message: "Server error while undoing move." });
  }
};

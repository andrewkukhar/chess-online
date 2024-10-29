// controllers/moveController.js
const mongoose = require("mongoose");
const Move = require("../models/Move");
const Game = require("../models/Game");
const socket = require("../socket");
const io = socket.getIO();
const {
  PIECE_TYPES,
  reconstructBoard,
  isMovePossibleInternal,
  isPawnMovePossible,
  isKnightMovePossible,
  isBishopMovePossible,
  isRookMovePossible,
  isKingMovePossible,
  validateMove,
  indexToAlgebraic,
  hasAnyLegalMoves,
  initialiseChessBoard,
  isKingInCheck,
} = require("./moveHelpers");

/**
 * Make a move in a game.
 * @route POST /api/move/make-move
 * @access Private
 */
exports.makeMove = async (req, res) => {
  const { gameId, move } = req.body;
  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(gameId)) {
    return res.status(400).json({ message: "Invalid Game ID." });
  }

  if (
    !move ||
    typeof move !== "object" ||
    typeof move.from !== "number" ||
    typeof move.to !== "number" ||
    typeof move.piece !== "string" ||
    !PIECE_TYPES.includes(move.piece)
  ) {
    return res.status(400).json({ message: "Invalid move data." });
  }

  try {
    const game = await Game.findById(gameId)
      .populate("players")
      .populate("moves");
    if (!game) {
      return res.status(404).json({ message: "Game not found." });
    }

    if (game.status !== "ongoing") {
      return res.status(400).json({ message: "Game is not ongoing." });
    }

    if (!game.players.some((player) => player._id.toString() === userId)) {
      return res
        .status(403)
        .json({ message: "You are not a player in this game." });
    }

    const userColor =
      game.players[0]._id.toString() === userId ? "white" : "black";
    const playerNumber = userColor === "white" ? 1 : 2;

    // Determine current turn
    const currentTurnPlayer = game.moves.length % 2 === 0 ? "white" : "black";

    if (userColor !== currentTurnPlayer) {
      return res.status(400).json({ message: "It's not your turn." });
    }

    const currentBoard = reconstructBoard(game.moves);
    const isValid = validateMove(currentBoard, move, playerNumber);
    if (!isValid) {
      return res
        .status(400)
        .json({ message: "Invalid move according to chess rules." });
    }

    let capturedData = null;
    if (move.captured) {
      capturedData = {
        player: move.captured.player,
        style: move.captured.style,
        initialPositions: move.captured.initialPositions || {},
        type: move.captured.type,
      };
    }

    const newMove = new Move({
      game: gameId,
      player: userId,
      from: move.from,
      to: move.to,
      piece: move.piece.trim(),
      captured: capturedData,
    });

    await newMove.save();

    game.moves.push(newMove._id);
    await game.save();

    await game.populate("moves");

    const updatedBoard = reconstructBoard(game.moves);
    if (isKingInCheck(updatedBoard, playerNumber)) {
      const opponentNumber = playerNumber === 1 ? 2 : 1;
      const opponentInCheck = isKingInCheck(updatedBoard, opponentNumber);
      if (opponentInCheck) {
        const hasLegalMoves = hasAnyLegalMoves(updatedBoard, opponentNumber);
        if (!hasLegalMoves) {
          game.status = "checkmate";
        }
      }
    }

    await game.save();

    const updatedPlayerTurn = game.moves.length % 2 === 0 ? "white" : "black";

    game.players.forEach((player) => {
      const socketId = socket.getUserSocketId(player._id.toString());
      if (socketId) {
        io.to(socketId).emit("newMove", {
          gameId: game._id,
          moveId: newMove._id,
          game: game,
          playerTurn: updatedPlayerTurn,
        });
      }
    });

    res.status(201).json({
      message: "Move made successfully.",
      move: newMove,
    });
  } catch (err) {
    console.error("Error in makeMove:", err.message);
    res.status(500).json({ message: "Server error while making move." });
  }
};

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
        populate: { path: "players" },
      });

    if (!move) {
      return res.status(404).json({ message: "Move not found." });
    }

    if (!move.game.players.some((player) => player._id.toString() === userId)) {
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
      .populate("players");

    if (!game) {
      return res.status(404).json({ message: "Game not found." });
    }

    if (!game.players.some((player) => player._id.toString() === userId)) {
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
      .populate("players");
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

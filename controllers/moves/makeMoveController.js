// controllers/makeMoveController.js
const mongoose = require("mongoose");
const Move = require("../../models/Move");
const Game = require("../../models/Game");
const socket = require("../../socket");
const io = socket.getIO();
const {
  PIECE_TYPES,
  reconstructBoard,
  validateMove,
  hasAnyLegalMoves,
  isKingInCheck,
} = require("./moveHelpers");
const { generateAIMove } = require("../ai/move/generateAIMoveController");

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
    const game = await Game.findById(gameId).populate("moves players.player");
    if (!game) {
      return res.status(404).json({ message: "Game not found." });
    }

    if (game.status !== "ongoing") {
      return res.status(400).json({ message: "Game is not ongoing." });
    }

    if (!game.players.some((p) => p.player._id.toString() === userId)) {
      return res
        .status(403)
        .json({ message: "You are not a player in this game." });
    }

    const userColor =
      game.players[0].player._id.toString() === userId ? "white" : "black";
    const playerNumber = userColor === "white" ? 1 : 2;

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

    const updatedBoard = reconstructBoard([...game.moves, newMove]);
    let check = false;
    let checkmate = false;
    const opponentNumber = playerNumber === 1 ? 2 : 1;

    if (isKingInCheck(updatedBoard, opponentNumber)) {
      check = true;
      const hasLegalMoves = hasAnyLegalMoves(updatedBoard, opponentNumber);
      if (!hasLegalMoves) {
        checkmate = true;
        game.status = "checkmate";
        game.winner = userId;
      }
    }
    game.lastMove = { from: newMove.from, to: newMove.to };
    game.moves.push(newMove._id);
    await game.save();

    const updatedPlayerTurn = game.moves.length % 2 === 0 ? "white" : "black";

    const playerSockets = game.players
      .filter((player) => !player.isAI)
      .map((p) => socket.getUserSocketId(p.player._id.toString()))
      .filter((socketId) => socketId);

    playerSockets.forEach((socketId) => {
      io.to(socketId).emit("newMove", {
        gameId: game._id,
        moveId: newMove._id,
        moveFrom: newMove.from,
        moveTo: newMove.to,
        lastMove: game.lastMove,
        game: game,
        playerTurn: updatedPlayerTurn,
        check,
        checkmate,
      });

      if (check) {
        // console.log("DEBUG: check exec", check);
        io.to(socketId).emit("checkToKing", {
          gameId: game._id,
          kingColor: opponentNumber === 1 ? "white" : "black",
          message: `Check! The ${
            opponentNumber === 1 ? "white" : "black"
          } king is under threat.`,
        });
      }

      if (checkmate) {
        // console.log("DEBUG: checkmate exec", checkmate);
        const winner = game.players.find(
          (player) => player._id.toString() === userId
        );
        const winnerName =
          winner?.username || (userColor === "white" ? "White" : "Black");

        io.to(socketId).emit("gameOver", {
          gameId: game._id,
          winner: userColor,
          winnerName: winnerName,
          message: `Checkmate! ${winnerName} has won the game.`,
        });
      }
    });

    res.status(201).json({
      message: "Move made successfully.",
      move: newMove,
      check,
      checkmate,
      playerTurn: updatedPlayerTurn,
    });
  } catch (err) {
    console.error("Error in makeMove:", err.message);
    res.status(500).json({ message: "Server error while making move." });
  }
};

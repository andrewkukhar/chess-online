// controllers/ai/move/makeAIMoveController.js
const mongoose = require("mongoose");
const Move = require("../../../models/Move");
const Game = require("../../../models/Game");
const socket = require("../../../socket");
const io = socket.getIO();
const {
  reconstructBoard,
  validateMove,
  hasAnyLegalMoves,
  isKingInCheck,
  convertBoardToFEN,
} = require("../../moves/moveHelpers");
const { generateAIMove } = require("./generateAIMoveController");

/**
 * Make a move for AI in a game.
 * @route POST /api/move/make-ai-move
 * @access Private
 */
exports.makeAIMove = async (req, res) => {
  const { gameId } = req.body;
  // console.log("makeAIMove DEBUG: beginning of execution:");

  if (!mongoose.Types.ObjectId.isValid(gameId)) {
    return res.status(400).json({ message: "Invalid Game ID." });
  }

  try {
    const game = await Game.findById(gameId).populate("moves players.player");
    if (!game) {
      return res.status(404).json({ message: "Game not found." });
    }

    if (game.status !== "ongoing") {
      return res.status(400).json({ message: "Game is not ongoing." });
    }

    const currentTurnPlayer = game.moves.length % 2 === 0 ? "white" : "black";
    if (currentTurnPlayer !== "black") {
      return res.status(400).json({ message: "It's not the AI's turn." });
    }

    // console.log("makeAIMove DEBUG: game.moves:", game.moves);

    const updatedBoardState = reconstructBoard(game.moves);
    const activeColor = currentTurnPlayer === "white" ? "w" : "b";
    const fullMoveNumber = Math.floor(game.moves.length / 2) + 1;

    const fen = convertBoardToFEN(
      updatedBoardState,
      activeColor,
      fullMoveNumber
    );
    // console.log(
    //   "makeAIMove DEBUG: Board state passed to AI before move generation:",
    //   updatedBoardState
    // );

    const aiPlayer = game.players.find((p) => p.isAI);
    if (!aiPlayer) {
      return res
        .status(400)
        .json({ message: "AI player not found in the game." });
    }

    let retries = 5;
    let aiMove = null;
    game.invalidAIMoves = game.invalidAIMoves || [];
    const difficultyLevel = aiPlayer.difficultyLevel || "medium";

    while (retries > 0) {
      aiMove = await generateAIMove(
        game,
        updatedBoardState,
        fen,
        difficultyLevel
      );

      if (!aiMove) {
        console.error("Error: Generated AI move was invalid. Retrying...");
        retries--;
        continue;
      }

      const isValid = validateMove(updatedBoardState, aiMove, 2);
      if (isValid) {
        break;
      } else {
        console.error("Invalid AI move generated. Retrying...");
        const invalidMoveNotation = `${indexToAlgebraic(
          aiMove.from
        )}${indexToAlgebraic(aiMove.to)} (${aiMove.piece})`;
        game.invalidAIMoves.push(invalidMoveNotation);
        retries--;
      }
    }

    // console.log("makeAIMove DEBUG: Generated AI move:", aiMove);
    if (!aiMove || retries === 0) {
      console.error(
        "Failed to generate a valid AI move after multiple attempts."
      );
      return res.status(500).json({ message: "Failed to generate AI move." });
    }

    const newMove = new Move({
      game: gameId,
      player: aiPlayer._id,
      from: aiMove.from,
      to: aiMove.to,
      piece: aiMove.piece.trim(),
    });
    const capturedPiece = updatedBoardState[aiMove.to];
    // console.log("makeAIMove DEBUG: capturedPiece:", capturedPiece);
    if (capturedPiece) {
      newMove.captured = {
        player: capturedPiece.player,
        style: capturedPiece.style,
        type: capturedPiece.type,
        initialPositions: capturedPiece.initialPositions || {},
      };
    }

    await newMove.save();
    // console.log("makeAIMove DEBUG: newMove:", newMove);

    game.lastMove = { from: newMove.from, to: newMove.to };
    game.moves.push(newMove._id);
    game.playerTurn = game.moves.length % 2 === 0 ? "white" : "black";
    await game.save();
    await game.populate("moves players.player");

    const updatedBoard = reconstructBoard([...game.moves]);
    // console.log("makeAIMove DEBUG: updatedBoard:", updatedBoard);

    let check = false;
    let checkmate = false;
    const opponentNumber = 1;

    if (isKingInCheck(updatedBoard, opponentNumber)) {
      check = true;
      const hasLegalMoves = hasAnyLegalMoves(updatedBoard, opponentNumber);
      if (!hasLegalMoves) {
        checkmate = true;
        game.status = "checkmate";
        game.winner = aiPlayer._id;
      }
    }

    await game.save();

    const playerSockets = game.players
      .filter((player) => !player.isAI)
      .map((p) => socket.getUserSocketId(p.player._id.toString()))
      .filter((socketId) => socketId);

    playerSockets.forEach((socketId) => {
      // console.log("makeAIMove DEBUG: newMove exec, socketId:", socketId);

      io.to(socketId).emit("newMove", {
        gameId: game._id,
        moveId: newMove._id,
        moveFrom: newMove.from,
        moveTo: newMove.to,
        lastMove: game.lastMove,
        game: game,
        playerTurn: game.playerTurn,
        check,
        checkmate,
      });

      if (check) {
        // console.log("makeAIMove DEBUG: check exec", check);
        io.to(socketId).emit("checkToKing", {
          gameId: game._id,
          kingColor: opponentNumber === 1 ? "white" : "black",
          message: `Check! The ${
            opponentNumber === 1 ? "white" : "black"
          } king is under threat.`,
        });
      }

      if (checkmate) {
        // console.log("makeAIMove DEBUG: checkmate exec", checkmate);
        const winnerName =
          aiPlayer.username ||
          (currentTurnPlayer === "black" ? "Black" : "White");

        io.to(socketId).emit("gameOver", {
          gameId: game._id,
          winner: "black",
          winnerName: winnerName,
          message: `Checkmate! ${winnerName} has won the game.`,
        });
      }
    });

    res.status(201).json({
      message: "AI move made successfully.",
      move: newMove,
      check,
      checkmate,
      playerTurn: game.playerTurn,
    });
  } catch (err) {
    console.error("Error in makeAIMove:", err.message);
    res.status(500).json({ message: "Server error while making AI move." });
  }
};

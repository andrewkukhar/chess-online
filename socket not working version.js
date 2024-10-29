// socket.js
const jwt = require("jsonwebtoken");
const Game = require("./models/Game");
const Move = require("./models/Move");
const User = require("./models/User");

const userSocketMap = new Map();

function initializeSocket(io) {
  io.use(async (socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: Token required."));
    }
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      if (!userSocketMap.has(socket.userId)) {
        userSocketMap.set(socket.userId, new Set());
      }
      userSocketMap.get(socket.userId).add(socket.id);
      next();
    } catch (err) {
      console.error("Socket authentication error:", err);
      return next(new Error("Authentication error: Invalid token."));
    }
  });

  io.on("connection", (socket) => {
    console.log("A user connected:", socket.id, "UserID:", socket.userId);
    /**
     * Event: createGame
     * Payload: gameId (String)
     * Description: Creates a new game session with the provided gameId.
     */
    socket.on("createGame", async (gameId) => {
      try {
        if (typeof gameId !== "string" || gameId.trim().length === 0) {
          socket.emit("error", "Invalid Game ID.");
          return;
        }

        const existingGame = await Game.findOne({ gameId });
        if (existingGame) {
          socket.emit("error", "Game ID already exists.");
          return;
        }

        const newGame = new Game({
          gameId,
          players: [socket.userId],
          status: "waiting",
        });
        await newGame.save();

        socket.join(gameId);
        socket.emit("gameCreated", { gameId });
        console.log(`Game ${gameId} created by socket ${socket.userId}`);
      } catch (err) {
        console.error("Error in createGame:", err);
        socket.emit("error", "Server error while creating game.");
      }
    });
    /**
     * Event: joinGame
     * Payload: gameId (String)
     * Description: Allows a user to join an existing game session.
     */
    socket.on("joinGame", async (gameId) => {
      try {
        if (typeof gameId !== "string" || gameId.trim().length === 0) {
          socket.emit("error", "Invalid Game ID.");
          return;
        }

        const game = await Game.findOne({ gameId });
        if (!game) {
          socket.emit("error", "Game ID does not exist.");
          return;
        }

        if (game.players.includes(socket.userId)) {
          socket.join(gameId);
          socket.emit("startGame", { gameId, players: game.players });
          return;
        }

        if (game.players.length >= 2) {
          socket.emit("error", "Game is already full.");
          return;
        }

        game.players.push(socket.userId);
        game.status = "ongoing";
        await game.save();

        socket.join(gameId);
        io.to(gameId).emit("startGame", { gameId, players: game.players });
        console.log(`Socket ${socket.userId} joined game ${gameId}`);
      } catch (err) {
        console.error("Error in joinGame:", err);
        socket.emit("error", "Server error while joining game.");
      }
    });
    /**
     * Event: makeMove
     * Payload: { gameId: String, move: { from: Number, to: Number, piece: String, captured: String|null } }
     * Description: Handles a player's move in the game.
     */
    socket.on("makeMove", async ({ gameId, move }) => {
      try {
        if (
          typeof gameId !== "string" ||
          typeof move !== "object" ||
          typeof move.from !== "number" ||
          typeof move.to !== "number" ||
          typeof move.piece !== "string"
        ) {
          socket.emit("error", "Invalid move data.");
          return;
        }
        const game = await Game.findOne({ gameId }).populate("players");
        if (!game || game.status !== "ongoing") {
          socket.emit("error", "Invalid game state.");
          return;
        }

        const isPlayer1 = game.players[0]._id.toString() === socket.userId;
        const isPlayer2 = game.players[1]?._id.toString() === socket.userId;
        const currentTurnPlayer =
          game.moves.length % 2 === 0 ? "white" : "black";
        const userColor = isPlayer1 ? "white" : "black";

        if (userColor !== currentTurnPlayer) {
          socket.emit("error", "It's not your turn.");
          return;
        }

        const newMove = new Move({
          game: game._id,
          player: socket.userId,
          from: move.from,
          to: move.to,
          piece: move.piece,
          captured: move.captured || null,
        });
        await newMove.save();

        game.moves.push(newMove._id);
        await game.save();

        socket.to(gameId).emit("moveMade", {
          from: move.from,
          to: move.to,
          piece: move.piece,
          captured: move.captured || null,
        });

        console.log(
          `Move made in game ${gameId} by user ${socket.userId}: ${move.piece} from ${move.from} to ${move.to}`
        );
      } catch (err) {
        console.error("Error in makeMove:", err);
        socket.emit("error", "Server error while making move.");
      }
    });

    /**
     * Event: undoMove
     * Payload: gameId (String)
     * Description: Allows a player to undo the last move in the game.
     */
    socket.on("undoMove", async (gameId) => {
      try {
        if (typeof gameId !== "string" || gameId.trim().length === 0) {
          socket.emit("error", "Invalid Game ID.");
          return;
        }

        const game = await Game.findOne({ gameId })
          .populate("moves")
          .populate("players");
        if (!game || game.status !== "ongoing") {
          socket.emit("error", "Cannot undo move in this game state.");
          return;
        }

        if (game.moves.length === 0) {
          socket.emit("error", "No moves to undo.");
          return;
        }

        const lastMoveId = game.moves[game.moves.length - 1];
        const lastMove = await Move.findById(lastMoveId);
        if (!lastMove) {
          socket.emit("error", "Last move not found.");
          return;
        }

        if (lastMove.player.toString() !== socket.userId) {
          socket.emit("error", "You can only undo your own last move.");
          return;
        }

        game.moves.pop();
        await game.save();

        await Move.findByIdAndDelete(lastMoveId);

        io.to(gameId).emit("moveUndone", {
          from: lastMove.from,
          to: lastMove.to,
          piece: lastMove.piece,
          captured: lastMove.captured,
        });

        console.log(`Move undone in game ${gameId} by user ${socket.userId}`);
      } catch (err) {
        console.error("Error in undoMove:", err);
        socket.emit("error", "Server error while undoing move.");
      }
    });

    socket.on("disconnect", async () => {
      console.log("A user disconnected:", socket.id, "UserID:", socket.userId);
      try {
        if (userSocketMap.has(socket.userId)) {
          const userSockets = userSocketMap.get(socket.userId);
          userSockets.delete(socket.id);
          if (userSockets.size === 0) {
            userSocketMap.delete(socket.userId);

            const games = await Game.find({ players: socket.userId });

            for (let game of games) {
              game.players = game.players.filter(
                (playerId) => playerId.toString() !== socket.userId.toString()
              );

              game.status = "waiting";
              await game.save();

              io.to(game.gameId).emit("playerDisconnected", {
                userId: socket.userId,
                gameId: game.gameId,
                message:
                  "A player has disconnected. Waiting for them to reconnect.",
              });

              console.log(
                `User ${socket.userId} removed from game ${game.gameId}`
              );
            }
          }
        }
      } catch (err) {
        console.error("Error during disconnection cleanup:", err);
      }
    });
  });
}

module.exports = initializeSocket;

// controllers/gameController.js
const mongoose = require("mongoose");
const Game = require("../models/Game");
const socket = require("../socket");
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
      players: [userId],
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
    if (!game.players.includes(mongoose.Types.ObjectId(userId))) {
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
    if (game.players.includes(mongoose.Types.ObjectId(playerId))) {
      return res.status(400).json({ message: "You are already in this game." });
    }

    // Check if game is full
    if (game.players.length >= 2) {
      return res.status(400).json({ message: "Game is already full." });
    }

    // Add user to the game
    game.players.push(mongoose.Types.ObjectId(playerId));

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

    if (!game.players.includes(mongoose.Types.ObjectId(playerId))) {
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

/**
 * Remove a game.
 * @route DELETE /api/game/:gameId
 * @access Private
 */
exports.removeGame = async (req, res) => {
  const { gameId } = req.params;
  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(gameId)) {
    return res.status(400).json({ message: "Invalid Game ID." });
  }

  try {
    const game = await Game.findById(gameId);
    if (!game) {
      return res.status(404).json({ message: "Game not found." });
    }

    // Check if the requester is the host (first player)
    if (game.players[0].toString() !== userId) {
      return res
        .status(403)
        .json({ message: "Unauthorized to remove this game." });
    }

    await Game.deleteOne({ _id: game._id });

    game.players.forEach((player) => {
      const socketId = socket.getUserSocketId(player.toString());
      if (socketId) {
        io.to(socketId).emit("gameRemoved", {
          gameId,
        });
      }
    });

    res.status(200).json({ message: "Game removed successfully." });
  } catch (err) {
    console.error("Error in removeGame:", err.message);
    res.status(500).json({ message: "Server error while removing game." });
  }
};

/**
 * Get a specific get by ID.
 * @route GET /api/games/:gameId
 * @access Private
 */
exports.getGame = async (req, res) => {
  const { gameId } = req.params;
  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(gameId)) {
    return res.status(400).json({ message: "Invalid Game ID." });
  }

  try {
    const game = await Game.findById(gameId)
      .populate("players")
      .populate({
        path: "moves",
        populate: { path: "player" },
      });

    if (!game) {
      return res.status(404).json({ message: "Game not found." });
    }

    if (!game.players.some((player) => player._id.toString() === userId)) {
      return res
        .status(403)
        .json({ message: "Unauthorized to view this game." });
    }

    res.status(200).json(game);
  } catch (err) {
    console.error("Error in getGame:", err.message);
    res.status(500).json({ message: "Server error while retrieving move." });
  }
};

/**
 * Get all games
 * @route GET /api/games/get-all-games
 * @access Private
 */
exports.getAllGames = async (req, res) => {
  const userId = req.user.userId;
  console.log("userId", userId);

  // if (!mongoose.Types.ObjectId.isValid(userId)) {
  //   return res.status(400).json({ message: "Invalid user ID." });
  // }
  try {
    const games = await Game.find({ players: userId })
      .populate("players")
      .populate({
        path: "moves",
        populate: { path: "player" },
      })
      .sort({ createdAt: -1 });
    console.log("games", games);

    if (!games) {
      return res.status(404).json({ message: "Games not found." });
    }

    res.status(200).json(games);
  } catch (err) {
    console.error("Error in getAllGames:", err.message);
    res.status(500).json({ message: "Server error while retrieving move." });
  }
};

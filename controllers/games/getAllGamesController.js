// controllers/gameController.js
const mongoose = require("mongoose");
const Game = require("../../models/Game");

/**
 * Get all games that belong to the authenticated user.
 * @route GET /api/games/get-all-games
 * @access Private
 */
exports.getAllGames = async (req, res) => {
  const userId = req.user.userId;
  const { status } = req.query;
  // console.log("userId", userId);

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid user ID." });
  }
  try {
    const query = { players: userId };
    if (status && status !== "all") {
      query.status = status.toLowerCase();
    }

    const games = await Game.find(query)
      .populate("players")
      .populate({
        path: "moves",
        populate: { path: "player" },
      })
      .sort({ createdAt: -1 });

    res.status(200).json(games);
  } catch (err) {
    console.error("Error in getAllGames:", err.message);
    res.status(500).json({ message: "Server error while retrieving move." });
  }
};

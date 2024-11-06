const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { sendGameLink } = require("../controllers/emails/emailController");

// @route   POST /api/emails/send-game-link/:gameId
// @desc    Send the link to the game
// @access  Private
router.post("/send-game-link/:gameId", auth, sendGameLink);

module.exports = router;

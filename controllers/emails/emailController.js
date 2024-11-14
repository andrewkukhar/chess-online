// ./controllers/contactUsEmailController:
const nodemailer = require("nodemailer");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const Game = require("../../models/Game");
const User = require("../../models/User");
const socket = require("../../socket");
const io = socket.getIO();

let transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

exports.sendGameLink = async (req, res) => {
  const { gameId } = req.params;
  const { email } = req.body;
  const userId = req.user.userId;

  if (!mongoose.Types.ObjectId.isValid(gameId)) {
    return res.status(400).json({ message: "Invalid Game ID." });
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    return res.status(400).json({ message: "Invalid User ID." });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    const game = await Game.findById(gameId)
      .populate("players.player")
      .populate("winner")
      .populate({
        path: "moves",
        populate: { path: "player" },
      });

    if (!game) {
      return res.status(404).json({ message: "Game not found." });
    }

    const receiverEmailLower = email.toLowerCase();
    const senderName = user.username;
    const senderEmail = user.email.toLowerCase();

    let invitedUser = await User.findOne({ email: receiverEmailLower });
    let token;
    let newUserInstructions = "";

    if (invitedUser) {
      const payload = {
        user: { userId: invitedUser._id, role: invitedUser.role },
      };
      token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "12h" });
    } else {
      const defaultPassword = "password";
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(defaultPassword, salt);

      invitedUser = new User({
        email: receiverEmailLower,
        username: `player_${Date.now()}`,
        password: hashedPassword,
        role: "player",
      });
      await invitedUser.save();
      newUserInstructions = `
        <p><strong>Note:</strong> Since you are a new user, your temporary username is <strong>${invitedUser.username}</strong> and your password is <strong>password</strong>. Please make sure to change your password after logging in.</p>
      `;

      const payload = {
        user: { userId: invitedUser._id, role: invitedUser.role },
      };
      token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "3h" });
    }

    if (
      !game.players.some(
        (p) => p.player.toString() === invitedUser._id.toString()
      )
    ) {
      if (game.players.length >= 2) {
        return res.status(400).json({ message: "Game is already full." });
      }
      game.players.push({ player: invitedUser._id });

      if (game.players.length === 2) {
        game.status = "ongoing";
      }

      await game.save();

      const playerSockets = game.players
        .map((p) => socket.getUserSocketId(p.player.toString()))
        .filter((socketId) => socketId);

      playerSockets.forEach((socketId) => {
        io.to(socketId).emit("playerJoinedGame", {
          gameId: game._id,
          playerId: invitedUser._id,
          message: "New player joined game.",
          game,
        });
      });
    }

    const linkToGo = `/game/${gameId}`;
    const link = `${process.env.REACT_APP_FRONTEND_URL}/login-via-token?token=${token}&link=${linkToGo}`;

    const welcomeMailOptions = {
      from: `${senderName}, ${senderEmail}, Chess Online <${process.env.EMAIL_USER}>`,
      replyTo: senderEmail,
      to: receiverEmailLower,
      subject: `Chess Online Invitaion from ${senderName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <p>Hey there,</p>
          <p>My name is <strong>${senderName}</strong>,</p>
          <p>I am inviting you to join me for a chess game online.</p>
          <p>You can click the button below and join the game:</p>
          <p style="text-align: center; margin: 20px 0;">
            <a href="${link}" style="background-color: #32495d; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Join the Game</a>
          </p>
          ${newUserInstructions}
          <p>Thank you for your time,<br>Chess Online Web App</p>
        </div>
      `,
    };

    transporter.sendMail(welcomeMailOptions, (err, info) => {
      if (err) {
        console.error("Email send error:", err);
        return res.status(500).json({
          msg: `Failed to send game link email, error: ${err.message}`,
        });
      }
      res.status(201).json({ msg: "Email sent successfully" });
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ msg: `Server error: ${err.message}` });
  }
};

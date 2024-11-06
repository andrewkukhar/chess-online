// routes/auth.js
const express = require("express");
const router = express.Router();
const {
  register,
  login,
  loginViaToken,
} = require("../controllers/auth/authController");

router.post("/register", register);

router.post("/login", login);

router.post("/login-via-token", loginViaToken);

module.exports = router;

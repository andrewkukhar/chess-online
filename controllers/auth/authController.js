// routes/auth.js
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const User = require("../../models/User");

exports.register = async (req, res) => {
  const { email, username, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user)
      return res
        .status(400)
        .json({ message: "User with this email already exists." });

    let existingUsername = await User.findOne({ username });
    if (existingUsername)
      return res.status(400).json({ message: "Username is already taken." });
    let userrole = email === process.env.EMAIL_USER ? "ak-admin" : "player";
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    user = new User({
      email,
      username,
      password: hashedPassword,
      role: userrole,
    });
    await user.save();

    res.status(201).json({ message: "Registered successfully." });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    let user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials." });
    // console.log("user", user);
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials." });

    const payload = { user: { userId: user._id, role: user.role } };

    const token = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: "12h",
    });

    res.json({
      token,
      user: { userId: user._id, username: user.username, userrole: user.role },
    });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
};

exports.loginViaToken = async (req, res) => {
  const { token } = req.body;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.user.userId);

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.status(200).json({
      token,
      user: {
        userId: user._id,
        username: user.username,
        userrole: user.role,
      },
    });
  } catch (err) {
    console.error("Error verifying token:", err);
    res.status(401).json({ message: "Invalid or expired token." });
  }
};

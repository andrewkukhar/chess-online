// app.js
const express = require("express");
require("dotenv").config();
const cors = require("cors");
const path = require("path");
const http = require("http");
const socket = require("./socket");
const connectToMongoDB = require("./mongodb");
const app = express();
const server = http.createServer(app);
socket.init(server);

const allowedOrigins = [
  "http://localhost:3000",
  "https://chess-two-players.herokuapp.com",
];

let corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
};

const authRoutes = require("./routes/auth");
const checkRoutes = require("./routes/check");
const userRoutes = require("./routes/user");
const gameRoutes = require("./routes/game");
const moveRoutes = require("./routes/move");
const emailRoutes = require("./routes/email");
const gameAIRoutes = require("./routes/game-ai");

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/check", checkRoutes);
app.use("/api/users", userRoutes);
app.use("/api/games", gameRoutes);
app.use("/api/moves", moveRoutes);
app.use("/api/emails", emailRoutes);
app.use("/api/games-ai", gameAIRoutes);

app.use("/", express.static(path.join(__dirname, "client", "build")));
app.get("*", (req, res) => {
  res.sendFile(path.resolve(__dirname, "client", "build", "index.html"));
});

const PORT = process.env.PORT || 5000;

(async () => {
  connectToMongoDB();

  server.listen(PORT, () => {
    console.log(`Server (HTTP & WebSocket) is running on PORT ${PORT}`);
  });
})();

// function indexToAlgebraic(index) {
//   const files = ["a", "b", "c", "d", "e", "f", "g", "h"];
//   const rank = 8 - Math.floor(index / 8); // Corrected rank calculation
//   const file = files[index % 8];
//   return `${file}${rank}`;
// }
// console.log(`test ${indexToAlgebraic(15)}`);

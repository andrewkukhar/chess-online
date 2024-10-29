// /socket.js
const { Server } = require("socket.io");

let io;
let userSocketMap = new Map();

module.exports = {
  init: (httpServer) => {
    io = new Server(httpServer, {
      cors: {
        origin: [
          "http://localhost:3000",
          "https://chess-two-players.herokuapp.com",
        ],
        methods: ["GET", "POST", "PUT", "DELETE"],
      },
    });

    io.on("connection", async (socket) => {
      const userId = socket.handshake.query.userId;
      if (userId) {
        userSocketMap.set(userId, socket.id);

        socket.on("disconnect", async () => {
          userSocketMap.delete(userId);
        });
      }
    });
    return io;
  },

  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },
  getUserSocketId: (userId) => {
    return userSocketMap.get(userId);
  },
};

process.on("SIGINT", () => {
  io.close(() => {
    console.log("Socket.IO server closed");
    process.exit();
  });
});

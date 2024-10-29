// mogodb connection:
const mongoose = require("mongoose");

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      socketTimeoutMS: 60000,
      connectTimeoutMS: 60000,
      serverSelectionTimeoutMS: 60000,
      maxPoolSize: 10,
    });
    console.log(
      `MongoDB connection established successfully MongoDB URI: ${process.env.MONGODB_URI}`
    );
  } catch (err) {
    console.error("MongoDB connection error:", err);
    process.exit(1);
  }
};

module.exports = connectToMongoDB;

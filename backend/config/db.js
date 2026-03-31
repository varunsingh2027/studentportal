const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

let memoryServer;
const MEMORY_MONGO_OPTIONS = {
  binary: { version: "7.0.14", arch: "x64" },
};

const connectDB = async () => {
  try {
    let mongoUri = process.env.MONGO_URI;

    if (!mongoUri) {
      memoryServer = await MongoMemoryServer.create(MEMORY_MONGO_OPTIONS);
      mongoUri = memoryServer.getUri();
      console.log("Using in-memory MongoDB (no MONGO_URI provided).");
    }

    const conn = await mongoose.connect(mongoUri);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    // If a MONGO_URI was provided but connection fails, do NOT fallback silently.
    // This allows the user to see that their Atlas connection failed (e.g. IP not whitelisted).
    if (process.env.MONGO_URI) {
      console.error("Failed to connect to the provided MONGO_URI. Please check your credentials and ensure your IP is whitelisted in MongoDB Atlas.");
    }
    process.exit(1);
  }
};

module.exports = connectDB;

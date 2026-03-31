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
    // Fallback: if configured MongoDB is unavailable, start in-memory DB.
    if (process.env.MONGO_URI) {
      try {
        console.log("Attempting to start in-memory MongoDB fallback...");
        memoryServer = await MongoMemoryServer.create(MEMORY_MONGO_OPTIONS);
        const memoryUri = memoryServer.getUri();
        const conn = await mongoose.connect(memoryUri);
        console.log("Configured MongoDB unavailable. Using in-memory MongoDB.");
        console.log(`MongoDB connected: ${conn.connection.host}`);
        return;
      } catch (fallbackError) {
        console.error("MongoDB fallback connection error:", fallbackError.message);
      }
    }
    console.error("MongoDB connection error:", error.message);
    process.exit(1);
  }
};

module.exports = connectDB;

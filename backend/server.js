const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const dotenv = require("dotenv");
const helmet = require("helmet");
const mongoSanitize = require("express-mongo-sanitize");
const rateLimit = require("express-rate-limit");
const connectDB = require("./config/db");
const authRoutes = require("./routes/authRoutes");
const studentRoutes = require("./routes/studentRoutes");
const exportRoutes = require("./routes/exportRoutes");
const User = require("./models/User");
const bcrypt = require("bcryptjs");

dotenv.config();
const app = express();

// Security Middleware
// app.use(helmet());
// app.use(mongoSanitize());
// Limit repeated requests to public APIs
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

app.use(cors());
app.use(express.json({ limit: "10kb" }));
app.use(morgan("dev"));

app.get("/api/health", (_req, res) => {
  res.status(200).json({ message: "Server is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/export", exportRoutes);

app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ message: "Internal server error" });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  // Seed default admin user
  try {
    const adminEmail = "xyz@gmail.com";
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash("1234567", 10);
      await User.create({
        name: "Admin",
        email: adminEmail,
        password: hashedPassword,
        role: "admin",
      });
      console.log("Default admin account created.");
    }
  } catch (err) {
    console.error("Error creating default admin:", err);
  }

  app.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
  });
};

startServer();

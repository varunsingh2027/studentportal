const mongoose = require("mongoose");

const studentProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  branch: {
    type: String,
    required: true,
    trim: true,
  },
  enrollmentNumber: {
    type: String,
    required: true,
    trim: true,
    // Note: Assuming unique per student. Add unique: true if required.
  },
  semester: {
    type: Number,
    required: true,
    min: 1,
    max: 12,
  },
  gender: {
    type: String,
    enum: ["male", "female", "other"],
    required: true,
  },
  skills: [
    {
      type: String,
      trim: true,
    },
  ],
  certifications: [
    {
      type: String,
      trim: true,
    },
  ],
  hackathons: [
    {
      type: String,
      trim: true,
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("StudentProfile", studentProfileSchema);

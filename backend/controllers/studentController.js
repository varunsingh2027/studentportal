const mongoose = require("mongoose");
const StudentProfile = require("../models/StudentProfile");
const User = require("../models/User");

const canAccessStudent = (requestUser, targetUserId) => {
  return requestUser.role === "admin" || String(requestUser._id) === String(targetUserId);
};

const getAllStudents = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const search = req.query.search || "";
    const skip = (page - 1) * limit;

    let query = {};
    if (search) {
      // Find users matching search first since we can't easily regex populate
      const users = await User.find({
        $or: [
          { name: { $regex: search, $options: "i" } },
          { email: { $regex: search, $options: "i" } },
        ],
      }).select("_id");
      const userIds = users.map((u) => u._id);

      query = {
        $or: [
          { userId: { $in: userIds } },
          { branch: { $regex: search, $options: "i" } },
        ],
      };
    }

    const [profiles, total] = await Promise.all([
      StudentProfile.find(query)
        .populate("userId", "name email role")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      StudentProfile.countDocuments(query),
    ]);

    return res.status(200).json({
      students: profiles,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch students", error: error.message });
  }
};

const getStudentById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid id" });
    }

    let profile = await StudentProfile.findById(id).populate("userId", "name email role");
    if (!profile) {
      profile = await StudentProfile.findOne({ userId: id }).populate("userId", "name email role");
    }
    if (!profile) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    if (!canAccessStudent(req.user, profile.userId._id)) {
      return res.status(403).json({ message: "Forbidden: cannot access this profile" });
    }

    return res.status(200).json(profile);
  } catch (error) {
    return res.status(500).json({ message: "Failed to fetch profile", error: error.message });
  }
};

const createStudent = async (req, res) => {
  try {
    console.log("createStudent called with body:", JSON.stringify(req.body, null, 2));
    console.log("createStudent user:", JSON.stringify(req.user, null, 2));

    const { userId, branch, class: legacyClass, enrollmentNumber, semester, gender, skills, certifications, hackathons } = req.body;

    const finalBranch = branch || legacyClass;

    if (!finalBranch) {
        return res.status(400).json({ message: "Branch is required" });
    }

    const targetUserId = req.user.role === "admin" && userId ? userId : req.user._id;
    if (!canAccessStudent(req.user, targetUserId)) {
      return res.status(403).json({ message: "Forbidden: cannot create for another user" });
    }

    const user = await User.findById(targetUserId);
    if (!user) {
      return res.status(404).json({ message: "Target user not found" });
    }

    const existing = await StudentProfile.findOne({ userId: targetUserId });
    if (existing) {
      return res.status(409).json({ message: "Profile already exists. Use update endpoint." });
    }

    const profile = await StudentProfile.create({
      userId: targetUserId,
      branch: finalBranch,
      enrollmentNumber,
      semester: parseInt(semester),
      gender,
      skills: Array.isArray(skills) ? skills : [],
      certifications: Array.isArray(certifications) ? certifications : [],
      hackathons: Array.isArray(hackathons) ? hackathons : [],
    });

    const populated = await profile.populate("userId", "name email role");
    return res.status(201).json(populated);
  } catch (error) {
    console.error("Create Profile Error:", error);
    return res.status(500).json({ message: "Failed to create profile: " + error.message, error: error.message });
  }
};

const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid profile id" });
    }

    const profile = await StudentProfile.findById(id).populate("userId", "name email role");
    if (!profile) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    if (!canAccessStudent(req.user, profile.userId._id)) {
      return res.status(403).json({ message: "Forbidden: cannot update this profile" });
    }

    const payload = req.body;
    if (typeof payload.branch === "string") profile.branch = payload.branch;
    else if (typeof payload.class === "string" && !profile.branch) profile.branch = payload.class;

    if (typeof payload.enrollmentNumber === "string") profile.enrollmentNumber = payload.enrollmentNumber;
    if (payload.semester) profile.semester = parseInt(payload.semester);
    if (typeof payload.gender === "string") profile.gender = payload.gender;
    if (Array.isArray(payload.skills)) profile.skills = payload.skills;
    if (Array.isArray(payload.certifications)) profile.certifications = payload.certifications;
    if (Array.isArray(payload.hackathons)) profile.hackathons = payload.hackathons;

    const updated = await profile.save();
    const populated = await updated.populate("userId", "name email role");
    return res.status(200).json(populated);
  } catch (error) {
    console.error("Update Profile Error:", error);
    return res.status(500).json({ message: "Failed to update profile: " + error.message, error: error.message });
  }
};

const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid profile id" });
    }

    const profile = await StudentProfile.findByIdAndDelete(id);
    if (!profile) {
      return res.status(404).json({ message: "Student profile not found" });
    }

    return res.status(200).json({ message: "Student profile deleted" });
  } catch (error) {
    return res.status(500).json({ message: "Failed to delete profile", error: error.message });
  }
};

module.exports = {
  getAllStudents,
  getStudentById,
  createStudent,
  updateStudent,
  deleteStudent,
};

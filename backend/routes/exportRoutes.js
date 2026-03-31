const express = require("express");
const { exportStudents } = require("../controllers/exportController");
const { protect } = require("../middleware/authMiddleware");
const { authorizeRoles } = require("../middleware/roleMiddleware");

const router = express.Router();

router.get("/", protect, authorizeRoles("admin"), exportStudents);

module.exports = router;

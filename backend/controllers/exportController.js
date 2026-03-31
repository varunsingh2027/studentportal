const ExcelJS = require("exceljs");
const StudentProfile = require("../models/StudentProfile");

const normalizeListValue = (value) => {
  if (!Array.isArray(value) || value.length === 0) return "";
  return value.filter(Boolean).join(", ");
};

const exportStudents = async (req, res) => {
  try {
    const { branch: branchFilter } = req.query;
    const query = {};

    if (typeof branchFilter === "string" && branchFilter.trim()) {
      query.branch = branchFilter.trim();
    }

    // lean() reduces memory overhead for bulk exports.
    const students = await StudentProfile.find(query)
      .select("userId branch class enrollmentNumber semester gender skills certifications hackathons createdAt")
      .populate({ path: "userId", select: "name email", options: { lean: true } })
      .sort({ createdAt: -1 })
      .lean();

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Students");

    worksheet.columns = [
      { header: "Name", key: "name", width: 24 },
      { header: "Email", key: "email", width: 30 },
      { header: "Enrollment No.", key: "enrollmentNumber", width: 18 },
      { header: "Semester", key: "semester", width: 10 },
      { header: "Branch", key: "branch", width: 14 },
      { header: "Gender", key: "gender", width: 12 },
      { header: "Skills", key: "skills", width: 35 },
      { header: "Certifications", key: "certifications", width: 40 },
      { header: "Hackathons", key: "hackathons", width: 40 },
      { header: "Created At", key: "createdAt", width: 24 },
    ];

    // Bonus: style header row.
    worksheet.getRow(1).font = { bold: true };

    students.forEach((student) => {
      worksheet.addRow({
        name: student.userId?.name || "N/A",
        email: student.userId?.email || "N/A",
        enrollmentNumber: student.enrollmentNumber || "",
        semester: student.semester || "",
        branch: student.branch || student.class || "",
        gender: student.gender || "",
        skills: normalizeListValue(student.skills),
        certifications: normalizeListValue(student.certifications),
        hackathons: normalizeListValue(student.hackathons),
        createdAt: student.createdAt ? new Date(student.createdAt).toISOString() : "",
      });
    });

    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader("Content-Disposition", "attachment; filename=students.xlsx");

    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    return res.status(500).json({ message: "Failed to export students", error: error.message });
  }
};

module.exports = { exportStudents };

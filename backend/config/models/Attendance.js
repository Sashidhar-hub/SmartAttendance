const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
  studentId: String,
  sessionId: String,
  courseName: String,
  date: String,
  verified: Boolean
}, { timestamps: true });

module.exports = mongoose.model("Attendance", attendanceSchema);

const mongoose = require("mongoose");

const studentSchema = new mongoose.Schema({
  studentId: String,
  name: String,
  email: String,
  classSection: String,
  passwordHash: String,
  photoBase64: String,
  faceEmbedding: Array,
  hasReferenceFace: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model("Student", studentSchema);

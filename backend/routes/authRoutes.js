const express = require("express");
const bcrypt = require("bcryptjs");
const Student = require("../models/Student");
const router = express.Router();

// ✅ Signup
router.post("/signup", async (req, res) => {
  const { studentId, name, email, classSection, password } = req.body;

  const exists = await Student.findOne({ studentId });
  if (exists) return res.status(400).json({ message: "Student already exists" });

  const hash = await bcrypt.hash(password, 10);

  const student = await Student.create({
    studentId, name, email, classSection,
    passwordHash: hash
  });

  res.json(student);
});

// ✅ Login
router.post("/login", async (req, res) => {
  const { identifier, password } = req.body;

  const student = await Student.findOne({
    $or: [{ studentId: identifier }, { email: identifier }]
  });

  if (!student) return res.status(404).json({ message: "Student not found" });

  const match = await bcrypt.compare(password, student.passwordHash);
  if (!match) return res.status(401).json({ message: "Wrong password" });

  res.json(student);
});

module.exports = router;

const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  name: String,
  rollNumber: String,
  department: String,
  room: String,
  photoPath: String,
  isVerified: { type: Boolean, default: false }
});

module.exports = mongoose.model('Student', studentSchema);
const mongoose = require('mongoose');

const departmentSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  rooms: [
    {
      type: String,
    },
  ],
});

module.exports = mongoose.model('Department', departmentSchema);

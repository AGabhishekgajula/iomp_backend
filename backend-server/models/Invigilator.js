const mongoose = require('mongoose');

const invigilatorSchema = new mongoose.Schema({
  username: { type: String, required: true },
  password: { type: String, required: true },
});

const Invigilator = mongoose.model('Invigilator', invigilatorSchema);

module.exports = Invigilator;

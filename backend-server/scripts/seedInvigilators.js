const mongoose = require('mongoose');
const Invigilator = require('../models/Invigilator');

mongoose.connect('mongodb://localhost:27017/facerecog', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const seedData = [
  { username: 'ep', password: '123' },
  { username: 'admin', password: 'adminpass' },
  { username: 'cs_invigilator', password: 'cs123' },
];

Invigilator.insertMany(seedData)
  .then(() => {
    console.log('✅ Invigilators inserted successfully');
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error('❌ Error inserting invigilators:', err);
  });

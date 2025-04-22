const mongoose = require('mongoose');
const Student = require('../models/Student'); // Adjust the path if needed

mongoose.connect('mongodb://localhost:27017/facerecog', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const students = [
  {
    name: 'Abhishek G',
    rollNumber: '23015A0507',
    department: 'CSE',
    room: '101',
    photoPath: 'photos/23015A0507.jpg',
  },
  {
    name: 'Sneha Reddy',
    rollNumber: '23015A0508',
    department: 'CSE',
    room: '101',
    photoPath: 'photos/23015A0508.jpg',
  },
  {
    name: 'Vikram Das',
    rollNumber: '23015A0509',
    department: 'CSE',
    room: '101',
    photoPath: 'photos/23015A0509.jpg',
  },
  {
    name: 'Meena Kumari',
    rollNumber: '23015A0510',
    department: 'ECE',
    room: '102',
    photoPath: 'photos/23015A0510.jpg',
  },
  {
    name: 'Ravi Teja',
    rollNumber: '23015A0511',
    department: 'ECE',
    room: '102',
    photoPath: 'photos/23015A0511.jpg',
  },
  {
    name: 'Karthik N',
    rollNumber: '23015A0512',
    department: 'EEE',
    room: '103',
    photoPath: 'photos/23015A0512.jpg',
  }
];

async function seed() {
  try {
    await Student.deleteMany(); // Optional: Clear previous entries
    await Student.insertMany(students);
    console.log('Students seeded successfully!');
  } catch (err) {
    console.error('Error seeding students:', err);
  } finally {
    mongoose.disconnect();
  }
}

seed();

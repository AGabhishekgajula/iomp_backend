const express = require('express');

const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const Invigilator=require("./models/Invigilator");
const Student=require('./models/Student');

const app = express();
const PORT = 5001;
const mongoose = require('mongoose');

mongoose.connect('mongodb://localhost:27017/facerecog', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

module.exports = db;


// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Login Route
app.post('/login',async (req, res) => {
    console.log("login request received");
  const { username, password } = req.body;

  try{
    const invigilator =await Invigilator.findOne({username,password});
    if (invigilator) {
      res.json({ success: true, token: 'mock-token-123' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  }catch(err){
    res.status(500).json({success:false,message:'Database error'});
  }

  
});
app.get('/students', async (req, res) => {
  console.log("students request received");
  const { department, room } = req.query;

  try {
    const students = await Student.find({ department, room });
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Upload setup for face image verification
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/'); // make sure the folder exists
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});

const upload = multer({ storage });

// Face Verification Endpoint (basic placeholder)
app.post('/verify', upload.single('liveImage'), (req, res) => {
  const rollNumber = req.body.rollNumber;
  const imagePath = req.file.path;

  console.log(`Received image for ${rollNumber}: ${imagePath}`);

  // Dummy response (simulate a success match)
  res.json({ success: true, match: true });
});

// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});

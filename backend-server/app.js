const express = require('express');
const { spawn } = require('child_process');
const cors = require('cors');
const bodyParser = require('body-parser');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const mongoose = require('mongoose');
const Invigilator = require('./models/Invigilator');
const Student = require('./models/Student');

const app = express();
const PORT = 5001;

// MongoDB connection
mongoose.connect('mongodb://127.0.0.1:27017/facerecog', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Login Route
app.post('/login', async (req, res) => {
  console.log('Login request received');
  const { username, password } = req.body;

  try {
    const invigilator = await Invigilator.findOne({ username, password });
    if (invigilator) {
      res.json({ success: true, token: 'mock-token-123' });
    } else {
      res.status(401).json({ success: false, message: 'Invalid credentials' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Database error' });
  }
});

// Fetch students
app.get('/students', async (req, res) => {
  console.log('Students request received');
  const { department, room } = req.query;
  console.log(department);
  console.log(department);
  try {
    const students = await Student.find({ department, room });
    res.json(students);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Failed to fetch students' });
  }
});

// Multer configuration for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = 'uploads/';
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath);
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  },
});
const upload = multer({ storage });

// Face verification
// Face verification route
app.post('/verify', upload.single('liveImage'), async (req, res) => {
  console.log("verify request received");
  const rollNumber = req.body.rollNumber;
  console.log('Roll number:', rollNumber);

  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image uploaded' });
  }

  // Use absolute path for the uploaded file
  const imagePath = path.resolve(req.file.path);
  console.log('Image path:', imagePath);

  try {
    // Adjust python command if needed (e.g., 'python3' or full path)
    const pythonScript = spawn('python', ['python-scripts/verify_face.py', imagePath, rollNumber]);

    let scriptOutput = '';
    let errorOutput = '';

    pythonScript.stdout.on('data', (data) => {
      scriptOutput += data.toString();
    });

    pythonScript.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    pythonScript.on('close', async (code) => {
  console.log(`Python script exited with code ${code}`);
  if (code === 0) {
    try {
      // Extract JSON from output by looking for the first '{' and last '}'
      const jsonStart = scriptOutput.indexOf('{');
      const jsonEnd = scriptOutput.lastIndexOf('}');
      if (jsonStart === -1 || jsonEnd === -1) {
        throw new Error('JSON not found in script output');
      }
      const jsonString = scriptOutput.substring(jsonStart, jsonEnd + 1);

      console.log('Extracted JSON:', jsonString);

      const result = JSON.parse(jsonString);

      if (result.success) {
        const updatedStudent = await Student.findOneAndUpdate(
              { rollNumber },
              { isVerified: true },
              { new: true } // Return the updated document
            );
            if (!updatedStudent) {
              console.error('Student not found in MongoDB');
              return res.status(404).json({ success: false, message: 'Student not found in the database' });
            }
        res.json({
          success: true,
          message: 'Face verified successfully!',
          rollNumber: result.roll_number,
          distance: result.distance,
        });
      } else {
        res.json({
          success: false,
          message: 'Face verification failed. Images do not match.',
          distance: result.distance,
        });
      }
    } catch (parseError) {
      console.error('JSON parse error:', parseError);
      console.error('Script Output:', scriptOutput);
      res.status(500).json({ success: false, message: 'Invalid JSON from Python script' });
    }
  } else {
    console.error('Python script error output:', errorOutput);
    res.status(500).json({ success: false, message: 'Error during verification process' });
  }
  });

  } catch (error) {
    console.error('Exception running python script:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});
// Start the server
app.listen(PORT, () => {
  console.log(`✅ Server is running at http://localhost:${PORT}`);
});

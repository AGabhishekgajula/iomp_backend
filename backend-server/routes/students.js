// routes/students.js
const express = require('express');
const router = express.Router();
const multer = require('multer');
const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const Student = require('../models/Student'); // adjust path if needed

// Save uploaded image
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/'); // folder where images will be saved
  },
  filename: function (req, file, cb) {
    const roll = req.params.roll;
    cb(null, `${roll}-live.jpg`);
  },
});
const upload = multer({ storage });

router.post('/verify/:roll', upload.single('liveImage'), async (req, res) => {
  const roll = req.params.roll;
  const uploadedImagePath = req.file.path; // path to saved image

  const formData = new FormData();
  formData.append('rollNumber', roll);
  formData.append('liveImage', fs.createReadStream(uploadedImagePath));

  try {
    const response = await axios.post('http://localhost:5001/verify', formData, {
      headers: formData.getHeaders(),
    });

    const match = response.data.match;

    // Optional: Update DB
    await Student.findOneAndUpdate({ rollNumber: roll }, { isVerified: match });

    res.json({ success: true, verified: match });
  } catch (err) {
    console.error('Verification failed:', err);
    res.status(500).json({ success: false, message: 'Face verification failed' });
  }
});

module.exports = router;

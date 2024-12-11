// const express = require('express');
// const fs = require('fs');
// const multer = require('multer');
// const xlsx = require('xlsx');
// const router = express.Router();

// // File upload setup
// const upload = multer({ dest: 'uploads/' });
// const cors = require('cors');
// app.use(cors());

// // Parse CSV/XLSX files
// router.post('/upload', upload.single('file'), (req, res) => {
//   const filePath = req.file.path;
//   const extension = req.file.originalname.split('.').pop();

//   if (extension === 'csv' || extension === 'xlsx') {
//     const workbook = xlsx.readFile(filePath);
//     const sheet = workbook.Sheets[workbook.SheetNames[0]];
//     const data = xlsx.utils.sheet_to_json(sheet);

//     fs.unlinkSync(filePath); // Clean up uploaded file
//     res.json({ success: true, data });
//   } else {
//     res.status(400).json({ success: false, message: 'Invalid file format' });
//   }
// });

// // Export router
// module.exports = router;

const express = require('express');
const fs = require('fs');
const multer = require('multer');
const xlsx = require('xlsx');
const router = express.Router();

// File upload setup
const upload = multer({ dest: 'uploads/' });

// Parse CSV/XLSX files and handle upload
router.post('/upload', upload.single('file'), (req, res) => {
  const filePath = req.file.path;
  const extension = req.file.originalname.split('.').pop();

  if (extension === 'csv' || extension === 'xlsx') {
    const workbook = xlsx.readFile(filePath);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const data = xlsx.utils.sheet_to_json(sheet);

    // Clean up uploaded file
    fs.unlinkSync(filePath);

    // Send parsed data as response
    res.json({ success: true, data });
  } else {
    res.status(400).json({ success: false, message: 'Invalid file format' });
  }
});

// Export router
module.exports = router;

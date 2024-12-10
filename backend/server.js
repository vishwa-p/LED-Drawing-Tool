const express = require('express');
const path = require('path');

const app = express();

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});

const express = require('express');
const path = require('path');
const cors = require('cors');

// Initialize Express app
const app = express();

// Enable CORS for all origins
app.use(cors());

// Serve static files from the 'uploads' directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import and use routes
const pdfRoutes = require('./routes/pdfRoutes'); // Fix: Added './' to point to the correct relative path
app.use('/api', pdfRoutes); // Attach your routes under the '/api' prefix

// Start the server
app.listen(5000, () => {
  console.log('Server running on http://localhost:5000');
});

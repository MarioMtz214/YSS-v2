// --------------------------backend/server.js--------------------------

const express = require('express');
const cors = require('cors');
require('dotenv').config();
const contactRoute = require('./routes/contact');

const app = express();
const PORT = process.env.PORT || 10000; // Render asigna PORT automáticamente

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API route
app.use('/api/contact', contactRoute);

// Start server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
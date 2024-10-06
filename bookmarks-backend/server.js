const dotenv = require('dotenv');
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./config/db');

// Automatically load environment variables from .env file
dotenv.config(); 


// Initialize Express
const app = express();

// Increase payload size limit (adjust the size as needed)
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Enable CORS
app.use(cors({
  origin: ['http://localhost:3000', 'chrome-extension://your-extension-id'],
  methods: ['GET', 'POST', 'DELETE', 'UPDATE', 'PUT', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token'],
  credentials: true
}));

// Define Routes
app.use('/api/users', require('./routes/users'));
app.use('/api/auth', require('./routes/auth'));
app.use('/api/devices', require('./middleware/auth'), require('./routes/devices'));
app.use('/api/bookmarks', require('./middleware/auth'), require('./routes/bookmarks'));

// Health check route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to the Bookmarks API' });
});

// Check auth route
app.get('/api/check-auth', require('./middleware/auth'), (req, res) => {
  res.json({ msg: 'Token is valid', user: req.user });
});

// Set the server port from .env or default to 5000
const PORT = process.env.PORT || 5000;

// Database connection and server start
sequelize.authenticate()
  .then(() => {
    console.log('Database connected successfully.');
    return sequelize.query('SET FOREIGN_KEY_CHECKS = 0')
      .then(() => sequelize.sync({ alter: true }))
      .then(() => sequelize.query('SET FOREIGN_KEY_CHECKS = 1'));
  })
  .then(() => {
    console.log('Database synchronized.');
    app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });

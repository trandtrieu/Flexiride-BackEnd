const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const serviceRouter = require('./routes/service');

// Kết nối MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/auth', authRoutes);
app.use('/service', serviceRouter);

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

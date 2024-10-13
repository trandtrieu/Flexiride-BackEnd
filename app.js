const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const serviceRouter = require('./routes/service');
const customerRouter = require('./routes/customerRouter')
const bookingCarpoolRouter = require('./routes/bookingCarpool')

// Kết nối MongoDB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
app.use('/auth', authRoutes);
app.use('/service', serviceRouter);
app.use('/customer', customerRouter);
app.use('/booking-carpool', bookingCarpoolRouter);

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

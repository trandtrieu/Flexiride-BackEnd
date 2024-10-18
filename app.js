const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth');
const serviceRouter = require('./routes/service');
const customerRouter = require('./routes/customerRouter')
const driverRouter = require('./routes/driverRouter')
const bookingCarpoolRouter = require('./routes/bookingCarpoolRouter')
const notificationRouter = require('./routes/notificationRouter')

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
app.use('/driver', driverRouter)

app.use('/booking-carpool', bookingCarpoolRouter);
app.use('/notification', notificationRouter);

// Khởi động server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

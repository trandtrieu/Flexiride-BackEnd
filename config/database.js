const mongoose = require('mongoose');

// const connectDB = async () => {
//   try {
//     await mongoose.connect('mongodb://localhost:27017/FlexiRide', {
//       useNewUrlParser: true,
//       useUnifiedTopology: true
//     });
//     console.log('MongoDB connected');
//   } catch (err) {
//     console.error('Error connecting to MongoDB', err);
//     process.exit(1);
//   }
// };

const dotenv = require("dotenv");
dotenv.config();




const connectDB = async () => {
  try {
    await mongoose.connect(`${process.env.MONGO_DB}`, {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });
    console.log('MongoDB connected');
  } catch (err) {
    console.error('Error connecting to MongoDB', err);
    process.exit(1);
  }
};




module.exports = connectDB;

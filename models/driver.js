const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Driver Schema
const DriverSchema = new mongoose.Schema(
  {
    // Thông tin cá nhân
    personalInfo: {
      email: { type: String, required: true, unique: true },
      password: { type: String, required: true },
      firstName: { type: String, default: '' },
      lastName: { type: String, default: '' },
      phoneNumber: { type: String, required: true, unique: true },
      gender: { type: String, default: '' },
      city: { type: String, default: '' },
      serviceType: { type: String, required: true },
      avatar: { type: String, default: 'https://i.pinimg.com/736x/c6/e5/65/c6e56503cfdd87da299f72dc416023d4.jpg' },
      address: {
        streetNumber: { type: String, default: '' },
        ward: { type: String, default: '' },
        district: { type: String, default: '' },
        city: { type: String, default: '' }
      },
      emergencyContact: {
        fullName: { type: String, default: '' },
        relationship: { type: String, default: '' },
        phoneNumber: { type: String, default: '' }
      }
    },
    // Giấy phép các loại
    document: {
      passport: {
        frontImage: { type: String, default: 'https://th.bing.com/th/id/OIP.Ti-x0_GOFLk9GPXPNnpvvgHaE-?rs=1&pid=ImgDetMain' },
        backImage: { type: String, default: 'https://th.bing.com/th/id/OIP.Ti-x0_GOFLk9GPXPNnpvvgHaE-?rs=1&pid=ImgDetMain' },
        issueDate: { type: Date, default: '' },
        issuePlace: { type: Date, default: '' }
      },
      driverLicense: {
        frontImage: { type: String, default: 'https://quocluat.vn/photos/dichvu_post/bang-lai-xe.jpg?1499764192960' },
        backImage: { type: String, default: 'https://quocluat.vn/photos/dichvu_post/bang-lai-xe.jpg?1499764192960' }
      },
      criminalRecord: {
        frontImage: { type: String, default: 'https://th.bing.com/th/id/OIP.7CQf1anU5npgsgL_iSRIlAHaKe?rs=1&pid=ImgDetMain' },
        backImage: { type: String, default: 'https://th.bing.com/th/id/OIP.7CQf1anU5npgsgL_iSRIlAHaKe?rs=1&pid=ImgDetMain' },
        issueDate: { type: Date, default: '' }
      },
      vehicleRegistration: {
        frontImage: { type: String, default: 'https://th.bing.com/th/id/OIP.pbaJfWMkMcBrAWtSA4kL2wHaFj?rs=1&pid=ImgDetMain' },
        backImage: { type: String, default: 'https://th.bing.com/th/id/OIP.pbaJfWMkMcBrAWtSA4kL2wHaFj?rs=1&pid=ImgDetMain' },
        licensePlate: { type: Date, default: '' },
        fuelType: { type: Date, default: '' }
      },
      vehicleInsurance: {
        frontImage: { type: String, default: 'https://hillspangroup.com/wp-content/uploads/2023/03/Motor-Insurance_.png' },
        backImage: { type: String, default: 'https://hillspangroup.com/wp-content/uploads/2023/03/Motor-Insurance_.png' }
      }
    },
    // Hình phương tiện
    vehicleImages: {
      frontImage: { type: String, default: 'https://i.pinimg.com/736x/88/47/a5/8847a51f3a64571bb637b9c44dd0cb23.jpg' },
      backImage: { type: String, default: 'https://i.pinimg.com/736x/88/47/a5/8847a51f3a64571bb637b9c44dd0cb23.jpg' }
    },
    // Thông tin tài khoản
    bankAccount: {
      accountHolderName: { type: String, default: '' },
      accountNumber: { type: String, default: '' },
      bankName: { type: String, default: '' }
    },
    // Role
    role: {
      type: String,
      default: '1',
      enum: ['1', '2', '3']  // Corrected enum values to represent possible roles
    }
  },
  {
    timestamps: true
  }
);

// Hash password before saving to database
DriverSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Check if password is valid
DriverSchema.methods.isValidPassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model('Driver', DriverSchema);
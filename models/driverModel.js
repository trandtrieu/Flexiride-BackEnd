const mongoose = require('mongoose')
const driverSchema = new mongoose.Schema(
    {
        // Thông tin cá nhân
        personalInfo: {
            email: { type: String },
            firstName: { type: String },
            lastName: { type: String },
            phoneNumber: { type: String },
            gender: { type: String },
            city: { type: String },
            serviceType: { type: String },
            avatar: { type: String },
            address: {
                streetNumber: String,
                ward: String,
                district: String,
                city: String
            },
            emergencyContact: {
                fullName: String,
                relationship: String,
                phoneNumber: String,
            }
        },
        // Giấy phép các loại
        document: {
            passport: {
                frontImage: String,
                backImage: String,
                issueDate: Date,
                issuePlace: String,
            },
            driverLicense: {
                frontImage: String,
                backImage: String,
            },
            criminalRecord: {
                frontImage: String,
                backImage: String,
                issueDate: Date,
            },
            vehicleRegistration: {
                frontImage: String,
                backImage: String,
                licensePlate: String,
                fuelType: String,
            },
            vehicleInsurance: {
                frontImage: String,
                backImage: String,
            }
        },
        // Hình phương tiện
        vehicleImages: {
            frontImage: String,
            backImage: String,
        },
        // Thông tin tài khoản
        bankAccount: {
            accountHolderName: String,
            accountNumber: String,
            bankName: String,
        }
    },
    {
        timestamps: true
    }
);

const Driver = mongoose.model("Driver", driverSchema);
module.exports = Driver;
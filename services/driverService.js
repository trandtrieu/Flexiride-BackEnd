const Driver = require('../models/driverModel');

const createDriver = async (driverData) => {
    try {
        const driver = new Driver(driverData);
        // console.log("data2", driver)
        await driver.save();
        return driver;
    } catch (error) {
        throw error;
    }
};

module.exports = {
    createDriver
}
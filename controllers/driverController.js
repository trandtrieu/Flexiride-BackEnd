const driverService = require("../services/driverService")

const registerDriver = async (req, res) => {
    try {
        const result = await driverService.createDriver(req.body);
        // console.log("data1", result);
        res.status(201).json({ message: "Driver registered successfully", data: result });
    } catch (error) {
        res.status(500).json({ message: "Error registering driver", error: error.message });
    }
};

module.exports = {
    registerDriver
}
require('dotenv').config();

const drivers = [
    { id: 1, name: 'Driver 1', latitude: 16.047079, longitude: 108.206230, is_available: true },
    { id: 2, name: 'Driver 2', latitude: 16.048079, longitude: 108.206130, is_available: true },
    { id: 3, name: 'Driver 3', latitude: 16.049079, longitude: 108.206330, is_available: false },
    { id: 4, name: 'Driver 4', latitude: 16.047179, longitude: 108.207230, is_available: true },
    { id: 5, name: 'Driver 5', latitude: 16.050079, longitude: 108.205230, is_available: true },
];


const haversineDistance = (coords1, coords2) => {
    function toRad(x) {
        return x * Math.PI / 180;
    }

    const R = 6371; 
    const dLat = toRad(coords2.latitude - coords1.latitude);
    const dLon = toRad(coords2.longitude - coords1.longitude);
    const lat1 = toRad(coords1.latitude);
    const lat2 = toRad(coords2.latitude);

    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.sin(dLon / 2) * Math.sin(dLon / 2) * Math.cos(lat1) * Math.cos(lat2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
};

// API tìm tài xế gần nhất
exports.findDriver = (req, res) => {
    const { latitude, longitude } = req.body;

    if (latitude == null || longitude == null) {
        return res.status(400).json({ error: 'Vị trí không hợp lệ' });
    }

    const userLocation = { latitude, longitude };

    const availableDrivers = drivers.filter(driver => driver.is_available);

    const driversWithDistance = availableDrivers.map(driver => {
        const distance = haversineDistance(userLocation, {
            latitude: driver.latitude,
            longitude: driver.longitude
        });
        return { ...driver, distance: distance.toFixed(2) }; 
    });

    driversWithDistance.sort((a, b) => a.distance - b.distance);

    res.json(driversWithDistance.slice(0, 5));
};

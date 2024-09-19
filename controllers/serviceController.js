const jwt = require('jsonwebtoken');

const generateRandomCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Đăng ký
exports.sendCode = async (req, res) => {
    const { body, phone } = req.body;

    try {
        const accountSid = 'AC7b772193fccdae5080e9f8eccd84ef18';
        const authToken = 'fa7ba7e1dd6d3dc3f54461f3b0118cd3';
        const client = require('twilio')(accountSid, authToken);
        client.messages
            .create({
                body: body,
                from: '+14028502478',
                to: phone
            })
            .then(message => console.log(message.sid));
        res.status(200).json({ message: 'Code sended!' });
    } catch (err) {
        res.status(500).json({ message: err });
    }
};


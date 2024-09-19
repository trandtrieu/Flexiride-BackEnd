require('dotenv').config();
const jwt = require('jsonwebtoken');

const generateRandomCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

// Đăng ký
exports.sendCode = async (req, res) => {
    const { body, phone } = req.body;

    try {
        const accountSid = process.env.ACCOUNTSID; 
        const authToken = process.env.AUTH_TOKEN; 
        const client = require('twilio')(accountSid, authToken);
        client.messages
            .create({
                body: body,
                from: '+18152051461',
                to: phone
            })
            .then(message => console.log(message.sid));
        res.status(200).json({ message: 'Code sended!' });
    } catch (err) {
        res.status(500).json({ message: err });
    }
};


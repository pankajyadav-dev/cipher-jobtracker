require('dotenv').config();
const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key';

const generateToken = ({_id , type}) => {
    const token = jwt.sign(
        { _id, type },
        JWT_SECRET,
        { expiresIn: '1h' } 
    );
    return token;
}

const verifyToken = (token) => {
    try {
        const decoded = jwt.verify(token, JWT_SECRET);
        return {status: true , decoded};
    } catch (error) {
        return {status: false , error: error.message};
    }
}

module.exports = {
    generateToken,
    verifyToken
};
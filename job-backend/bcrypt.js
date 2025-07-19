require('dotenv').config();
const bcrypt = require('bcrypt');

const encryptPassword = async (plainTextPassword) => {
    try {
        const saltRounds = parseInt(process.env.BCRYPT_SALT_ROUNDS) || 12;
        const hashedPassword = await bcrypt.hash(plainTextPassword, saltRounds);
        return hashedPassword;
    } catch (error) {
        throw error;
    }
}

const checkPasswords = async (plainTextPassword, hashedPassword) => {
    try {
        const isMatch = await bcrypt.compare(plainTextPassword, hashedPassword);
        return isMatch;
    } catch (error) {
        throw error;
    }
}

module.exports = {
    encryptPassword,
    checkPasswords
};

const { model, Schema } = require('mongoose');
const { isEmail } = require('validator');
const { encryptPassword, checkPasswords } = require('../bcrypt');
const { generateToken } = require('../jwt');

const UserSchema = new Schema({
    firstname: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    lastname: {
        type: String,
        required: true,
        trim: true,
        minlength: 3
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
        unique: true,
        validate: {
            validator(email) {
                return isEmail(email);
            }
        }
    },
    password: {
        type: String,
        required: true,
        trim: true,
        minlength: 6,
        validate: {
            validator(password) {
                if (password.includes(' ') || password.includes('\t') || password.includes('\n')) {
                    throw new Error('Password cannot contain spaces or tabs');
                };
                if (password.toLowerCase() === password || password.toUpperCase() === password) {
                    throw new Error('Password must contain both uppercase and lowercase letters');
                }
                return true;
            }
        }
    },
    type: {
        type: String,
        enum: ['USER', 'ADMIN'],
        default: 'USER',
    },

    tokens: {
        type: [{ token: String }],
        default: []
    }
}, { timestamps: true });



UserSchema.pre('save', async function (next) {
    if (this.modifiedPaths().includes('password')) {
        this.password = await encryptPassword(this.password);
    }
    next();
});


UserSchema.statics.findByEmailAndPasswordForAuth = async function (email, password) {
    try {
        const user = await this.findOne({ email });
        if (!user) {
            throw new Error('Invalid email or password');
        }
        const encryptPassword = user.password;
        const isMatch = await checkPasswords(password, encryptPassword);
        if (!isMatch) {
            throw new Error('Invalid email or password');
        }
        return user;
    } catch (error) {
        throw error;
    }
};


UserSchema.methods.generateToken = async function () {
    try {
        const user = this;
        const token = generateToken(user);
        user.tokens.push({ token });
        await user.save();
        return token;
    } catch (error) {
        throw error;
    }
};

UserSchema.methods.toJSON = function () {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    return userObject;
};


const User = model('User', UserSchema);
module.exports = User;
const { model, Schema} = require('mongoose');
const { isEmail } = require('validator');
const {encryptPassword, checkPasswords} = require('../bcrypt');
const {generateToken} = require('../jwt');

const UserSchema = new Schema({
    firstname: {
        type: String,
        required: true,
        trim: true,
        minlength: 3},
    lastname: {
        type: String,
        required: true,
        trim: true,
        minlength: 3},
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
                if(password.includes(' ') || password.includes('\t') || password.includes('\n')) {
                    throw new Error('Password cannot contain spaces or tabs');
                };
                if(password.toLowerCase() === password || password.toUpperCase() === password) {
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
    phone: {
        type: String,
        trim: true,
        maxlength: 15
    },
    location: {
        type: String,
        trim: true,
        maxlength: 100
    },
    bio: {
        type: String,
        trim: true,
        maxlength: 500
    },
    skills: [{
        type: String,
        trim: true,
        maxlength: 50
    }],
    experience: [{
        company: {
            type: String,
            trim: true,
            maxlength: 100
        },
        position: {
            type: String,
            trim: true,
            maxlength: 100
        },
        startDate: Date,
        endDate: Date,
        current: {
            type: Boolean,
            default: false
        },
        description: {
            type: String,
            trim: true,
            maxlength: 1000
        }
    }],
    education: [{
        institution: {
            type: String,
            trim: true,
            maxlength: 100
        },
        degree: {
            type: String,
            trim: true,
            maxlength: 100
        },
        field: {
            type: String,
            trim: true,
            maxlength: 100
        },
        startDate: Date,
        endDate: Date,
        current: {
            type: Boolean,
            default: false
        },
        gpa: {
            type: Number,
            min: 0,
            max: 4
        }
    }],
    profilePicture: {
        type: String,
        trim: true
    },
    resume: {
        name: {
            type: String,
            trim: true
        },
        data: {
            type: String
        },
        contentType: {
            type: String,
            trim: true
        },
        size: {
            type: Number
        },
        uploadedAt: {
            type: Date,
            default: Date.now
        }
    },
    savedSearches: [{
        name: {
            type: String,
            required: true,
            trim: true,
            maxlength: 100
        },
        query: {
            type: Object,
            required: true
        },
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    tokens: {
        type: [{ token: String }],
        default: []
    }
}, { timestamps: true });



UserSchema.pre('save', async function(next) {
    if(this.modifiedPaths().includes('password')) {
        this.password = await encryptPassword(this.password);
    }
    next();
});


UserSchema.statics.findByEmailAndPasswordForAuth = async function(email, password) {
    try {
        const user = await this.findOne({ email });
        if(!user) {
            throw new Error('Invalid email or password');
        }
        const encryptPassword = user.password;
        const isMatch = await checkPasswords(password, encryptPassword);
        if(!isMatch) {
            throw new Error('Invalid email or password');
        }
        return user;
    } catch (error) { 
        throw error;
    }
};


UserSchema.methods.generateToken = async function() {
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

UserSchema.methods.toJSON = function() {
    const user = this;
    const userObject = user.toObject();
    delete userObject.password;
    delete userObject.tokens;
    return userObject;
};


const User = model('User', UserSchema);
module.exports = User;
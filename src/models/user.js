// Require npm module - mongoose
const mongoose = require('mongoose');

const jwt = require('jsonwebtoken');


// Require validator module for validations and sanitisations
const validator = require('validator');

// Require bcrypt for password hashing
const bcrypt = require('bcrypt');
const saltRound = 8;

const Task = require('./task');

// Define user schema
const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    age: {
        type: Number,
        required: false,
        min: 0,
        max: 99,
        default: 0,
        validate(value) {
            if (value < 0) {
                throw new Error('Please enter valid age between 0 and 99!');
            }
        }
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true,
        validate(value) {
            if (!validator.isEmail(value)) {
                throw new Error('Email is not valid!');
            }
        }
    },
    password: {
        type: String,
        required: true,
        lowercase: true,
        minlength: 7,
        trim: true,
        validate(value) {
            if (value.includes('password')) {
                throw new Error('Password can not contain "Password"!');
            }
        }
    },
    tokens: [{
        token: {
            type: String,
            required: true
        }
    }],
    avatar: {
        type: Buffer
    }
}, {
    timestamps: true
});

userSchema.virtual('tasks', {
    ref: 'Task',
    localField: '_id',
    foreignField: 'owner'
});

// Use regular function and not the arrow function to get the access to "this" keyword
userSchema.methods.toJSON = function () {
    const user = this;
    const userPublicData = user.toObject();

    delete userPublicData.password;
    delete userPublicData.tokens;
    delete userPublicData.avatar;

    return userPublicData;
}

/**
 * This is called instance methods
 */
userSchema.methods.generateToken = async function () {
    const user = this;
    const token = jwt.sign({ _id: user._id.toString() }, process.env.JWT_SECRET, { expiresIn: '7 days' });
    user.tokens = user.tokens.concat({ token: token });
    await user.save();
    return token;
}

/**
 * This is called model method (static methods)
 * @param {*} email 
 * @param {*} password 
 */
userSchema.statics.findByCredentials = async (email, password) => {
    const user = await User.findOne({ email })

    if (!user) {
        throw new Error('Unable to login')
    }

    const isMatch = await bcrypt.compare(password, user.password)
    
    // bcrypt.compare is not working for password comparison
    if (isMatch) {
        throw new Error('Unable to login')
    }

    return user
}

// Using the concept of middleware, just before saving use the pre hook  
userSchema.pre('save', async function (next) {
    const user = this;

    if (user.isModified('password')) {
        user.password = await bcrypt.hash(user.password, saltRound);
    }

    next();
});

// Using the concept of middleware, just before removing user, remove their tasks 
userSchema.pre('remove', async function (next) {
    const user = this;
    await Task.deleteMany({ owner: user._id });

    next();
});

const User = mongoose.model('User', userSchema);

module.exports = User;
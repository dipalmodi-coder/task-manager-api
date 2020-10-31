const express = require('express');
const User = require('../models/user');
const mongoose = require('mongoose');
const sharp = require('sharp');
const emails = require('../emails/account');

// Middlewares
const auth = require('../middleware/auth');
const uploadAvatar = require('../middleware/avatar');

const router = new express.Router();

router.post("/users", async (req, res) => {
    const user1 = new User(req.body);
    try {
        const user = await user1.save();

        // Send welcome email
        emails.sendWelcomeEmail(user);

        // Generate token when a new user is created/sign up
        const token = await user.generateToken();

        res.status(201).send({user: user, token: token});
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Find by credentials to login
router.post('/users/login', async (req, res) => {
    try {
        const user = await User.findByCredentials(req.body.email, req.body.password);

        // Generate a JWT token, saves to user document and send it to response.
        const token = await user.generateToken();

        res.status(200).send({user: user, token: token});
    } catch(error) {
        res.status(400).send(error.message);
    }
});

// Route to logout
// We already have user in the request
router.post('/users/logout', auth, async (req, res) => {
    try {
        req.user.tokens = req.user.tokens.filter((token) => {
            if (req.token !== token.token) {
                return true;
            }
        })
        await req.user.save();

        res.status(200).send();
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Route to logout of all the sessions
// We already have user in the request
router.post('/users/logoutall', auth, async (req, res) => {
    try {
        req.user.tokens = [];
        await req.user.save();

        res.status(200).send();
    } catch (error) {
        res.status(500).send(error.message);
    }
})

// Get my profile when I am logged in
// 2nd argument auth is the express middleware
router.get('/users/me', auth, async (req, res) => {
    try {
        await req.user.populate('tasks').execPopulate();

        res.status(200).send({
            user: req.user,
            tasks: req.user.tasks
        });
    } catch (error) {
        res.status(401).send(error.message);
    }
});

// Find user by id
router.get('/users/:id', auth, async (req, res) => {
    const _id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(_id)) {
        res.status(404).send('User not found!');
        return;
    }

    try {
        const user = await User.findById(_id);

        if (!user) {
            res.status(404).send('User not found!');
        }
        res.status(200).send(user);
    } catch (error) {
        res.status(500).send(error.message);
    }
});

// Update a user
router.patch('/users/me', auth, async (req, res) => {
    // Check if valid properties are passed in the req body
    const allowedProperties = ['name', 'password', 'email', 'age'];
    const propertiesPassed = Object.keys(req.body);

    const isValidUpdate = propertiesPassed.every((property) => {
        return allowedProperties.includes(property);
    });

    if (!isValidUpdate) {
        // return is important here, since res.send does not stop program execution
        return res.status(400).send('Please check properties to update!');
    }

    try {
        propertiesPassed.forEach((property) => {
            req.user[property] = req.body[property]
        });

        await req.user.save()
        res.status(200).send(req.user);
    } catch (error) {
        res.status(400).send(error.message);
    }
});

// Delete user
router.delete('/users/me', auth, async (req, res) => {
    try {
        await req.user.remove();

        // Send cancellation email
        emails.sendCancellationEmail(req.user);

        res.status(200).send(req.user);
    } catch (error) {
        res.status(500).send({
            error: error.message
        });
    }
});

// Upload a new avatar
router.post('/users/me/avatar', auth, uploadAvatar.single('avatar'), async (req, res) => {
    const avatarBuffer = await sharp(req.file.buffer).resize({ width: 250, height: 250}).png().toBuffer();

    req.user.avatar = avatarBuffer;
    await req.user.save();
    res.status(200).send();
}, (error, req, res, next) => {
    res.status(400).send({
        error: error.message
    })
});

// Delete avatar
router.delete('/users/me/avatar', auth, async (req, res) => {
    req.user.avatar = undefined
    await req.user.save()
    res.send()
})

// Get avatar url for a given user 
router.get('/users/:id/avatar', async (req, res) => {
    try {
        const _id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(_id)) {
            res.status(404).send('User not found!');
            return;
        }

        const user = await User.findById(_id);
        
        if (!user || !user.avatar) {
            throw new Error('User avatar is not defined!');
        }
        
        res.set('Content-Type', 'image/png');
        res.status(200).send(user.avatar);
    } catch(error) {
        res.status(404).send({
            error: error.message
        })
    }
})


module.exports = router
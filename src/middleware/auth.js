// Express middleware/interceptors to do something before a route is called
// In this app authorisation token is passed as bearer token from postman/request

const User = require('../models/user');
const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        const token = req.headers.authorization.replace('Bearer ', '');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        const user = await User.findOne({_id: decoded._id, 'tokens.token': token});

        if (!user) {
            throw new Error();
        }
        
        req.token = token;
        req.user = user;

        next();
    } catch(error) {
        res.status(401).send('User not authenticated!');
    }
}

module.exports = auth
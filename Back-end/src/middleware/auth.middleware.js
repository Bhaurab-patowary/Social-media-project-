const jwt = require('jsonwebtoken');
const tokenBlacklistModel = require('../models/blacklist.model');

async function authUser(req, res, next) {
    try {
        const token = req.cookies?.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            return res.status(401).json({ message: 'Unauthorized: No token provided' });
        }

        const isBlacklisted = await tokenBlacklistModel.findOne({ token });
        if (isBlacklisted) {
            return res.status(401).json({ message: 'Unauthorized: Token is blacklisted' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        return next();
    } catch (error) {
        return res.status(401).json({ message: 'Unauthorized: Invalid token', error: error.message });
    }
}

module.exports = { authUser };

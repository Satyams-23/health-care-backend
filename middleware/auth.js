const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');//

const User = require('../model/user');

const isAuthentication = async (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({ message: 'Authorization denied' });
    }
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decoded.id);


        next();
    } catch (error) {
        return res.status(401).json({ message: 'Invalid token' });
    }
}

const deleteUnverifiedUsers = async (req, res) => {

    try {

        // Calculate the timestamp 1 hour ago
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        // Find unverified users created more than 1 hour ago
        const unverifiedUsers = await User.find({ isVerified: false, date: { $lt: oneHourAgo } });

        // Delete unverified users
        await Promise.all(unverifiedUsers.map(user => user.deleteOne()));// mean 

        console.log('Unverified users deleted:', unverifiedUsers.length);
    } catch (error) {
        console.error('Error deleting unverified users:', error);
    }

    next();
};

module.exports = { isAuthentication, deleteUnverifiedUsers };




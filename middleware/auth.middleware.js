const jwt = require("jsonwebtoken");
const asyncHandler = require("../utils/asyncHandler");
const User = require("../models/user.model");
const ApiError = require("../utils/ApiError");
require("dotenv").config();


const isAuthentication = asyncHandler(async (req, res, next) => {
    try {
        const token = req.cookies?.refreshToken || req.header("Authorization")?.replace("Bearer ", "");

        // console.log(token);
        if (!token) {
            throw new ApiError(401, "Unauthorized request")
        }
        // console.log(process.env.JWT_SECRET);


        const decodedToken = jwt.verify(token, process.env.JWT_SECRET)

        // console.log("decodedToken", decodedToken);
        const user = await User.findById(decodedToken?._id).select("-password ")
        // console.log("user", user);

        // console.log("User", user);
        if (!user) {

            throw new ApiError(401, "Invalid Access Token")
        }

        req.user = user;
        next()

    } catch (error) {
        console.error(error);
        throw new ApiError(401, "Invalid Access Token")

    }
});

const deleteUnverifiedUsers = async (req, res, next) => {

    try {

        // Calculate the timestamp 1 hour ago
        const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

        // Find unverified users created more than 1 hour ago
        const unverifiedUsers = await User.find({ isVerified: false, created_at: { $lt: oneHourAgo } });

        // Delete unverified users
        await Promise.all(unverifiedUsers.map(user => user.deleteOne()));// mean 
        console.log('Unverified users deleted:', unverifiedUsers.length);

    } catch (error) {
        console.error('Error deleting unverified users:', error);
    }

    next();
};

module.exports = { isAuthentication, deleteUnverifiedUsers };




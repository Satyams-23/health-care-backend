const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');
const sendEmail = require('../utils/sendEmail');
const generateOTP = require('../utils/generateOTP');
const asyncHandler = require('../utils/asyncHandler');
const ApiError = require('../utils/ApiError');
const ApiResponse = require('../utils/ApiResponse');


const generateAccessAndRefreshTokens = async (userId) => {

    console.log("userId", userId);

    try {
        const user = await User.findById(userId)
        console.log("user", user);

        if (!user) {

            throw new ApiError(404, "User not found")
        }

        const accessToken = jwt.sign(
            {
                _id: user._id,
                email: user.email,
                username: user.username,
            },
            process.env.JWT_SECRET,

            {
                expiresIn: "1h",
            }
        )

        const refreshToken = jwt.sign(
            {
                _id: user._id,
            },
            process.env.JWT_SECRET,
            {
                expiresIn: "7d",
            }

        )



        user.refreshToken = refreshToken
        await user.save({ validateBeforeSave: false })

        return { accessToken, refreshToken }


    } catch (error) {
        throw new ApiError(500, "Something went wrong while generating refresh and access token")
    }
}

// Register
const signup = asyncHandler(async (req, res) => {
    const data = req.body;

    const existingUser = await User.findOne({ email: data.email, isVerified: true });
    if (existingUser) {
        throw new ApiError(400, 'User already exists');
    }

    const hashedPassword = await bcrypt.hash(data.password, 10);

    const OTP = await generateOTP();
    const OTPExpire = new Date(Date.now() + 120000); // 2 minutes

    const newUser = new User({
        username: data.username,
        email: data.email,
        password: hashedPassword,
        otp: OTP,
        otp_expire: OTPExpire
    });

    await newUser.save();

    await sendEmail(data.email, 'Verify your email', `Your OTP is ${OTP}`);

    res.json(new ApiResponse('OTP sent for verification', { otp: OTP }));
});

// Verify signup
const signupverify = asyncHandler(async (req, res) => {
    const data = req.body;

    const user = await User.findOne({ email: data.email }).sort({ created_at: -1 }).limit(1);
    if (!user) {
        throw new ApiError(400, 'User not found');
    }

    if (user.otp !== data.otp || user.otp_expire < Date.now()) {
        throw new ApiError(400, 'Invalid OTP or Unmatched OTP');
    }

    user.isVerified = true;
    user.otp = undefined;
    user.otp_expire = undefined;
    await user.save();

    const createdUser = await User.findById(user._id).select(
        "-password -refreshToken"
    )

    if (!createdUser) {
        throw new ApiError(500, "Something went wrong while registering the user")
    }

    return res.status(200).json(new ApiResponse(200, createdUser, "User Verified Successfully")

    )
});

// Login
const login = asyncHandler(async (req, res) => {
    const data = req.body;

    const user = await User.findOne({ email: data.email, isVerified: true });
    if (!user) {
        throw new ApiError(400, 'User not found');
    }

    const isMatch = await bcrypt.compare(data.password, user.password);
    if (!isMatch) {
        throw new ApiError(400, 'Invalid password');
    }

    const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(user.id)

    const loggedInUser = await User.findById(user.id).select('-password -otp -otp_expire -refreshToken');

    const options = {
        httpOnly: true,
        secure: true
    }

    return res.status(200).cookie("accessToken", accessToken, options)
        .cookie("refreshToken", refreshToken, options)
        .json(new ApiResponse(200,
            {
                user: loggedInUser, refreshToken, accessToken

            },

            "User Logged In Sccussfully"

        )
        )


});


// Logout
const logout = asyncHandler(async (req, res) => {
    const user = req.user;

    {
        $unset: {
            refreshToken: 1// remove the refresh token from the user
        }

    }

    await user.save({ validateBeforeSave: false });


    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json(new ApiResponse(200, {}, "User Logged Out Successfully")

    )


});

// Resend OTP
const signupresendotp = asyncHandler(async (req, res) => {
    const data = req.body;

    const user = await User.findOne({ email: data.email }).sort({ created_at: -1 }).limit(1);
    if (!user) {
        throw new ApiError(400, 'User not found');
    }

    if (user.otp_expire > Date.now()) {
        throw new ApiError(400, 'OTP is still valid');
    }

    const OTP = await generateOTP();
    const OTPExpire = new Date(Date.now() + 120000); // 2 minutes

    user.otp = OTP;
    user.otp_expire = OTPExpire;
    await user.save();

    await sendEmail(data.email, 'Verify your email', `Your OTP is ${OTP}`);

    res.json(new ApiResponse('OTP sent for verification', { otp: OTP }));
});

// Forgot Password
const forgotpassword = asyncHandler(async (req, res) => {
    const { email } = req.body;
    const existingUser = await User.findOne({ email, isVerified: true });
    if (!existingUser) {
        throw new ApiError(400, 'User not found');
    }

    const OTP = await generateOTP();
    const OTPExpire = new Date(Date.now() + 120000); // 2 minutes

    existingUser.otp = OTP;
    existingUser.otp_expire = OTPExpire;
    await existingUser.save();

    await sendEmail(email, 'OTP for password reset', `Your OTP is ${OTP}`);

    res.json(new ApiResponse('OTP sent for password reset', { otp: OTP }));
});

// Reset Password
const resetpassword = asyncHandler(async (req, res) => {
    const { email, otp, password, confirmpassword } = req.body;

    const existing = await User.findOne({ email, otp, isVerified: true });
    if (!existing) {
        throw new ApiError(400, 'Invalid OTP');
    }

    if (existing.otp_expire < Date.now()) {
        throw new ApiError(400, 'OTP expired');
    }

    if (password !== confirmpassword) {
        throw new ApiError(400, 'Password mismatch');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    existing.password = hashedPassword;
    existing.otp = undefined;
    existing.otp_expire = undefined;
    await existing.save();

    return res.status(200).json(new ApiResponse(200, {}, "Password reset successfully"));
}
);

// Google Login
const googleLogin = asyncHandler(async (req, res) => {
    res.json(new ApiResponse('Google login'));
});

// Facebook Login
const facebookLogin = asyncHandler(async (req, res) => {
    res.json(new ApiResponse('Facebook login'));
});

const userProfile = asyncHandler(async (req, res) => {
    const user = req.user;

    const data = user.toObject();

    delete data.password;
    delete data.otp;
    delete data.otp_expire;
    delete data.refreshToken;
    delete data.isVerified;
    delete data.created_at;
    delete data.updated_at;

    return res.status(200).json(new ApiResponse(200, data, "User Profile Fetched Successfully"))

});

const updateUserProfile = asyncHandler(async (req, res) => {
    try {
        const user = req.user;
        const data = req.body;

        if (data.password) {
            data.password = await bcrypt.hash(data.password, 10);//
        }

        if (data.email) {
            const existingUser = await User.findOne({ email: data.email, isVerified: true });
            if (existingUser && existingUser._id.toString() !== user._id.toString()) {
                throw new ApiError(400, 'Email already exists');
            }
        }

        if (data.username) {
            const existingUser = await User.findOne({ username: data.username });
            if (existingUser && existingUser._id.toString() !== user._id.toString()) {
                throw new ApiError(400, 'Username already exists');
            }
        }





        Object.assign(user, data);
        await user.save();

        res.json(new ApiResponse('User profile updated successfully', user));
    }

    catch (error) {
        console.error(error);
        throw new ApiError(400, 'Error updating user profile');
    }
}
);

module.exports = { signup, signupverify, login, logout, googleLogin, facebookLogin, signupresendotp, forgotpassword, resetpassword, userProfile, updateUserProfile };

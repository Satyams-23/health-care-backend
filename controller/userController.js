const User = require('../model/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');//
const sendEmail = require('../utils/sendEmail');
const generateOTP = require('../utils/generateOTP');

// Register
const signup = async (req, res) => {
    const data = req.body;

    const errors = validationResult(req);// 
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const user = await User.findOne({ email: data.email, isVerified: true });
        if (user) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const hashedPassword = await bcrypt.hash(data.password, 10);

        const OTP = await generateOTP();
        const OTPExpire = new Date(Date.now() + 120000);// 2 minutes

        const newUser = new User({
            username: data.username,
            email: data.email,
            password: hashedPassword,
            // role: data.role,
            otp: OTP,
            otp_expire: OTPExpire
        });

        await newUser.save();

        await sendEmail(data.email, 'Verify your email', `Your OTP is ${OTP}`);


        res.json({ message: 'OTP sent for verification', otp: otp });

    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }



}

const signupverify = async (req, res) => {
    const data = req.body;
    const errors = validationResult(req);//

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (user.otp !== data.otp) {
            return res.status(400).json({ message: 'Invalid OTP' });
        }

        if (user.otp_expire < Date.now()) {
            return res.status(400).json({ message: 'OTP expired' });
        }

        user.isVerified = true;
        // Remove OTP and expiration fields
        data.otp = undefined;
        data.otpExpires = undefined;
        await user.save();

        return res.status(200).json({ message: 'User verified successfully' });

    }

    catch (error) {
        return res.status(500).json({ message: error.message });
    }

}

const login = async (req, res) => {

    const data = req.body;

    const errors = validationResult(req);//

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findOne({ email: data.email, isVerified: true });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        const isPasswordValid = await bcrypt.compare(data.password, user.password);

        if (!isPasswordValid) {
            return res.status(400).json({ message: 'Invalid password' });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });

        user.token = token;
        await user.save();

        return res.status(200).json({ message: 'User logged in successfully', token });

    }

    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const logout = async (req, res) => {
    const data = req.body;

    const errors = validationResult(req);//

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findOne({ email: data.email });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        user.token = '';
        await user.save();

        return res.status(200).json({ message: 'User logged out successfully' });

    }

    catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const signupresendotp = async (req, res) => {

    const data = req.body;

    const errors = validationResult(req);//

    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    try {
        const user = await User.findOne({ email: data.email });

        if (!user) {
            return res.status(400).json({ message: 'User not found' });
        }

        if (user.isVerified) {
            return res.status(400).json({ message: 'User already verified' });
        }

        if (user.otp_expire > Date.now()) {
            return res.status(400).json({ message: 'OTP is still valid' });
        }

        const OTP = await generateOTP();
        const OTPExpire = new Date(Date.now() + 120000);// 2 minutes

        user.otp = OTP;
        user.otp_expire = OTPExpire;
        await user.save();

        await sendEmail(data.email, 'Verify your email', `Your OTP is ${OTP}`);

        return res.status(200).json({ message: 'OTP sent for verification', otp: otp });

    }

    catch (error) {
        return res.status(500).json({ message: error.message });
    }

}

const googleLogin = async (req, res) => {

    res.json({ message: 'Google login' });
}

const facebookLogin = async (req, res) => {

    res.json({ message: 'Facebook login' });
}



module.exports = { signup, signupverify, login, logout, googleLogin, facebookLogin };//








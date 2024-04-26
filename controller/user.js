const User = require('../models/user');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { validationResult } = require('express-validator');//

// Register
const signup = async (res, req) => {
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
        return res.status(200).json({ message: 'User registered successfully' });

    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }



}

const signupverify = async (res, req) => {
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
        await user.save();

        return res.status(200).json({ message: 'User verified successfully' });

    }

    catch (error) {
        return res.status(500).json({ message: error.message });
    }

}

const login = async (res, req) => {

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

const logout = async (res, req) => {
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








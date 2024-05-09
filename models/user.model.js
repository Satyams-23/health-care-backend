const mongoose = require('mongoose')
const { Schema } = mongoose

const userSchema = new Schema({
    username: {
        type: String,
    }
    ,
    password: {
        type: String,
    },
    email: {
        type: String,
    },
    role: {
        type: String,

    },
    created_at: {
        type: Date,
        default: Date.now
    },
    updated_at: {
        type: Date,
        default: Date.now
    }
    ,

    phoneNumber: {
        type: String
    },

    otp: {

        type: String

    },
    otp_expire: {
        type: Date
    }
    ,

    isVerified: {
        type: Boolean,
        default: false
    },
    googleId: {
        type: String
    },
    facebookId: {
        type: String
    },
    confirmpassword: {
        type: String
    }
    ,
    refreshToken: {
        type: String
    }





})





module.exports = mongoose.model('User', userSchema)



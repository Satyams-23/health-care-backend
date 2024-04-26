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
    , otp: {

        type: String

    },
    otp_expire: {
        type: Date
    }
    ,
    token: {
        type: String
    },
    isVerified: {
        type: Boolean,
        default: false
    }

})



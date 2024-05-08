const mongoose = require('mongoose');

const doctorSchema = new mongoose.Schema({



    name: {
        type: String,
        required: true
    },
    specialty: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    contact: {
        type: String,
        required: true
    },
    rating: {
        type: Number,
        default: 0
    },
    college: {
        type: String,
        required: true
    },
    experienceYears: {
        type: Number,
        required: true
    },
    patients: {
        type: Number,
        default: 0
    },
    bio: {
        type: String
    }
});
doctorSchema.index({ name: 'text' }, { specialty: 'text', location: 'text' });


const Doctor = mongoose.model('Doctor', doctorSchema);

module.exports = Doctor;

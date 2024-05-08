const mongoose = require('mongoose');
const { Schema } = mongoose;

const appointmentSchema = new Schema({
    patientId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    doctorId: {
        type: Schema.Types.ObjectId,
        ref: 'Doctor',
        required: true
    },
    date: {
        type: Date,
        required: true
    },
    time: {
        type: String,
        required: true
    },
    duration: {
        type: Number,
        required: true
    },
    package: {
        type: String,
        enum: ['Messaging', 'VoiceCall', 'VideoCall'],
        required: true
    },
    patientDetails: {
        name: { type: String, required: true },
        age: { type: Number, required: true },
        gender: { type: String, enum: ['Male', 'Female', 'Other'], required: true },
        problemDescription: { type: String, required: true }
    },
    status: {
        type: String,
        default: 'Confirmed'
    },

}, { timestamps: true });

const Appointment = mongoose.model('Appointment', appointmentSchema);

module.exports = Appointment;

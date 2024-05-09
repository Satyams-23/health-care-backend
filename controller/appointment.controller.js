const Appointment = require('../models/appointment.model');
const User = require('../models/user.model');
const Doctor = require('../models/doctor.model');
const sendEmail = require('../utils/sendEmail');
const asyncHandler = require("../utils/asyncHandler");
const ApiError = require("../utils/ApiError");
const ApiResponse = require("../utils/ApiResponse");
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create a new appointment with payment

const createAppointmentwithPayment = asyncHandler(async (req, res) => {
    const { patientId, doctorId, date, time, duration, package, patientDetails } = req.body;

    const doctor = await Doctor.findById(doctorId);
    const user = await User.findById(patientId);

    if (!doctor || !user) {
        throw new ApiError(404, 'Doctor or patient not found');
    }

    // Calculate price based on duration and package type
    let price = 0;

    // Define pricing options based on duration and package type
    const pricingOptions = {
        Messaging: {
            30: 20,
            60: 40,
            // Add more duration options as needed
        },
        Videocall: {
            30: 50,
            60: 90,
            // Add more duration options as needed
        },
        Voicecall: {
            30: 40,
            60: 70,
            // Add more duration options as needed
        },
        // Add more package types as needed
    };

    // Check if the selected package and duration are valid
    if (!pricingOptions.hasOwnProperty(package) || !pricingOptions[package].hasOwnProperty(duration)) {
        throw new ApiError(400, 'Invalid package or duration');
    }

    // Get the price based on the selected package and duration
    price = pricingOptions[package][duration];

    // Create appointment
    const appointment = await Appointment.create({
        patientId,
        doctorId,
        date,
        time,
        duration,
        package,
        patientDetails
    });

    // Create Stripe session
    const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
            {
                price_data: {
                    currency: 'usd',
                    product_data: {
                        name: 'Appointment',
                    },
                    unit_amount: price * 100, // Convert price to cents
                },
                quantity: 1,
            },
        ],
        mode: 'payment',
        success_url: `${process.env.CLIENT_URL}/appointment/create`,
        cancel_url: `${process.env.CLIENT_URL}/appointment/cancel`,
    });

    // Send response with appointment and session information
    res.status(201).json(new ApiResponse(201, { appointment, session }, 'Appointment created successfully'));
});







// Get all appointments
const getAllAppointments = asyncHandler(async (req, res) => {
    const appointments = await Appointment.find();
    res.status(200).json(new ApiResponse(appointments));
});

// // Get appointments by patient ID
// const getAppointmentsByPatientId = asyncHandler(async (req, res) => {
//     try {
//         const appointments = await Appointment.find({ patientId: req.params.id });
//         res.json(new ApiResponse(200, appointments, 'Appointments fetched successfully', true));

//     } catch (error) {
//         // console.error(error);
//         res.status(500).json({ message: error.message });

//     }
// });

// // Get appointments by doctor ID
// const getAppointmentsByDoctorId = asyncHandler(async (req, res) => {
//     try {
//         const appointments = await Appointment.find({ doctorId: req.params.id });
//         res.json(new ApiResponse(200, appointments, 'Appointments fetched successfully', true));

//     }
//     catch (error) {
//         // console.error(error);
//         res.status(500).json({ message: error.message });
//     }
// });

// Get appointments by status
const getAppointmentsByStatus = asyncHandler(async (req, res) => {
    try {
        const appointments = await Appointment.find({ status: req.params.status });
        res.json(new ApiResponse(200, appointments, 'Appointments fetched successfully', true));

    } catch (error) {
        // console.error(error);
        res.status(500).json({ message: error.message });

    }
});


const getUpcomingAppointmentsByPatientId = asyncHandler(async (req, res) => {
    try {
        const appointments = await Appointment.find({ patientId: req.params.id, date: { $gte: new Date() } });
        res.json(new ApiResponse(200, appointments, 'Upcoming appointments fetched successfully', true));

    } catch (error) {
        // console.error(error);
        res.status(500).json({ message: error.message });

    }
}
);

const getPastAppointmentsByPatientId = asyncHandler(async (req, res) => {
    try {
        const appointments = await Appointment.find({ patientId: req.params.id, date: { $lt: new Date() } });
        res.json(new ApiResponse(200, appointments, 'Past appointments fetched successfully', true));

    } catch (error) {
        // console.error(error);
        res.status(500).json({ message: error.message });

    }
}
);








// Update appointment
const updateAppointment = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!appointment) {
        throw new ApiError('Appointment not found', 404);
    }

    res.status(200).json(new ApiResponse('Appointment updated successfully'));
});

// Delete appointment
const deleteAppointment = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);

    if (!appointment) {
        throw new ApiError('Appointment not found', 404);
    }

    res.status(200).json(new ApiResponse('Appointment deleted successfully'));
});

// Confirm appointment
// const confirmAppointment = asyncHandler(async (req, res) => {
//     try {
//         const appointment = await Appointment.findById(req.params.id);

//         if (!appointment) {
//             throw new ApiError(404, 'Appointment not found');
//         }

//         if (appointment.status === 'Confirmed') {
//             throw new ApiError(400, 'Appointment already confirmed');
//         }

//         appointment.status = 'Confirmed';
//         await appointment.save();

//         const doctor = await Doctor.findById(appointment.doctorId);
//         const user = await User.findById(appointment.patientId);
//         const subject = 'Appointment Confirmation';

//         const text = `Dear ${user.name},\n\nYour appointment with Dr. ${doctor.name} has been confirmed.\n\nDate: ${appointment.date}\nTime: ${appointment.time}\nDuration: ${appointment.duration} minutes\nPackage: ${appointment.package}\n\nPlease be available at the scheduled time.\n\nRegards,\nHealthcare Team`;

//         sendEmail(user.email, subject, text);

//         // Send response with success set to true
//         res.status(200).json(new ApiResponse(200, 'Appointment confirmed successfully'));
//     } catch (error) {
//         // Handle errors

//         res.status(error.status || 500).json({
//             statusCode: error.status || 500,
//             message: error.message || 'Internal Server Error',
//             success: false
//         });
//     }

// });


// Cancel appointment
const cancelAppointment = asyncHandler(async (req, res) => {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
        throw new ApiError('Appointment not found', 404);
    }

    if (appointment.status === 'Cancelled') {
        throw new ApiError('Appointment already cancelled', 400);
    }

    appointment.status = 'Cancelled';
    await appointment.save();

    const doctor = await Doctor.findById(appointment.doctorId);
    const user = await User.findById(appointment.patientId);
    const subject = 'Appointment Cancellation';

    const text = `Dear ${user.name},\n\nYour appointment with Dr. ${doctor.name} has been cancelled.\n\nDate: ${appointment.date}\nTime: ${appointment.time}\nDuration: ${appointment.duration} minutes\nPackage: ${appointment.package}\n\nWe regret the inconvenience caused.\n\nRegards,\nHealthcare Team`;

    sendEmail(user.email, subject, text);

    res.status(200).json(new ApiResponse('Appointment cancelled successfully'));
});

// Get appointments by date

// const getAppointmentsByDate = asyncHandler(async (req, res) => {
//     try {
//         const appointments = await Appointment.find({ date: req.params.date });
//         res.json(new ApiResponse(200, appointments, 'Appointments fetched successfully', true));

//     } catch (error) {
//         // console.error(error);
//         res.status(500).json({ message: error.message });

//     }

// }
// );


module.exports = {
    createAppointmentwithPayment,
    getAllAppointments,
    // getAppointmentsByPatientId,
    // getAppointmentsByDoctorId,
    getAppointmentsByStatus,
    updateAppointment,
    deleteAppointment,
    // confirmAppointment,
    cancelAppointment,
    getUpcomingAppointmentsByPatientId,
    getPastAppointmentsByPatientId
};

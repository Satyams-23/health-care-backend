const express = require('express');
const router = express.Router();
const { isAuthentication: auth } = require('../middleware/auth.middleware');
const AppointmentController = require('../controller/appointment.controller');
const { check } = require('express-validator');

// Create a new appointment
router.post('/create', auth, AppointmentController.createAppointmentwithPayment);

// Get all appointments
router.get('/all', auth, AppointmentController.getAllAppointments);

// Update appointment
router.put('/update/:id', auth, AppointmentController.updateAppointment);

// Delete appointment
router.delete('/delete/:id', auth, AppointmentController.deleteAppointment);

// Get appointment by ID
// router.get('/doctor/:id', auth, AppointmentController.getAppointmentsByDoctorId);

// Get appointment by ID
router.get('/upcoming/:id', auth, AppointmentController.getUpcomingAppointmentsByPatientId);// means get all appointments by patient ID 

// Get appointment by ID
router.get('/past/:id', auth, AppointmentController.getPastAppointmentsByPatientId);// means get all appointments by patient ID

// Confirm appointment
// router.put('/confirm/:id', auth, AppointmentController.confirmAppointment);

// Cancel appointment
router.put('/cancel/:id', auth, AppointmentController.cancelAppointment);

// Get appointments by status
router.get('/status/:status', auth, AppointmentController.getAppointmentsByStatus);

// Get appointments by date

// router.get('/date/:date', auth, AppointmentController.getAppointmentsByDate);







module.exports = router;
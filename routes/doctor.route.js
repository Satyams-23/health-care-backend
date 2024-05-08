const express = require('express');
const doctorController = require('../controller/doctor.controller');
const { isAuthentication } = require('../middleware/auth.middleware');
const router = express.Router();
const { check } = require('express-validator');


router.post('/create', doctorController.createDoctor);
router.get('/search', isAuthentication, doctorController.getAllDoctors)
router.get('/:id', isAuthentication, doctorController.getDoctorById);
router.put('/:id', isAuthentication, doctorController.updateDoctor);
router.delete('/:id', isAuthentication, doctorController.deleteDoctor);


module.exports = router;


const Doctor = require('../models/doctor.model');
const ApiResponse = require('../utils/ApiResponse');
const ApiError = require('../utils/ApiError');
const asyncHandler = require('../utils/asyncHandler');



// create doctor

const createDoctor = asyncHandler(async (req, res) => {
    const data = req.body;

    try {
        const doctor = await Doctor.create(data);

        return res.status(201).json(new ApiResponse(201, doctor, 'Doctor created successfully'));

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
});






const getDoctorById = asyncHandler(async (req, res) => {
    try {
        const doctor = await Doctor.findById(req.params.id);

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        return res.status(200).json(new ApiResponse(200, doctor, 'Doctor fetched successfully'));

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
})



const updateDoctor = asyncHandler(async (req, res) => {

    const data = req.body;

    try {
        const doctor = await Doctor.findByIdAndUpdate(req
            .params.id, data, {
            new
                : true
        });

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        return res.status(200).json(new ApiResponse(200, doctor, 'Doctor updated successfully'));

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }

})


const deleteDoctor = async (req, res) => {
    try {
        const doctor = await Doctor.findByIdAndDelete(req.params.id);

        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }

        return res.status(200).json({ message: 'Doctor deleted successfully' });

    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
}

const getAllDoctors = async (req, res) => {
    const { query } = req.query;

    try {
        let doctors;
        if (query) {
            // Perform search based on the query parameter
            doctors = await Doctor.find({
                $or: [
                    { name: { $regex: query, $options: 'i' } }, // Case-insensitive match
                    { specialty: { $regex: query, $options: 'i' } }
                ]
            });
        } else {
            // If no query parameter is provided, return all doctors
            doctors = await Doctor.find();
        }

        return res.status(200).json(new ApiResponse(200, doctors, 'Doctors fetched successfully'));

    }
    catch (error) {
        return res.status(500).json({ message: error.message });
    }

};



module.exports = { createDoctor, getAllDoctors, getDoctorById, updateDoctor, deleteDoctor };//

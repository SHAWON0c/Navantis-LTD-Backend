const express = require('express');
const router = express.Router();
const { 
  createDoctor, 
  getAllDoctors, 
  addProductToDoctor, 
  getDoctorProducts 
} = require('../controllers/doctors/doctor.controller');
const AuthMiddleware = require('../middlewares/Authmiddleware');

// ───────────── DOCTOR ROUTES ─────────────

// Create a new doctor (protected, only IT-Officer & Admin)
router.post('/', createDoctor);

// Get all doctors (protected, all roles can see)
router.get('/', getAllDoctors);

// Add product to doctor & adjust account balance (protected)
router.post('/:doctorId/add-product', addProductToDoctor);

// Get all products of a doctor (protected)
router.get('/:doctorId/products',  getDoctorProducts);

module.exports = router;

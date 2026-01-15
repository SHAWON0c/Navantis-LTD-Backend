const Doctor = require('../../models/Doctor.model');

/**
 * Create a new doctor
 */
const createDoctor = async (req, res) => {
  try {
    const {
      doctorName,
      territory,
      doctorLicense,
      address,
      mobileNo,
      email,
      contactNo,
      discount
    } = req.body;

    // Track who added this doctor
    const addedBy = {
      name: req.user?.name || 'System', // fallback if not available
      email: req.user?.email || 'system@company.com'
    };

    // Check if doctor license already exists
    const existing = await Doctor.findOne({ doctorLicense });
    if (existing) {
      return res.status(400).json({ message: 'Doctor license already exists' });
    }

    const doctor = new Doctor({
      doctorName,
      territory,
      doctorLicense,
      address,
      mobileNo,
      email,
      contactNo,
      discount: discount || 0,
      addedBy
    });

    await doctor.save();
    res.status(201).json({ message: 'Doctor created', doctor });
  } catch (err) {
    console.error('CREATE DOCTOR ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get all doctors
 */
const getAllDoctors = async (req, res) => {
  try {
    const doctors = await Doctor.find()
      .sort({ createdAt: -1 })
      .populate('products.productId', 'productName brand productShortCode');

    res.json({ doctors });
  } catch (err) {
    console.error('GET ALL DOCTORS ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Add product to a doctor and adjust account balance
 */
const addProductToDoctor = async (req, res) => {
  try {
    const { doctorId } = req.params;
    const { productId, quantity, price } = req.body;

    const doctor = await Doctor.findById(doctorId);
    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    // Add product record
    doctor.products.push({ productId, quantity, price });

    // Update account balance
    const totalPrice = quantity * price;
    doctor.accountBalance += totalPrice;

    await doctor.save();

    res.json({ message: 'Product added to doctor', doctor });
  } catch (err) {
    console.error('ADD PRODUCT TO DOCTOR ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * Get a single doctor by ID (optional)
 */
const getDoctorById = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findById(doctorId)
      .populate('products.productId', 'productName brand productShortCode');

    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    res.json({ doctor });
  } catch (err) {
    console.error('GET DOCTOR BY ID ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};




const getDoctorProducts = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const doctor = await Doctor.findById(doctorId)
      

    if (!doctor) return res.status(404).json({ message: 'Doctor not found' });

    res.json({ products: doctor.products });
  } catch (err) {
    console.error('GET DOCTOR PRODUCTS ERROR:', err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { getDoctorProducts };


module.exports = {
  createDoctor,
  getAllDoctors,
  addProductToDoctor,
  getDoctorById,
  getDoctorProducts
};

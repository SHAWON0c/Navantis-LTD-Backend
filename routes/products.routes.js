const express = require('express');
const router = express.Router();
const { createProduct, getAllProducts, getAllBrands, getProductsByBrand, updateProduct, getProductById } = require('../controllers/products/product.controller');
const Authmiddleware = require('../middlewares/Authmiddleware');

// Create a new product (protected: only IT-Officer or admin)
router.post('/', createProduct);

// Get all products (protected: any logged-in user)
router.get('/', getAllProducts);
router.get('/brands', getAllBrands);
router.get('/brand/:brandName', getProductsByBrand);


router.patch("/:id", updateProduct); // partial update
router.put("/:id", updateProduct);

// Get single product by ID
router.get('/:id', getProductById);


module.exports = router;

const Product = require('../../models/Product.model');

// Create a new product
const createProduct = async (req, res) => {
  try {
    const { productName, brand, productShortCode, packSize } = req.body;

    // Validate packSize early
    if (!packSize) {
      return res.status(400).json({
        message: "packSize is required"
      });
    }

    // Check if productShortCode already exists
    const existing = await Product.findOne({ productShortCode });
    if (existing) {
      return res.status(400).json({
        message: "Product short code already exists"
      });
    }

    const product = new Product({
      productName,
      brand,
      productShortCode,
      packSize
    });

    await product.save();

    res.status(201).json({
      message: "Product created",
      product
    });

  } catch (err) {
    console.error("CREATE PRODUCT ERROR ❌", err);
    res.status(500).json({ message: "Server error" });
  }
};


// Get all products
const getAllProducts = async (req, res) => {
  try {
    const brands = await Product.aggregate([
      { $sort: { createdAt: -1 } },
      {
        $group: {
          _id: "$brand",
          products: {
            $push: {
              _id: "$_id",                  // ✅ Include product ID
              productName: "$productName",
              productShortCode: "$productShortCode",
              packSize: "$packSize"          // optional: include packSize too
            }
          }
        }
      },
      {
        $project: {
          _id: 0,
          brand: "$_id",
          products: 1
        }
      }
    ]);

    res.status(200).json({ brands });

  } catch (err) {
    console.error("❌ getAllProducts error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



const getAllBrands = async (req, res) => {
  try {
    const brands = await Product.distinct("brand");
    res.status(200).json({ brands });
  } catch (err) {
    console.error("❌ getAllBrands error:", err);
    res.status(500).json({ message: "Server error" });
  }
};


const getProductsByBrand = async (req, res) => {
  try {
    const { brandName } = req.params;

    const products = await Product.find({ brand: brandName })
      .sort({ createdAt: -1 });

    res.status(200).json({
      brand: brandName,
      products
    });
  } catch (err) {
    console.error("❌ getProductsByBrand error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



// Update product by ID (partial or full)
const updateProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    if (!id) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    // Optional: Prevent updating productShortCode to a duplicate
    if (updateData.productShortCode) {
      const exists = await Product.findOne({
        productShortCode: updateData.productShortCode,
        _id: { $ne: id }
      });
      if (exists) {
        return res.status(400).json({ message: "productShortCode already exists" });
      }
    }

    // Find product
    const product = await Product.findById(id);
    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    // Update fields dynamically (partial update supported)
    for (let key of Object.keys(updateData)) {
      product[key] = updateData[key];
    }

    await product.save();

    res.status(200).json({
      message: "Product updated successfully",
      product
    });

  } catch (err) {
    console.error("❌ updateProduct error:", err);
    res.status(500).json({ message: "Server error" });
  }
};



module.exports = { createProduct, getAllProducts, getAllBrands ,getProductsByBrand ,updateProduct };

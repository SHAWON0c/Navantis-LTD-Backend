const Joi = require("joi");

// Validation schema for creating Purchase Order
const createPurchaseOrderSchema = Joi.object({
  productId: Joi.string().required().messages({
    "any.required": "Product ID is required"
  }),
  productQuantity: Joi.number().integer().min(1).required().messages({
    "number.base": "Product quantity must be a number",
    "number.min": "Product quantity must be at least 1",
    "any.required": "Product quantity is required"
  }),
  batch: Joi.string().required().messages({
    "any.required": "Batch is required"
  }),
  expireDate: Joi.date().required().messages({
    "any.required": "Expire date is required",
    "date.base": "Expire date must be a valid date"
  }),
  actualPrice: Joi.number().min(0).required().messages({
    "number.min": "Actual price must be >= 0",
    "any.required": "Actual price is required"
  }),
  tradePrice: Joi.number().min(0).required().messages({
    "number.min": "Trade price must be >= 0",
    "any.required": "Trade price is required"
  }),
  purchaseDate: Joi.date().optional()
});

// Middleware to validate request body
const validateCreatePurchaseOrder = (req, res, next) => {
  const { error } = createPurchaseOrderSchema.validate(req.body, { abortEarly: false });
  if (error) {
    return res.status(400).json({
      success: false,
      message: "Validation failed",
      errors: error.details.map(e => e.message)
    });
  }
  next();
};

module.exports = { validateCreatePurchaseOrder };

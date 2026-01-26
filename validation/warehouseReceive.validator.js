const { body } = require("express-validator");

exports.createWarehouseReceiveValidation = [
  body("purchaseOrderId")
    .notEmpty().withMessage("purchaseOrderId is required")
    .isMongoId().withMessage("purchaseOrderId must be a valid Mongo ID"),

  body("boxQuantity")
    .notEmpty().withMessage("boxQuantity is required")
    .isInt({ min: 1 }).withMessage("boxQuantity must be at least 1"),

  body("productQuantityWithBox")
    .notEmpty().withMessage("productQuantityWithBox is required")
    .isInt({ min: 0 })
    .withMessage("productQuantityWithBox must be 0 or greater"),

  body("productQuantityWithoutBox")
    .notEmpty().withMessage("productQuantityWithoutBox is required")
    .isInt({ min: 0 })
    .withMessage("productQuantityWithoutBox must be 0 or greater"),

  body("productQuantityWithoutBox").custom((value, { req }) => {
    if (value > req.body.productQuantityWithBox) {
      throw new Error(
        "productQuantityWithoutBox cannot be greater than productQuantityWithBox"
      );
    }
    return true;
  }),

  body("remarks")
    .optional()
    .isString().withMessage("remarks must be a string")
    .isLength({ max: 500 })
    .withMessage("remarks cannot exceed 500 characters")
];

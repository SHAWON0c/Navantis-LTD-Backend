// models/DesignationPermission.js
const mongoose = require("mongoose");

const designationPermissionSchema = new mongoose.Schema({
  designation: { type: String, required: true, unique: true },
  permissions: { type: [String], default: [] } // list of allowed actions/routes
}, { timestamps: true });

module.exports = mongoose.model("DesignationPermission", designationPermissionSchema);

const mongoose = require("mongoose");

const organizationProfileSchema = new mongoose.Schema(
  {
    // 🔹 Core Linking
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true
    },

    // 🔹 Basic Info
    name: { type: String, required: true },
    phone: String,
    email: String,
    profilePic: String,

    fathersName: String,
    mothersName: String,
    dateOfBirth: Date,
    bloodGroup: String,

    // 🔹 Address
    presentAddress: String,
    permanentAddress: String,

    // 🔹 Identity & Compliance
    identity: {
      nidNumber: String,
      passportNumber: String,
      drivingLicenseNumber: String,
      tinNumber: String,
      isNidVerified: { type: Boolean, default: false }
    },

    // 🔹 Education
    education: {
      highestEducation: String,
      institution: String,
      passingYear: Number
    },

    // 🔹 Employment Details
    employment: {
      employeeCode: String,
      designation: String,
      department: String,
      grade: String,
      workplace: String, // HQ / Field

      employmentType: {
        type: String,
        enum: ["permanent", "contract", "intern"],
        default: "permanent"
      },

      reportingManagerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      },

      territoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Territory"
      },

      joinedAt: { type: Date, default: Date.now },
      probationEndDate: Date,
      confirmationDate: Date,

      employmentStatus: {
        type: String,
        enum: ["active", "resigned", "terminated"],
        default: "active"
      }
    },

    // 🔹 Payroll (Future Ready)
    payroll: {
      basicSalary: Number,
      grossSalary: Number,
      paymentMethod: { type: String, enum: ["bank", "cash"] },
      bankName: String,
      accountNumber: String,
      isSalaryHold: { type: Boolean, default: false }
    },

    // 🔹 Leave Snapshot
    leaveInfo: {
      casual: { type: Number, default: 12 },
      sick: { type: Number, default: 10 },
      annual: { type: Number, default: 15 }
    },

    // 🔹 Shift
    shiftInfo: {
      shiftName: String,
      weeklyOff: String
    },

    // 🔹 Health & Emergency
    healthInfo: {
      medicalConditions: String,
      allergies: String,
      insurancePolicyNo: String
    },

    emergencyContact: {
      name: String,
      relation: String,
      phone: String
    },

    // 🔹 Company Assets
    assets: {
      laptopSerial: String,
      mobileIMEI: String,
      simNumber: String,
      companyEmail: String,
      accessCardId: String
    },

    // 🔹 Exit Info
    exitInfo: {
      resignationDate: Date,
      lastWorkingDay: Date,
      exitReason: String,
      clearanceStatus: Boolean
    },

    // 🔹 Change History (Audit Trail)
    history: [
      {
        action: { type: String, required: true },
        field: String,
        oldValue: String,
        newValue: String,
        updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User"
        },
        date: { type: Date, default: Date.now }
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "OrganizationProfile",
  organizationProfileSchema
);

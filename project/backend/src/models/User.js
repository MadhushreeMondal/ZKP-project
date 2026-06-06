const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["admin", "farmer", "regulator", "customer"],
      required: true,
    },

    // Admin Specific Fields
    adminId: {
      type: String,
      sparse: true,
      unique: true,
      trim: true,
    },

    // Farmer Specific Fields
    pmKisanId: {
      type: String,
      sparse: true,
      trim: true,
    },
    aadhaarNumber: {
      type: String,
      sparse: true,
      trim: true,
    },

    // Regulator Specific Fields
    regulatorId: {
      type: String,
      sparse: true,
      unique: true,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);

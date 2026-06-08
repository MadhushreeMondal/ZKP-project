const mongoose = require("mongoose");

const complianceRecordSchema = new mongoose.Schema(
  {
    productId: {
      type: String,
      required: true,
      unique: true,
    },

    crop: {
      type: String,
      required: true,
      trim: true,
    },

    proofHash: {
      type: String,
      required: true,
      unique: true,
    },

    verificationResult: {
      type: Boolean,
      required: true,
    },

    timestamp: {
      type: Date,
      default: Date.now,
    },

    onChainRecordId: {
      type: Number,
    },

    txHash: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "ComplianceRecord",
  complianceRecordSchema
);
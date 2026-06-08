const express = require("express");
const ComplianceRecord = require("../models/ComplianceRecord");
const QRCode = require("qrcode");
const {
  getRulesForCrop,
  validateCompliance,
} = require("../services/rulesService");
const {
  generateProof,
  verifyProofLocally,
  formatProofForContract,
} = require("../services/zkpService");
const { submitProofOnChain } = require("../services/blockchainService");
const { authenticateJWT, requireRole } = require("../middleware/auth");

const router = express.Router();

router.post("/submit", authenticateJWT, requireRole(["farmer"]), async (req, res) => {
  try {
    const { crop, yield: yieldValue, temperature, inventory, pesticide, price } =
      req.body;

    if (!crop) {
      return res.status(400).json({ error: "Crop is required" });
    }

    const privateData = {
      yield: Number(yieldValue),
      temperature: Number(temperature),
      inventory: Number(inventory),
      pesticide: Number(pesticide),
      price: Number(price),
    };

    const numericFields = Object.entries(privateData);
    const invalidFields = numericFields
      .filter(([, value]) => Number.isNaN(value))
      .map(([key]) => key);

    if (invalidFields.length > 0) {
      return res.status(400).json({
        error: `Invalid numeric values for: ${invalidFields.join(", ")}`,
      });
    }

    const rules = getRulesForCrop(crop);
    const validation = validateCompliance(privateData, rules);

    if (!validation.valid) {
      return res.status(400).json({
        error: "Compliance validation failed",
        details: validation.errors,
      });
    }

    const { proof, publicSignals, proofHash } = await generateProof(
      privateData,
      rules
    );
    const formattedProof = formatProofForContract(proof, publicSignals);

    const locallyVerified = await verifyProofLocally(proof, publicSignals);

    let chainResult = { verified: false, txHash: null, onChainRecordId: null };
    try {
      chainResult = await submitProofOnChain(crop, proofHash, formattedProof);
    } catch (chainError) {
      console.warn("On-chain submission failed:", chainError.message);
    }

    const verificationResult = chainResult.verified || locallyVerified;
    const productId =
  "PRD-" + Math.floor(100000 + Math.random() * 900000);

const qrUrl =
  `https://zkp-project-zeta.vercel.app/verify/${productId}`;

const qrCode = await QRCode.toDataURL(qrUrl);

    const record = await ComplianceRecord.create({
      productId,
      crop,
      proofHash,
      verificationResult,
      timestamp: new Date(),
      onChainRecordId: chainResult.onChainRecordId,
      txHash: chainResult.txHash,
    });

    res.status(201).json({
      message: "Compliance proof generated and submitted",
record: {
  id: record._id,
  productId,
  crop: record.crop,
  proofHash: record.proofHash,
  verificationResult,
  timestamp: record.timestamp,
  txHash: record.txHash,
  qrCode,
},
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
});

router.get("/regulator", authenticateJWT, requireRole(["regulator"]), async (_req, res) => {
  try {
    const records = await ComplianceRecord.find(
      {},
      "crop proofHash verificationResult timestamp txHash -_id"
    ).sort({ timestamp: -1 });

    res.json({
      records: records.map((r) => ({
        crop: r.crop,
        proofHash: r.proofHash,
        verificationResult: r.verificationResult,
        timestamp: r.timestamp,
        txHash: r.txHash,
      })),
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

router.get("/verify/:productId", async (req, res) => {
  try {
    const record = await ComplianceRecord.findOne({
      productId: req.params.productId,
    });

    if (!record) {
      return res.status(404).json({
        error: "Product not found",
      });
    }

    res.json(record);
  } catch (error) {
    res.status(500).json({
      error: error.message,
    });
  }
});

module.exports = router;

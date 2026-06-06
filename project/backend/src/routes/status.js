const express = require("express");
const fs = require("fs");
const path = require("path");
const mongoose = require("mongoose");

const router = express.Router();

const ZKP_ARTIFACTS = {
  wasm: path.join(__dirname, "..", "..", "..", "zkp", "build", "compliance_js", "compliance.wasm"),
  zkey: path.join(__dirname, "..", "..", "..", "zkp", "build", "compliance_final.zkey"),
  vkey: path.join(__dirname, "..", "..", "..", "zkp", "build", "verification_key.json"),
  r1cs: path.join(__dirname, "..", "..", "..", "zkp", "build", "compliance.r1cs"),
};

const DEPLOYMENT_PATH = path.join(__dirname, "..", "config", "deployments.json");
const VERIFIER_PATH = path.join(
  __dirname,
  "..",
  "..",
  "..",
  "contracts",
  "contracts",
  "Groth16Verifier.sol"
);
const RULES_PATH = path.join(__dirname, "..", "..", "..", "crop_rules.csv");

function fileExists(filePath) {
  return fs.existsSync(filePath);
}

function isPlaceholderVerifier() {
  if (!fileExists(VERIFIER_PATH)) return true;
  const source = fs.readFileSync(VERIFIER_PATH, "utf-8");
  return source.includes("PLACEHOLDER");
}

router.get("/", (_req, res) => {
  const mongoConnected = mongoose.connection.readyState === 1;

  const checks = {
    cropRules: fileExists(RULES_PATH),
    zkpWasm: fileExists(ZKP_ARTIFACTS.wasm),
    zkpZkey: fileExists(ZKP_ARTIFACTS.zkey),
    zkpVkey: fileExists(ZKP_ARTIFACTS.vkey),
    zkpR1cs: fileExists(ZKP_ARTIFACTS.r1cs),
    verifierGenerated: !isPlaceholderVerifier(),
    contractsDeployed: fileExists(DEPLOYMENT_PATH),
    mongoConnected,
    blockchainRpc: Boolean(process.env.BLOCKCHAIN_RPC),
    deployerKey: Boolean(process.env.DEPLOYER_PRIVATE_KEY),
  };

  const ready =
    checks.cropRules &&
    checks.zkpWasm &&
    checks.zkpZkey &&
    checks.zkpVkey &&
    checks.verifierGenerated &&
    checks.contractsDeployed &&
    checks.mongoConnected &&
    checks.blockchainRpc &&
    checks.deployerKey;

  res.json({
    ready,
    checks,
    message: ready
      ? "System ready for end-to-end compliance submission"
      : "System not fully ready — see checks for missing setup steps",
  });
});

module.exports = router;

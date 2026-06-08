const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const snarkjs = require("snarkjs");

const SCALE = 1000;

// zkp folder is now inside backend
const ZKP_BUILD = path.join(__dirname, "..", "..", "zkp", "build");

const WASM_PATH = path.join(
  ZKP_BUILD,
  "compliance_js",
  "compliance.wasm"
);

const ZKEY_PATH = path.join(
  ZKP_BUILD,
  "compliance_final.zkey"
);

const VKEY_PATH = path.join(
  ZKP_BUILD,
  "verification_key.json"
);

function scale(value) {
  return Math.round(Number(value) * SCALE);
}

function buildWitnessInput(privateData, rules) {
  return {
    yield: scale(privateData.yield),
    temperature: scale(privateData.temperature),
    inventory: scale(privateData.inventory),
    pesticide: scale(privateData.pesticide),
    price: scale(privateData.price),

    minYield: scale(rules.minYield),
    maxPesticide: scale(rules.maxPesticide),
    minInventory: scale(rules.minInventory),
    minTemperature: scale(rules.minTemperature),
    maxTemperature: scale(rules.maxTemperature),
    minPrice: scale(rules.minPrice),
    maxPrice: scale(rules.maxPrice),
  };
}

function assertZkpArtifacts() {
  console.log("================================");
  console.log("ZKP_BUILD =", ZKP_BUILD);
  console.log("WASM_PATH =", WASM_PATH);
  console.log("ZKEY_PATH =", ZKEY_PATH);
  console.log("VKEY_PATH =", VKEY_PATH);

  console.log("WASM EXISTS =", fs.existsSync(WASM_PATH));
  console.log("ZKEY EXISTS =", fs.existsSync(ZKEY_PATH));
  console.log("VKEY EXISTS =", fs.existsSync(VKEY_PATH));
  console.log("================================");

  if (!fs.existsSync(WASM_PATH)) {
    throw new Error(`Missing WASM file: ${WASM_PATH}`);
  }

  if (!fs.existsSync(ZKEY_PATH)) {
    throw new Error(`Missing ZKEY file: ${ZKEY_PATH}`);
  }
}

async function generateProof(privateData, rules) {
  assertZkpArtifacts();

  const input = buildWitnessInput(privateData, rules);

  const { proof, publicSignals } = await snarkjs.groth16.fullProve(
    input,
    WASM_PATH,
    ZKEY_PATH
  );

  const proofHash = crypto
    .createHash("sha256")
    .update(JSON.stringify({ proof, publicSignals }))
    .digest("hex");

  return {
    proof,
    publicSignals,
    proofHash,
    scaledInput: input,
  };
}

async function verifyProofLocally(proof, publicSignals) {
  if (!fs.existsSync(VKEY_PATH)) {
    console.log("verification_key.json not found");
    return false;
  }

  const vkey = JSON.parse(
    fs.readFileSync(VKEY_PATH, "utf-8")
  );

  return snarkjs.groth16.verify(
    vkey,
    publicSignals,
    proof
  );
}

function formatProofForContract(proof, publicSignals) {
  return {
    a: [proof.pi_a[0], proof.pi_a[1]],
    b: [
      [proof.pi_b[0][1], proof.pi_b[0][0]],
      [proof.pi_b[1][1], proof.pi_b[1][0]],
    ],
    c: [proof.pi_c[0], proof.pi_c[1]],
    pubSignals: publicSignals.map((signal) =>
      signal.toString()
    ),
  };
}

module.exports = {
  SCALE,
  generateProof,
  verifyProofLocally,
  formatProofForContract,
  buildWitnessInput,
};
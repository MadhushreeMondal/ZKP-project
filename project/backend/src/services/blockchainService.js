const fs = require("fs");
const path = require("path");
const { ethers } = require("ethers");

const DEPLOYMENT_PATH = path.join(__dirname, "..", "config", "deployments.json");
const REGISTRY_ABI = [
  "function submitCompliance(string crop, bytes32 proofHash, uint[2] a, uint[2][2] b, uint[2] c, uint[7] pubSignals) external returns (bool verified, uint256 recordId)",
  "function getRecordCount() external view returns (uint256)",
  "function getAllRecords() external view returns (string[] crops, bytes32[] proofHashes, bool[] verifiedFlags, uint256[] timestamps)",
];

function loadDeployment() {
  if (!fs.existsSync(DEPLOYMENT_PATH)) {
    throw new Error(
      "Contracts not deployed. Start hardhat node and run: cd contracts && npm run deploy"
    );
  }
  return JSON.parse(fs.readFileSync(DEPLOYMENT_PATH, "utf-8"));
}

function getRegistryContract() {
  const deployment = loadDeployment();
  const provider = new ethers.JsonRpcProvider(process.env.BLOCKCHAIN_RPC);
  const wallet = new ethers.Wallet(process.env.DEPLOYER_PRIVATE_KEY, provider);
  const registry = new ethers.Contract(
    deployment.registry,
    REGISTRY_ABI,
    wallet
  );
  return { registry, deployment };
}

async function submitProofOnChain(crop, proofHash, formattedProof) {
  const { registry } = getRegistryContract();
  const proofHashBytes = ethers.id(proofHash);

  const tx = await registry.submitCompliance(
    crop,
    proofHashBytes,
    formattedProof.a,
    formattedProof.b,
    formattedProof.c,
    formattedProof.pubSignals
  );

  const receipt = await tx.wait();
  const verified = receipt.status === 1;

  let onChainRecordId = null;
  if (verified) {
    try {
      onChainRecordId = Number(await registry.getRecordCount());
    } catch (_) {
      onChainRecordId = null;
    }
  }

  return {
    verified,
    txHash: receipt.hash,
    onChainRecordId,
  };
}

async function getOnChainRecords() {
  const { registry } = getRegistryContract();
  const [crops, proofHashes, verifiedFlags, timestamps] =
    await registry.getAllRecords();

  return crops.map((crop, i) => ({
    crop,
    proofHash: proofHashes[i],
    verificationResult: verifiedFlags[i],
    timestamp: Number(timestamps[i]) * 1000,
  }));
}

module.exports = {
  submitProofOnChain,
  getOnChainRecords,
  loadDeployment,
};

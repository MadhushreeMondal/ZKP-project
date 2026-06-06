const fs = require("fs");
const path = require("path");
const { ethers } = require("hardhat");

async function main() {
  const [deployer] = await ethers.getSigners();
  console.log("Deploying with account:", deployer.address);

  const Verifier = await ethers.getContractFactory("Groth16Verifier");
  const verifier = await Verifier.deploy();
  await verifier.waitForDeployment();
  const verifierAddress = await verifier.getAddress();
  console.log("Groth16Verifier deployed to:", verifierAddress);

  const Registry = await ethers.getContractFactory("ComplianceRegistry");
  const registry = await Registry.deploy(verifierAddress);
  await registry.waitForDeployment();
  const registryAddress = await registry.getAddress();
  console.log("ComplianceRegistry deployed to:", registryAddress);

  const deployment = {
    network: (await ethers.provider.getNetwork()).chainId.toString(),
    verifier: verifierAddress,
    registry: registryAddress,
    deployer: deployer.address,
    timestamp: new Date().toISOString(),
  };

  const outDir = path.join(__dirname, "..", "..", "backend", "config");
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(
    path.join(outDir, "deployments.json"),
    JSON.stringify(deployment, null, 2)
  );

  console.log("Deployment saved to backend/config/deployments.json");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

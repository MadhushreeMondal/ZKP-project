const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");

const checks = [
  {
    name: "crop_rules.csv",
    path: path.join(ROOT, "crop_rules.csv"),
    fix: "Run: python generate_crop_rules.py",
  },
  {
    name: "ZKP WASM",
    path: path.join(ROOT, "zkp", "build", "compliance_js", "compliance.wasm"),
    fix: "Install Circom, then: cd zkp && npm run build",
  },
  {
    name: "ZKP zkey",
    path: path.join(ROOT, "zkp", "build", "compliance_final.zkey"),
    fix: "cd zkp && npm run build",
  },
  {
    name: "Groth16 Verifier (generated)",
    path: path.join(ROOT, "contracts", "contracts", "Groth16Verifier.sol"),
    fix: "cd zkp && npm run build (replaces placeholder verifier)",
    validate: (filePath) => {
      if (!fs.existsSync(filePath)) return false;
      return !fs.readFileSync(filePath, "utf-8").includes("PLACEHOLDER");
    },
  },
  {
    name: "Contract deployment config",
    path: path.join(ROOT, "backend", "config", "deployments.json"),
    fix: "Start hardhat node, then: cd contracts && npm run deploy",
  },
  {
    name: "Backend .env",
    path: path.join(ROOT, "backend", ".env"),
    fix: "Copy backend/.env.example to backend/.env",
  },
];

let allPassed = true;

console.log("Agri ZKP Privacy Layer — Preflight Check\n");

for (const check of checks) {
  const exists = check.validate
    ? check.validate(check.path)
    : fs.existsSync(check.path);
  const status = exists ? "PASS" : "FAIL";
  if (!exists) allPassed = false;
  console.log(`[${status}] ${check.name}`);
  if (!exists) console.log(`       Fix: ${check.fix}`);
}

console.log("\nRuntime services (manual check):");
console.log("- MongoDB: mongod must be running");
console.log("- Hardhat node: cd contracts && npm run node");
console.log("- Backend: cd backend && npm run dev");
console.log("- Frontend: cd frontend && npm run dev");

console.log(allPassed ? "\nAll file checks passed." : "\nSome setup steps remain.");
process.exit(allPassed ? 0 : 1);

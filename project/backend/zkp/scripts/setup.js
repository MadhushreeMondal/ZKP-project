const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BUILD = path.join(ROOT, "build");
const CONTRACTS = path.join(ROOT, "..", "contracts", "contracts");

function run(cmd) {
  console.log(`> ${cmd}`);
  execSync(cmd, { stdio: "inherit", cwd: ROOT, shell: true });
}

function ensureDir(dir) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

async function main() {
  ensureDir(BUILD);
  ensureDir(CONTRACTS);

  const ptau0 = path.join(BUILD, "pot12_0000.ptau");
  const ptau1 = path.join(BUILD, "pot12_0001.ptau");
  const ptauFinal = path.join(BUILD, "pot12_final.ptau");
  const zkey0 = path.join(BUILD, "compliance_0000.zkey");
  const zkeyFinal = path.join(BUILD, "compliance_final.zkey");
  const r1cs = path.join(BUILD, "compliance.r1cs");
  const vkey = path.join(BUILD, "verification_key.json");

  if (!fs.existsSync(r1cs)) {
    console.error("Missing compliance.r1cs. Run: npm run compile");
    process.exit(1);
  }

  if (!fs.existsSync(ptauFinal)) {
    if (!fs.existsSync(ptau0)) {
      run(`npx snarkjs powersoftau new bn128 12 ${ptau0} -v`);
    }
    if (!fs.existsSync(ptau1)) {
      run(`npx snarkjs powersoftau contribute ${ptau0} ${ptau1} --name="First" -v -e="agri-privacy-layer"`);
    }
    run(`npx snarkjs powersoftau prepare phase2 ${ptau1} ${ptauFinal} -v`);
  }

  if (!fs.existsSync(zkeyFinal)) {
    run(`npx snarkjs groth16 setup ${r1cs} ${ptauFinal} ${zkey0}`);
    run(`npx snarkjs zkey contribute ${zkey0} ${zkeyFinal} --name="agri" -v -e="agri-privacy-layer"`);
    run(`npx snarkjs zkey export verificationkey ${zkeyFinal} ${vkey}`);
  }

  run(`npx snarkjs zkey export solidityverifier ${zkeyFinal} ${path.join(CONTRACTS, "Groth16Verifier.sol")}`);
  console.log("\nZKP setup complete.");
  console.log(`Verifier exported to: ${path.join(CONTRACTS, "Groth16Verifier.sol")}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

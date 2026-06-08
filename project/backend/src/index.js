require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const cropsRouter = require("./routes/crops");
const complianceRouter = require("./routes/compliance");
const statusRouter = require("./routes/status");
const authRouter = require("./routes/auth");
const User = require("./models/User");
const bcrypt = require("bcryptjs");

const PORT = process.env.PORT || 5000;

async function seedAdmin() {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@agri.com";
  const adminId = process.env.ADMIN_ID || "ADM2026001";
  const adminPassword = process.env.ADMIN_PASSWORD || "AdminSecurePass123!";

  try {
    const existingAdmin = await User.findOne({ role: "admin", adminId });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash(adminPassword, 10);
      await User.create({
        name: "System Administrator",
        email: adminEmail,
        phone: "+1111111111",
        password: hashedPassword,
        role: "admin",
        adminId,
      });
      console.log("-----------------------------------------");
      console.log("Admin account successfully pre-seeded:");
      console.log(`Admin ID: ${adminId}`);
      console.log(`Admin Email: ${adminEmail}`);
      console.log(`Admin Password: ${adminPassword}`);
      console.log("-----------------------------------------");
    } else {
      console.log("Admin account already seeded");
    }
  } catch (err) {
    console.error("Failed to seed admin:", err);
  }
}

async function start() {
  const app = express();

 app.use(
  cors({
    origin: [
      "https://zkp-project-zeta.vercel.app",
      "http://localhost:5173",
    ],
    credentials: true,
  })
);
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "agri-zkp-backend" });
  });

  app.use("/api/auth", authRouter);
  app.use("/api/crops", cropsRouter);
  app.use("/api/compliance", complianceRouter);
  app.use("/api/status", statusRouter);

  await connectDB(
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/agri_zkp"
  );

  await seedAdmin();

  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start backend:", err);
  process.exit(1);
});


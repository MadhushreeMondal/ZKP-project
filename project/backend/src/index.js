require("dotenv").config();
const express = require("express");
const cors = require("cors");
const { connectDB } = require("./config/db");
const cropsRouter = require("./routes/crops");
const complianceRouter = require("./routes/compliance");
const statusRouter = require("./routes/status");

const PORT = process.env.PORT || 5000;

async function start() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || "http://localhost:5173",
    })
  );
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", service: "agri-zkp-backend" });
  });

  app.use("/api/crops", cropsRouter);
  app.use("/api/compliance", complianceRouter);
  app.use("/api/status", statusRouter);

  await connectDB(
    process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/agri_zkp"
  );

  app.listen(PORT, () => {
    console.log(`Backend running on http://localhost:${PORT}`);
  });
}

start().catch((err) => {
  console.error("Failed to start backend:", err);
  process.exit(1);
});

const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const RegulatorApplication = require("../models/RegulatorApplication");
const { authenticateJWT, requireRole, JWT_SECRET } = require("../middleware/auth");

const router = express.Router();

// Helper to generate next regulator ID or random suffix
function generateRegulatorId() {
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `REG-2026-${rand}`;
}

// Helper to generate temporary password
function generateTempPassword() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%";
  let pass = "";
  for (let i = 0; i < 10; i++) {
    pass += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return pass;
}

// 1. REGISTRATION ROUTE (Farmer & Customer only)
router.post("/register", async (req, res) => {
  try {
    const {
      role,
      name,
      email,
      phone,
      password,
      confirmPassword,
      pmKisanId,
      aadhaarNumber,
    } = req.body;

    if (!role || !name || !email || !phone || !password || !confirmPassword) {
      return res.status(400).json({ error: "All basic fields are required" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match" });
    }

    if (role === "admin" || role === "regulator") {
      return res.status(403).json({
        error: "Direct registration not allowed for Admin or Regulator roles",
      });
    }

    // Check if email already registered
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: "Email is already registered" });
    }

    // Role specific validation
    const extraData = {};
    if (role === "farmer") {
      if (!pmKisanId || !aadhaarNumber) {
        return res
          .status(400)
          .json({ error: "PM-KISAN ID and Aadhaar Number are required for Farmers" });
      }
      extraData.pmKisanId = pmKisanId;
      extraData.aadhaarNumber = aadhaarNumber;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      phone,
      password: hashedPassword,
      role,
      ...extraData,
    });

    const token = jwt.sign(
      { id: newUser._id, role: newUser.role, email: newUser.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.status(201).json({
      message: `${role.charAt(0).toUpperCase() + role.slice(1)} registered successfully`,
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 2. LOGIN ROUTE
router.post("/login", async (req, res) => {
  try {
    const { role, email, password, adminId, phone, pmKisanIdOrAadhaar, regulatorId } = req.body;

    if (!role || !password) {
      return res.status(400).json({ error: "Role and password are required" });
    }

    let user = null;

    if (role === "admin") {
      if (!adminId || !email) {
        return res.status(400).json({ error: "Admin ID and Email are required for Admin login" });
      }
      user = await User.findOne({ role: "admin", adminId, email });
    } else if (role === "farmer") {
      if (!pmKisanIdOrAadhaar || !phone) {
        return res.status(400).json({
          error: "PM-KISAN ID/Aadhaar and Phone Number are required for Farmer login",
        });
      }
      // Phone number must match the registered farmer account
      user = await User.findOne({
        role: "farmer",
        phone,
        $or: [
          { pmKisanId: pmKisanIdOrAadhaar },
          { aadhaarNumber: pmKisanIdOrAadhaar },
        ],
      });
    } else if (role === "regulator") {
      if (!regulatorId || !email) {
        return res.status(400).json({
          error: "Regulator ID and Official Email are required for Regulator login",
        });
      }
      user = await User.findOne({ role: "regulator", regulatorId, email });
    } else if (role === "customer") {
      if (!email || !phone) {
        return res.status(400).json({
          error: "Email and Phone Number are required for Customer login",
        });
      }
      user = await User.findOne({ role: "customer", email, phone });
    } else {
      return res.status(400).json({ error: "Invalid role specified" });
    }

    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role, email: user.email },
      JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        ...(user.adminId && { adminId: user.adminId }),
        ...(user.regulatorId && { regulatorId: user.regulatorId }),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 3. REGULATOR APPLICATION SUBMISSION
router.post("/apply", async (req, res) => {
  try {
    const { name, department, organization, officialEmail, phone, governmentId, designation } = req.body;

    if (!name || !department || !organization || !officialEmail || !phone || !governmentId || !designation) {
      return res.status(400).json({ error: "All fields are required" });
    }

    // Check if an application with the email already exists
    const existingApp = await RegulatorApplication.findOne({ officialEmail });
    if (existingApp) {
      return res.status(400).json({ error: "An application with this email already exists" });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: officialEmail });
    if (existingUser) {
      return res.status(400).json({ error: "A user with this email is already registered" });
    }

    const application = await RegulatorApplication.create({
      name,
      department,
      organization,
      officialEmail,
      phone,
      governmentId,
      designation,
      status: "Pending",
    });

    res.status(201).json({
      message: "Regulator application submitted successfully",
      application,
    });
  } catch (error) {
    console.error("Application submission error:", error);
    res.status(500).json({ error: error.message });
  }
});

// 4. ADMIN APPROVAL ARCHITECTURE (Phase 1 endpoint framework)
router.get("/admin/applications", authenticateJWT, requireRole(["admin"]), async (req, res) => {
  try {
    const apps = await RegulatorApplication.find().sort({ createdAt: -1 });
    res.json({ applications: apps });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post("/admin/approve/:appId", authenticateJWT, requireRole(["admin"]), async (req, res) => {
  try {
    const app = await RegulatorApplication.findById(req.params.appId);
    if (!app) {
      return res.status(404).json({ error: "Application not found" });
    }
    if (app.status !== "Pending") {
      return res.status(400).json({ error: `Application is already ${app.status}` });
    }

    // Generate Regulator ID and Temp Password
    const regulatorId = generateRegulatorId();
    const tempPassword = generateTempPassword();

    // Hash password
    const hashedPassword = await bcrypt.hash(tempPassword, 10);

    // Create user account
    const user = await User.create({
      name: app.name,
      email: app.officialEmail,
      phone: app.phone,
      password: hashedPassword,
      role: "regulator",
      regulatorId,
    });

    // Update application
    app.status = "Approved";
    await app.save();

    res.json({
      message: "Application approved and regulator account created",
      regulator: {
        regulatorId,
        temporaryPassword: tempPassword,
        email: user.email,
        name: user.name,
      },
    });
  } catch (error) {
    console.error("Approve error:", error);
    res.status(500).json({ error: error.message });
  }
});

router.post("/admin/reject/:appId", authenticateJWT, requireRole(["admin"]), async (req, res) => {
  try {
    const app = await RegulatorApplication.findById(req.params.appId);
    if (!app) {
      return res.status(404).json({ error: "Application not found" });
    }
    if (app.status !== "Pending") {
      return res.status(400).json({ error: `Application is already ${app.status}` });
    }

    app.status = "Rejected";
    await app.save();

    res.json({ message: "Application rejected successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;

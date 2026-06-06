const express = require("express");
const { getCrops, getRulesForCrop } = require("../services/rulesService");

const router = express.Router();

router.get("/", (_req, res) => {
  res.json({ crops: getCrops() });
});

router.get("/:crop/rules", (req, res) => {
  try {
    const rules = getRulesForCrop(req.params.crop);
    res.json({ rules });
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
});

module.exports = router;

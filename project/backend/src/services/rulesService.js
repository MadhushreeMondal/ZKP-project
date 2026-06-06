const fs = require("fs");
const path = require("path");
const { parse } = require("csv-parse/sync");

const RULES_PATH = path.join(__dirname, "..", "..", "..", "crop_rules.csv");

let rulesCache = null;

function loadRules() {
  if (rulesCache) return rulesCache;

  const csv = fs.readFileSync(RULES_PATH, "utf-8");
  const records = parse(csv, { columns: true, skip_empty_lines: true });

  rulesCache = records.map((row) => ({
    crop: row.Crop.trim(),
    minYield: Number(row.MinYield),
    maxPesticide: Number(row.MaxPesticide),
    minInventory: Number(row.MinInventory),
    minTemperature: Number(row.MinTemperature),
    maxTemperature: Number(row.MaxTemperature),
    minPrice: Number(row.MinPrice),
    maxPrice: Number(row.MaxPrice),
  }));

  return rulesCache;
}

function getCrops() {
  return loadRules().map((r) => r.crop).sort();
}

function getRulesForCrop(crop) {
  const rules = loadRules().find(
    (r) => r.crop.toLowerCase() === crop.toLowerCase()
  );
  if (!rules) {
    throw new Error(`No compliance rules found for crop: ${crop}`);
  }
  return rules;
}

function validateCompliance(data, rules) {
  const errors = [];

  if (data.yield < rules.minYield) {
    errors.push(`Yield must be >= ${rules.minYield}`);
  }
  if (data.pesticide > rules.maxPesticide) {
    errors.push(`Pesticide must be <= ${rules.maxPesticide}`);
  }
  if (data.inventory < rules.minInventory) {
    errors.push(`Inventory must be >= ${rules.minInventory}`);
  }
  if (data.temperature < rules.minTemperature || data.temperature > rules.maxTemperature) {
    errors.push(
      `Temperature must be between ${rules.minTemperature} and ${rules.maxTemperature}`
    );
  }
  if (data.price < rules.minPrice || data.price > rules.maxPrice) {
    errors.push(`Price must be between ${rules.minPrice} and ${rules.maxPrice}`);
  }

  return { valid: errors.length === 0, errors };
}

module.exports = {
  loadRules,
  getCrops,
  getRulesForCrop,
  validateCompliance,
};

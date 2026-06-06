import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  headers: { "Content-Type": "application/json" },
});

export const getCrops = () => api.get("/crops").then((r) => r.data.crops);

export const getCropRules = (crop) =>
  api.get(`/crops/${encodeURIComponent(crop)}/rules`).then((r) => r.data.rules);

export const submitCompliance = (payload) =>
  api.post("/compliance/submit", payload).then((r) => r.data);

export const getRegulatorRecords = () =>
  api.get("/compliance/regulator").then((r) => r.data.records);

export default api;
